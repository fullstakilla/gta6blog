export type ArticleTag =
  | "TRAILER"
  | "LEAK"
  | "MAP"
  | "CHARACTER"
  | "GAMEPLAY"
  | "RUMOR";

export type ArticleStatus = "draft" | "published" | "archived";

export type ReactionType =
  | "fire"
  | "love"
  | "laugh"
  | "think"
  | "hundred";

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Author {
  id: string;
  name: string;
  email?: string;
  role?: "author" | "editor" | "admin";
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: ArticleTag;
  tags: string[];
  author: Pick<Author, "id" | "name">;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  meta_title: string | null;
  meta_desc: string | null;
  is_hero: boolean;
  reactions?: Record<ReactionType, number>;
}

export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  status: CommentStatus;
  created_at: string;
}

export interface Subscriber {
  email: string;
  confirmed: boolean;
  subscribed_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: { code: string; message: string };
}
