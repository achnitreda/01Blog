import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './core/guards';
import { Admin } from './features/admin/admin';
import { Feed } from './features/feed/feed';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { PostDetail } from './features/post-detail/post-detail';
import { MyProfile } from './features/my-profile/my-profile';
import { DiscoverUsers } from './features/discover-users/discover-users';
import { UserProfile } from './features/user-profile/user-profile';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feed',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  // Protected routes (require authentication)
  {
    path: 'feed',
    component: Feed,
    canActivate: [authGuard],
  },
  {
    path: 'discover',
    component: DiscoverUsers,
    canActivate: [authGuard],
  },
  {
    path: 'my-profile',
    component: MyProfile,
    canActivate: [authGuard],
  },
  {
    path: 'users/:userId',
    component: UserProfile,
    canActivate: [authGuard],
  },
  {
    path: 'posts/:id',
    component: PostDetail,
    canActivate: [authGuard],
  },
  // Admin routes (require admin role)
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users/admin-users').then((m) => m.AdminUsers),
      },
      {
        path: 'posts',
        loadComponent: () =>
          import('./features/admin/admin-posts/admin-posts').then((m) => m.AdminPosts),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/admin-reports/admin-reports').then((m) => m.AdminReports),
      },
    ],
  },
  // Fallback route
  {
    path: '**',
    redirectTo: '/feed',
  },
];
