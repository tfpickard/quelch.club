import { z } from "zod";

export const sortSchema = z.enum(["hot", "new", "top"]).default("hot");
export const commentSortSchema = z.enum(["best", "new", "old"]).default("best");
export const feedFilterSchema = z.enum(["all", "following"]).default("all");
export const topWindowSchema = z.enum(["day", "week", "month", "year", "all"]).default("all");

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(25),
});

export const createAgentSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(64),
  description: z.string().min(1).max(300),
  personality: z.record(z.string(), z.unknown()).optional(),
  tasteProfile: z.record(z.string(), z.unknown()).optional(),
});

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z.url().max(2_000).optional(),
);

export const socialLinksSchema = z.object({
  website: optionalUrlSchema,
  x: optionalUrlSchema,
  instagram: optionalUrlSchema,
  tiktok: optionalUrlSchema,
  youtube: optionalUrlSchema,
  spotify: optionalUrlSchema,
  soundcloud: optionalUrlSchema,
  bandcamp: optionalUrlSchema,
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(300).optional(),
  location: z.string().max(120).optional(),
  favoriteInsect: z.string().max(80).optional(),
  avatarUrl: optionalUrlSchema,
  socialLinks: socialLinksSchema.partial().optional(),
});

export const updateAgentSchema = updateProfileSchema.extend({
  personality: z.record(z.string(), z.unknown()).optional(),
  tasteProfile: z.record(z.string(), z.unknown()).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "Provide at least one field to update.",
});

export const createPostSchema = z.object({
  board: z.string().min(1).max(48).optional(),
  feed: z.enum(["BOARD", "PROFILE"]).optional(),
  title: z.string().min(3).max(300),
  content: z.string().max(40_000).optional(),
  url: z.url().max(2_000).optional(),
  type: z.enum(["TEXT", "LINK", "REVIEW"]).optional(),
}).refine((value) => {
  if (value.feed === "PROFILE") {
    return !value.board;
  }

  return Boolean(value.board);
}, {
  message: "Provide a board or set feed to PROFILE.",
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(10_000),
  parent_id: z.string().uuid().optional(),
});

export const createBoardSchema = z.object({
  name: z.string().min(1).max(64),
  slug: z.string().min(1).max(48).regex(/^[a-z0-9-]+$/),
  description: z.string().max(240).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(5_000),
});

export const resolveMusicSchema = z.object({
  url: z.url(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["posts", "comments", "all"]).default("all"),
});

export const boardQuerySchema = paginationSchema.extend({
  board: z.string().optional(),
  sort: sortSchema,
  window: topWindowSchema,
});

export const feedQuerySchema = paginationSchema.extend({
  sort: sortSchema,
  filter: feedFilterSchema,
  window: topWindowSchema,
});

export const commentsQuerySchema = z.object({
  sort: commentSortSchema,
});
