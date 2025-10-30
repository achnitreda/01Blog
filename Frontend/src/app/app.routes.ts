import { Routes } from '@angular/router';

import { adminGuard, authGuard } from './core/guards';
import { Admin } from './features/admin/admin';
import { Feed } from './features/feed/feed';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { MyPosts } from './features/my-posts/my-posts';
import { PostDetail } from './features/post-detail/post-detail';

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
    path: 'my-posts',
    component: MyPosts,
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
  },
  // Fallback route
  {
    path: '**',
    redirectTo: '/feed',
  },
];
