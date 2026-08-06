// Backend'den GET ile geldiğinde bir kullanıcının tam hali
export interface User {
  id: number;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string; // backend zaten tam URL olarak gönderiyor
  slug?: string;
  role: 'ADMIN' | 'EDITOR';
  deleted: boolean;
  postCount: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface LoginPayload {
  username: string;
  password: string;
}

// Admin yeni bir editör/admin OLUŞTURURKEN gönderdiği veri.
// fullName artık ZORUNLU (backend bunu istiyor).
export interface SignupPayload {
  username: string;
  password: string;
  role: 'ADMIN' | 'EDITOR';
  fullName: string;
  bio?: string;
  avatarMediaId?: number;
  slug?: string;
}

// Kullanıcının KENDİ profilini güncellerken gönderdiği veri (hepsi opsiyonel,
// göndermediğin alan olduğu gibi kalır)
export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  avatarMediaId?: number;
  // true gönderilirse avatar bilerek kaldırılır. Gönderilmezse (ve
  // avatarMediaId de yoksa) mevcut avatar korunur - backend'in davranışı budur.
  removeAvatar?: boolean;
  slug?: string;
  username?: string;
  newPassword?: string;
  currentPassword?: string;
}