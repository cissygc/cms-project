import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { unsavedChangesGuard } from './guards/post-editor.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./pages/posts-list/posts-list.component').then((m) => m.PostsListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'posts/new',
    loadComponent: () =>
      import('./pages/post-editor/post-editor.component').then((m) => m.PostEditorComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'posts/edit/:slug',
    loadComponent: () =>
      import('./pages/post-editor/post-editor.component').then((m) => m.PostEditorComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'media',
    loadComponent: () =>
      import('./pages/media-library/media-library.component').then(
        (m) => m.MediaLibraryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'collections',
    loadComponent: () =>
      import('./pages/collections-list/collections-list.component').then(
        (m) => m.CollectionsListComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'tags',
    loadComponent: () =>
      import('./pages/tags-list/tags-list.component').then((m) => m.TagsListComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users-list/users-list.component').then((m) => m.UsersListComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];