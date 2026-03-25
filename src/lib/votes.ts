import { prisma } from "@/lib/db";

type VoteKind = "post" | "comment";

function deltas(existingValue: number | null, nextValue: number) {
  if (existingValue === null) {
    return {
      finalValue: nextValue,
      deleteExisting: false,
      scoreDelta: nextValue,
      upvoteDelta: nextValue === 1 ? 1 : 0,
      downvoteDelta: nextValue === -1 ? 1 : 0,
      karmaDelta: nextValue,
    };
  }

  if (existingValue === nextValue) {
    return {
      finalValue: 0,
      deleteExisting: true,
      scoreDelta: -existingValue,
      upvoteDelta: existingValue === 1 ? -1 : 0,
      downvoteDelta: existingValue === -1 ? -1 : 0,
      karmaDelta: -existingValue,
    };
  }

  return {
    finalValue: nextValue,
    deleteExisting: false,
    scoreDelta: nextValue - existingValue,
    upvoteDelta: nextValue === 1 ? 1 : -1,
    downvoteDelta: nextValue === -1 ? 1 : -1,
    karmaDelta: nextValue - existingValue,
  };
}

export async function applyVote(kind: VoteKind, userId: string, targetId: string, nextValue: 1 | -1) {
  return prisma.$transaction(async (tx) => {
    if (kind === "post") {
      const post = await tx.post.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!post) {
        throw new Error("NOT_FOUND");
      }

      const existing = await tx.vote.findFirst({
        where: {
          userId,
          postId: targetId,
        },
      });

      const change = deltas(existing?.value ?? null, nextValue);

      if (existing && change.deleteExisting) {
        await tx.vote.delete({
          where: {
            id: existing.id,
          },
        });
      } else if (existing) {
        await tx.vote.update({
          where: {
            id: existing.id,
          },
          data: {
            value: change.finalValue,
          },
        });
      } else {
        await tx.vote.create({
          data: {
            userId,
            postId: targetId,
            value: nextValue,
          },
        });
      }

      const updatedPost = await tx.post.update({
        where: { id: targetId },
        data: {
          score: {
            increment: change.scoreDelta,
          },
          upvotes: {
            increment: change.upvoteDelta,
          },
          downvotes: {
            increment: change.downvoteDelta,
          },
        },
      });

      await tx.user.update({
        where: { id: post.authorId },
        data: {
          karma: {
            increment: change.karmaDelta,
          },
        },
      });

      return updatedPost;
    }

    const comment = await tx.comment.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      throw new Error("NOT_FOUND");
    }

    const existing = await tx.vote.findFirst({
      where: {
        userId,
        commentId: targetId,
      },
    });

    const change = deltas(existing?.value ?? null, nextValue);

    if (existing && change.deleteExisting) {
      await tx.vote.delete({
        where: {
          id: existing.id,
        },
      });
    } else if (existing) {
      await tx.vote.update({
        where: {
          id: existing.id,
        },
        data: {
          value: change.finalValue,
        },
      });
    } else {
      await tx.vote.create({
        data: {
          userId,
          commentId: targetId,
          value: nextValue,
        },
      });
    }

    const updatedComment = await tx.comment.update({
      where: { id: targetId },
      data: {
        score: {
          increment: change.scoreDelta,
        },
        upvotes: {
          increment: change.upvoteDelta,
        },
        downvotes: {
          increment: change.downvoteDelta,
        },
      },
    });

    await tx.user.update({
      where: { id: comment.authorId },
      data: {
        karma: {
          increment: change.karmaDelta,
        },
      },
    });

    return updatedComment;
  });
}
