import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  navItems = [
    {
      path: '/admin/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      path: '/admin/users',
      icon: 'people',
      label: 'Users',
    },
    {
      path: '/admin/posts',
      icon: 'article',
      label: 'Posts',
    },
    {
      path: '/admin/reports',
      icon: 'flag',
      label: 'Reports',
    },
  ];

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
