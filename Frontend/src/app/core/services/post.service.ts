import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { CreatePostRequest, Post, UpdatePostRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  // Signal to track total posts count
  totalPosts = signal<number>(0);

  // BehaviorSubject for posts feed (can be observed by multiple components)
  private feedPostsSubject = new BehaviorSubject<Post[]>([]);
  public feedPosts$ = this.feedPostsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================
  // GET POSTS
  // ============================================

  /**
   * Get personalized feed (posts from followed users)
   */
  getPersonalizedFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/posts/feed`).pipe(
      tap((posts) => {
        this.feedPostsSubject.next(posts);
        this.totalPosts.set(posts.length);
      }),
      catchError(this.handleError),
    );
  }

  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/posts/my-posts`).pipe(
      tap((posts) => {
        console.log(`Fetched ${posts.length} of my posts`);
      }),
      catchError(this.handleError),
    );
  }

  getPostById(postId: number): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${postId}`).pipe(
      tap((post) => {
        console.log(`Fetched post: ${post.title}`);
      }),
      catchError(this.handleError),
    );
  }

  getUserPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/users/${userId}/posts`).pipe(
      tap((posts) => {
        console.log(`Fetched ${posts.length} posts for user ${userId}`);
      }),
      catchError(this.handleError),
    );
  }

  // ============================================
  // (CREATE | UPDATE | DELETE) POST
  // ============================================

  createPost(postData: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${environment.apiUrl}/posts`, postData).pipe(
      tap((post) => {
        console.log(`Post created successfully: ${post.id}`);

        // Add new post to feed
        const currentPosts = this.feedPostsSubject.value;
        this.feedPostsSubject.next([post, ...currentPosts]); // Add to beginning
        this.totalPosts.set(currentPosts.length + 1);
      }),
      catchError(this.handleError),
    );
  }

  createPostWithFile(title: string, content: string, media: File | null): Observable<Post> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    return this.http.post<Post>(`${environment.apiUrl}/posts`, formData).pipe(
      tap((post) => {
        console.log(`Post created successfully: ${post.id}`);

        // Add new post to feed
        const currentPosts = this.feedPostsSubject.value;
        this.feedPostsSubject.next([post, ...currentPosts]); // Add to beginning
        this.totalPosts.set(currentPosts.length + 1);
      }),
      catchError(this.handleError),
    );
  }

  updatePost(postId: number, postData: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${environment.apiUrl}/posts/${postId}`, postData).pipe(
      tap((updatedPost) => {
        console.log(`Post ${postId} updated successfully`);

        // Update post in feed
        const currentPosts = this.feedPostsSubject.value;
        const updatedPosts = currentPosts.map((post) => (post.id === postId ? updatedPost : post));
        this.feedPostsSubject.next(updatedPosts);
      }),
      catchError(this.handleError),
    );
  }

  updatePostWithFile(
    postId: number,
    title?: string,
    content?: string,
    media?: File | null,
  ): Observable<Post> {
    const formData = new FormData();
    if (title) {
      formData.append('title', title);
    }
    if (content) {
      formData.append('content', content);
    }
    if (media) {
      formData.append('media', media);
    }
    return this.http.put<Post>(`${environment.apiUrl}/posts/${postId}`, formData).pipe(
      tap((updatedPost) => {
        console.log(`Post ${postId} updated successfully`);

        // Update post in feed
        const currentPosts = this.feedPostsSubject.value;
        const updatedPosts = currentPosts.map((post) => (post.id === postId ? updatedPost : post));
        this.feedPostsSubject.next(updatedPosts);
      }),
      catchError(this.handleError),
    );
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${postId}`).pipe(
      tap(() => {
        console.log(`Post ${postId} deleted successfully`);

        // Remove post from feed
        const currentPosts = this.feedPostsSubject.value;
        const updatedPosts = currentPosts.filter((post) => post.id !== postId);
        this.feedPostsSubject.next(updatedPosts);
        this.totalPosts.set(updatedPosts.length);
      }),
      catchError(this.handleError),
    );
  }

  // ============================================
  // LIKE / UNLIKE
  // ============================================

  likePost(postId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/posts/${postId}/like`, {}).pipe(
      tap(() => {
        console.log(`Post ${postId} liked`);

        // Update post in feed
        this.updatePostLikeStatus(postId, true, 1);
      }),
      catchError(this.handleError),
    );
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${postId}/unlike`).pipe(
      tap(() => {
        console.log(`Post ${postId} unliked`);

        // Update post in feed
        this.updatePostLikeStatus(postId, false, -1);
      }),
      catchError(this.handleError),
    );
  }

  toggleLike(post: Post): Observable<void> {
    if (post.isLiked) {
      return this.unlikePost(post.id);
    } else {
      return this.likePost(post.id);
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private updatePostLikeStatus(postId: number, isLiked: boolean, countChange: number): void {
    const currentPosts = this.feedPostsSubject.value;
    const updatedPosts = currentPosts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: isLiked,
          likesCount: post.likesCount + countChange,
        };
      }
      return post;
    });
    this.feedPostsSubject.next(updatedPosts);
  }

  /**
   * Clear feed (useful for logout)
   */
  clearFeed(): void {
    this.feedPostsSubject.next([]);
    this.totalPosts.set(0);
    console.log('Feed cleared');
  }

  /**
   * Refresh feed
   */
  refreshFeed(): Observable<Post[]> {
    console.log('Refreshing feed...');
    return this.getPersonalizedFeed();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.details) {
        // Validation errors
        const details = error.error.details;
        const firstError = Object.values(details)[0] as string;
        errorMessage = firstError || errorMessage;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
