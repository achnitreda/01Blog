import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { AdminPost } from '../../../shared/models';
import { AdminService } from '../../../core/services/admin.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

type PostFilter = 'all' | 'visible' | 'hidden';

@Component({
  selector: 'app-admin-posts',
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
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss',
})
export class AdminPosts implements OnInit {
  allPosts = signal<AdminPost[]>([]);
  searchQuery = signal('');
  currentFilter = signal<PostFilter>('all');

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isActionLoading = signal<number | null>(null);

  filteredPosts = computed(() => {
    let posts = this.allPosts();

    const filter = this.currentFilter();
    if (filter === 'visible') {
      posts = posts.filter((p) => !p.hidden);
    } else if (filter === 'hidden') {
      posts = posts.filter((p) => p.hidden);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.authorUsername.toLowerCase().includes(query),
      );
    }

    return posts;
  });

  displayedColumns: string[] = [
    'title',
    'author',
    'status',
    'likes',
    'comments',
    'created',
    'actions',
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllPosts().subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load posts');
      },
    });
  }

  setFilter(filter: PostFilter): void {
    this.currentFilter.set(filter);
  }

  getFilterCount(filter: PostFilter): number {
    const posts = this.allPosts();
    if (filter === 'all') return posts.length;
    if (filter === 'visible') return posts.filter((p) => !p.hidden).length;
    if (filter === 'hidden') return posts.filter((p) => p.hidden).length;
    return 0;
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  viewPost(postId: number): void {
    this.router.navigate(['/posts', postId]);
  }

  hidePost(post: AdminPost): void {
    if (post.hidden) {
      return;
    }

    const reason = prompt(`Enter reason for hiding "${post.title}":`);
    if (!reason || reason.trim().length === 0) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to hide this post?\n\nTitle: "${post.title}"\nAuthor: @${post.authorUsername}\nReason: ${reason}\n\nThis will make it invisible to all users.`,
    );

    if (!confirmed) {
      return;
    }

    this.isActionLoading.set(post.id);

    this.adminService.hidePost(post.id, reason.trim()).subscribe({
      next: (updatedPost) => {
        this.allPosts.update((posts) =>
          posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
        );

        this.isActionLoading.set(null);
      },

      error: (error) => {
        console.error('Failed to hide post:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }

  unhidePost(post: AdminPost): void {
    if (!post.hidden) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to unhide this post?\n\nTitle: "${post.title}"\nAuthor: @${post.authorUsername}\n\nIt will become visible to all users again.`,
    );

    if (!confirmed) {
      return;
    }

    this.isActionLoading.set(post.id);
    this.adminService.unhidePost(post.id).subscribe({
      next: (updatedPost) => {
        this.allPosts.update((posts) =>
          posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
        );
        this.isActionLoading.set(null);
      },
      error: (error) => {
        console.error('Failed to unhide post:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }

  deletePost(post: AdminPost): void {
    const confirmText = prompt(
      `⚠️ WARNING: This will PERMANENTLY delete "${post.title}".\n\n` +
        `This action CANNOT be undone.\n\n` +
        `Type "DELETE" to confirm:`,
    );

    if (confirmText !== 'DELETE') {
      return;
    }

    this.isActionLoading.set(post.id);

    this.adminService.deletePost(post.id).subscribe({
      next: (response) => {
        this.allPosts.update((posts) => posts.filter((p) => p.id !== post.id));

        this.isActionLoading.set(null);
      },
      error: (error) => {
        console.error('Failed to delete post:', error.message);
        this.isActionLoading.set(null);
      },
    });
  }

  isPostActionLoading(postId: number): boolean {
    return this.isActionLoading() === postId;
  }

  truncateText(text: string, maxLength: number = 60): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  retry(): void {
    this.loadPosts();
  }
}
