import { Post } from './post.model';

export interface DashboardStats {
  totalPosts: number;
  totalMedia: number;
  totalUsers?: number;
  recentPosts: Post[];
}
