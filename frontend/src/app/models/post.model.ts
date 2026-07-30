export type PostStatus = 'draft' | 'in_review' | 'published';

export interface Post {
  id?: number;
  slug: string;
  title: string;
  content: string;
  image?: string;
  authorName?: string;
  status?: PostStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostPayload {
  slug?: string;
  title: string;
  content: string;
  image?: string;
  status?: PostStatus;
}
