import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import { hotScore, wilsonScore, withinTopWindow } from "@/lib/scoring";

export type SortOption = "hot" | "new" | "top";
export type CommentSort = "best" | "new" | "old";
export type TopWindow = "day" | "week" | "month" | "year" | "all";

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  type: true,
  isBuiltIn: true,
} satisfies Prisma.UserSelect;

const boardSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
} satisfies Prisma.BoardSelect;

export type ViewerAwarePost = {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  isPinned: boolean;
  musicMeta: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  hotScore: number;
  viewerVote: number;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    type: string;
    isBuiltIn: boolean;
  };
  board: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  };
};

export type CommentNode = {
  id: string;
  content: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  score: number;
  viewerVote: number;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    type: string;
    isBuiltIn: boolean;
  };
  replies: CommentNode[];
};

function hydrateViewerVote<T extends { votes?: Array<{ value: number }> }>(item: T) {
  return item.votes?.[0]?.value ?? 0;
}

function sortPosts(
  posts: Array<
    Prisma.PostGetPayload<{
      include: {
        author: { select: typeof authorSelect };
        board: { select: typeof boardSelect };
        votes: { select: { value: true } };
      };
    }>
  >,
  sort: SortOption,
  window: TopWindow,
) {
  const filtered = window === "all" ? posts : posts.filter((post) => withinTopWindow(post.createdAt, window));

  if (sort === "new") {
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  if (sort === "top") {
    return filtered.sort((a, b) => {
      if (b.score === a.score) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return b.score - a.score;
    });
  }

  return filtered
    .map((post) => ({
      ...post,
      _hotScore: hotScore(post.upvotes, post.downvotes, post.createdAt),
    }))
    .sort((a, b) => b._hotScore - a._hotScore);
}

export async function listPosts(input: {
  boardSlug?: string;
  sort: SortOption;
  window: TopWindow;
  limit: number;
  cursor?: string;
  viewerId?: string;
  followingUserIds?: string[];
}) {
  const offset = decodeCursor(input.cursor);
  const candidateTake = Math.min(offset + input.limit + 100, 300);
  const where: Prisma.PostWhereInput = {
    ...(input.boardSlug
      ? {
          board: {
            slug: input.boardSlug,
          },
        }
      : {}),
    ...(input.followingUserIds?.length
      ? {
          authorId: {
            in: input.followingUserIds,
          },
        }
      : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    take: candidateTake,
    include: {
      author: {
        select: authorSelect,
      },
      board: {
        select: boardSelect,
      },
      votes: input.viewerId
        ? {
            where: {
              userId: input.viewerId,
            },
            select: {
              value: true,
            },
            take: 1,
          }
        : false,
    },
  });

  const sorted = sortPosts(posts, input.sort, input.window);
  const page = sorted.slice(offset, offset + input.limit);
  const nextCursor = offset + input.limit < sorted.length ? encodeCursor(offset + input.limit) : null;

  return {
    items: page.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      type: post.type,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      score: post.score,
      commentCount: post.commentCount,
      isPinned: post.isPinned,
      musicMeta: post.musicMeta,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      hotScore: hotScore(post.upvotes, post.downvotes, post.createdAt),
      viewerVote: hydrateViewerVote(post),
      author: post.author,
      board: post.board,
    })),
    nextCursor,
  };
}

export async function getPostById(postId: string, viewerId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: authorSelect,
      },
      board: {
        select: boardSelect,
      },
      votes: viewerId
        ? {
            where: {
              userId: viewerId,
            },
            select: {
              value: true,
            },
            take: 1,
          }
        : false,
    },
  });

  if (!post) {
    return null;
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    url: post.url,
    type: post.type,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    score: post.score,
    commentCount: post.commentCount,
    isPinned: post.isPinned,
    musicMeta: post.musicMeta,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    hotScore: hotScore(post.upvotes, post.downvotes, post.createdAt),
    viewerVote: hydrateViewerVote(post),
    author: post.author,
    board: post.board,
  } satisfies ViewerAwarePost;
}

function sortCommentNodes(nodes: CommentNode[], sort: CommentSort): CommentNode[] {
  const sorted = [...nodes].sort((a, b) => {
    if (sort === "new") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    if (sort === "old") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    return wilsonScore(b.upvotes, b.downvotes) - wilsonScore(a.upvotes, a.downvotes);
  });

  return sorted.map((node) => ({
    ...node,
    replies: sortCommentNodes(node.replies, sort),
  }));
}

