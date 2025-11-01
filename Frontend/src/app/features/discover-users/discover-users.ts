import { Component, OnInit, signal } from '@angular/core';
import { SubscriptionService } from '../../core/services';
import { Router } from '@angular/router';
import { UserProfileModel } from '../../shared/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-discover-users',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './discover-users.html',
  styleUrl: './discover-users.scss',
})
export class DiscoverUsers implements OnInit {
  allUsers = signal<UserProfileModel[]>([]);
  filteredUsers = signal<UserProfileModel[]>([]);
  searchQuery = signal('');

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  followingInProgress = signal<Set<number>>(new Set());

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getAllUsers().subscribe({
      next: (users) => {
        // Filter out current user (isOwnProfile = true)
        const otherUsers = users.filter((user) => !user.isOwnProfile);

        this.allUsers.set(otherUsers);
        this.filteredUsers.set(otherUsers);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load users. Please try again.');
      },
    });
  }

  /**
   * Filter users based on search query
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query.toLowerCase().trim());

    if (!query) {
      this.filteredUsers.set(this.allUsers());
      return;
    }

    const filtered = this.allUsers().filter((user) =>
      user.username.toLowerCase().includes(this.searchQuery()),
    );

    this.filteredUsers.set(filtered);
  }

  handleFollowToggle(user: UserProfileModel): void {
    // Prevent multiple simultaneous requests for same user
    if (this.followingInProgress().has(user.userId)) {
      return;
    }

    const isCurrentlyFollowing = user.isFollowing;

    // Add to in-progress set
    this.followingInProgress.update((set) => new Set(set).add(user.userId));

    const action$ = isCurrentlyFollowing
      ? this.subscriptionService.unfollowUser(user.userId)
      : this.subscriptionService.followUser(user.userId);

    action$.subscribe({
      next: (response) => {
        // Update user in both lists
        this.updateUserFollowStatus(user.userId, response.isFollowing);

        // Remove from in-progress
        this.followingInProgress.update((set) => {
          const newSet = new Set(set);
          newSet.delete(user.userId);
          return newSet;
        });
      },
      error: (error) => {
        // Remove from in-progress
        this.followingInProgress.update((set) => {
          const newSet = new Set(set);
          newSet.delete(user.userId);
          return newSet;
        });

        alert(error.message || 'Failed to update follow status. Please try again.');
      },
    });
  }

  private updateUserFollowStatus(userId: number, isFollowing: boolean): void {
    this.allUsers.update((users) =>
      users.map((u) =>
        u.userId === userId
          ? {
              ...u,
              isFollowing,
              followersCount: isFollowing
                ? u.followersCount + 1
                : Math.max(0, u.followersCount - 1),
            }
          : u,
      ),
    );

    this.filteredUsers.update((users) =>
      users.map((u) =>
        u.userId === userId
          ? {
              ...u,
              isFollowing,
              followersCount: isFollowing
                ? u.followersCount + 1
                : Math.max(0, u.followersCount - 1),
            }
          : u,
      ),
    );
  }

  goToProfile(user: UserProfileModel): void {
    this.router.navigate(['/users', user.userId]);
  }

  isFollowInProgress(userId: number): boolean {
    return this.followingInProgress().has(userId);
  }

  getFollowButtonText(user: UserProfileModel): string {
    return user.isFollowing ? 'Following' : 'Follow';
  }

  getFollowButtonIcon(user: UserProfileModel): string {
    return user.isFollowing ? 'check' : 'person_add';
  }
}
