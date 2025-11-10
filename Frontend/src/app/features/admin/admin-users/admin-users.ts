import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUser } from '../../../shared/models';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

type UserFilter = 'all' | 'active' | 'banned' | 'admins';

@Component({
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  allUsers = signal<AdminUser[]>([]);
  searchQuery = signal('');
  currentFilter = signal<UserFilter>('all');

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isActionLoading = signal<number | null>(null);

  filteredUsers = computed(() => {
    let users = this.allUsers();

    const filter = this.currentFilter();
    if (filter === 'active') {
      users = users.filter((u) => !u.banned);
    } else if (filter === 'banned') {
      users = users.filter((u) => u.banned);
    } else if (filter === 'admins') {
      users = users.filter((u) => u.role === 'ADMIN');
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      users = users.filter(
        (u) => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
      );
    }

    return users;
  });

  displayedColumns: string[] = [
    'username',
    'email',
    'role',
    'status',
    'posts',
    'reports',
    'joined',
    'actions',
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load users');
      },
    });
  }

  setFilter(filter: UserFilter): void {
    this.currentFilter.set(filter);
  }

  getFilterCount(filter: UserFilter): number {
    const users = this.allUsers();
    if (filter === 'all') return users.length;
    if (filter === 'active') return users.filter((u) => !u.banned).length;
    if (filter === 'banned') return users.filter((u) => u.banned).length;
    if (filter === 'admins') return users.filter((u) => u.role === 'ADMIN').length;
    return 0;
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  retry(): void {
    this.loadUsers();
  }

  isAdmin(user: AdminUser): boolean {
    return user.role === 'ADMIN';
  }

  isUserActionLoading(userId: number): boolean {
    return this.isActionLoading() === userId;
  }

  viewProfile(userId: number): void {
    this.router.navigate(['/users', userId]);
  }

  banUser(user: AdminUser): void {
    if (user.banned) {
      return;
    }

    const reason = prompt(`Enter ban reason for @${user.username}:`);
    if (!reason || reason.trim().length === 0) {
      console.log('Ban cancelled - no reason provided');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to ban @${user.username}?\n\nReason: ${reason}\n\nThis will prevent them from accessing the platform.`,
    );

    if (!confirmed) {
      console.log('Ban cancelled');
      return;
    }

    this.isActionLoading.set(user.userId);
    this.adminService.banUser(user.userId, reason.trim()).subscribe({
      next: (updatedUser) => {
        this.allUsers.update((users) =>
          users.map((u) => (u.userId === updatedUser.userId ? updatedUser : u)),
        );

        this.isActionLoading.set(null);
      },
      error: (error) => {
        console.error('Failed to ban user:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }

  unbanUser(user: AdminUser): void {
    if (!user.banned) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to unban @${user.username}?\n\nThey will be able to access the platform again.`,
    );

    if (!confirmed) {
      return;
    }

    this.isActionLoading.set(user.userId);
    this.adminService.unbanUser(user.userId).subscribe({
      next: (updatedUser) => {
        this.allUsers.update((users) =>
          users.map((u) => (u.userId === updatedUser.userId ? updatedUser : u)),
        );

        this.isActionLoading.set(null);
      },
      error: (error) => {
        console.error('Failed to unban user:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }

  deleteUser(user: AdminUser): void {
    const confirmText = prompt(
      `⚠️ WARNING: This will PERMANENTLY delete @${user.username} and ALL their content.\n\n` +
        `This action CANNOT be undone.\n\n` +
        `Type "DELETE" to confirm:`,
    );

    if (confirmText !== 'DELETE') {
      return;
    }

    this.isActionLoading.set(user.userId);
    this.adminService.deleteUser(user.userId).subscribe({
      next: (response) => {
        this.allUsers.update((users) => users.filter((u) => u.userId !== user.userId));

        this.isActionLoading.set(null);
      },
      error: (error) => {
        console.error('Failed to delete user:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }
}
