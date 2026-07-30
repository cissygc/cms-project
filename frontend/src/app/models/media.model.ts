export interface MediaItem {
  id: number | string;
  name: string;
  url: string;
  size?: number;
  path?: string;
  displayURL?: string;
  createdAt?: string;
}