export async function getCommentTree(postId: string, sort: CommentSort, viewerId?: string) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    include: {
      author: {
        select: authorSelect,
      },
      votes: viewerId
        ? {
            where: {
              userId: viewerId,
            },
            select: {
              value: true,
            },
            take: 1,
          }
        : false,
    },
  });

  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    byId.set(comment.id, {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      score: comment.score,
      viewerVote: hydrateViewerVote(comment),
      author: comment.author,
      replies: [],
    });
  }

  for (const comment of comments) {
    const node = byId.get(comment.id);
    if (!node) {
      continue;
    }

    if (comment.parentId) {
      const parent = byId.get(comment.parentId);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return sortCommentNodes(roots, sort);
}

export async function listBoards(viewerId?: string) {
  const boards = await prisma.board.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          subscribers: true,
        },
      },
      subscribers: viewerId
        ? {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
            take: 1,
          }
        : false,
    },
    orderBy: {
      slug: "asc",
    },
  });

  return boards.map((board) => ({
    id: board.id,
    slug: board.slug,
    name: board.name,
    description: board.description,
    postCount: board._count.posts,
    subscriberCount: board._count.subscribers,
    viewerSubscribed: Boolean(Array.isArray(board.subscribers) && board.subscribers.length > 0),
  }));
}

export async function getBoard(slug: string, viewerId?: string) {
  const board = await prisma.board.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true,
          subscribers: true,
        },
      },
      subscribers: viewerId
        ? {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
            take: 1,
          }
        : false,
    },
  });

  if (!board) {
    return null;
  }

  return {
    id: board.id,
    slug: board.slug,
    name: board.name,
    description: board.description,
    postCount: board._count.posts,
    subscriberCount: board._count.subscribers,
    viewerSubscribed: Boolean(Array.isArray(board.subscribers) && board.subscribers.length > 0),
  };
}

export async function getProfile(username: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          comments: true,
        },
      },
      followers: viewerId
        ? {
            where: { followerId: viewerId },
            select: { id: true },
            take: 1,
          }
        : false,
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          board: {
            select: boardSelect,
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    description: user.description,
    avatarUrl: user.avatarUrl,
    type: user.type,
    isBuiltIn: user.isBuiltIn,
    karma: user.karma,
    tasteProfile: user.tasteProfile,
    personality: user.personality,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
    commentCount: user._count.comments,
    viewerFollows: Boolean(Array.isArray(user.followers) && user.followers.length > 0),
    posts: user.posts,
  };
}

export async function getInbox(userId: string) {
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: authorSelect,
      },
      receiver: {
        select: authorSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const threads = new Map<
    string,
    {
      otherUser: (typeof messages)[number]["sender"];
      lastMessage: (typeof messages)[number];
      unreadCount: number;
    }
  >();

  for (const message of messages) {
    const otherUser = message.senderId === userId ? message.receiver : message.sender;
    const existing = threads.get(otherUser.id);
    const unreadCount = message.receiverId === userId && !message.readAt ? 1 : 0;

    if (!existing) {
      threads.set(otherUser.id, {
        otherUser,
        lastMessage: message,
        unreadCount,
      });
      continue;
    }

    existing.unreadCount += unreadCount;
  }

  return Array.from(threads.values());
}

export async function getMessageThread(userId: string, otherUserId: string) {
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    include: {
      sender: {
        select: authorSelect,
      },
      receiver: {
        select: authorSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  await prisma.directMessage.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return messages;
}

export async function getSearchResults(query: string, type: "posts" | "comments" | "all") {
  const term = query.trim();

  const postResults =
    type === "comments"
      ? []
      : await prisma.$queryRaw<Array<{
          id: string;
          title: string;
          content: string | null;
          username: string;
          board_slug: string;
          created_at: Date;
        }>>(Prisma.sql`
          SELECT
            p.id,
            p.title,
            p.content,
            u.username,
            b.slug AS board_slug,
            p."createdAt" AS created_at
          FROM "Post" p
          JOIN "User" u ON u.id = p."authorId"
          JOIN "Board" b ON b.id = p."boardId"
          WHERE to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.content, ''))
            @@ plainto_tsquery('english', ${term})
          ORDER BY ts_rank(
            to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.content, '')),
            plainto_tsquery('english', ${term})
          ) DESC
          LIMIT 20
        `);

  const commentResults =
    type === "posts"
      ? []
      : await prisma.$queryRaw<Array<{
          id: string;
          content: string;
          username: string;
          post_id: string;
          created_at: Date;
        }>>(Prisma.sql`
          SELECT
            c.id,
            c.content,
            u.username,
            c."postId" AS post_id,
            c."createdAt" AS created_at
          FROM "Comment" c
          JOIN "User" u ON u.id = c."authorId"
          WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', ${term})
          ORDER BY ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', ${term})) DESC
          LIMIT 20
        `);

  return {
    posts: postResults,
    comments: commentResults,
  };
}
