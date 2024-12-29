import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';

export interface Comments {
  averageRating: number;
  ratings: any;
  id?: string;
  productId?: string;
  userId?: string;
  content: string;
  timestamp: string;
  userName: string;
  replies?: Reply[]; // Yeni alan
  currentUserRating?: number; // Yeni alan eklendi
  replyContent?: string;
}

export interface Reply {
  id?: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private baseUrl = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {
  }

  addReply(commentId: string, reply: Reply): Observable<Reply> {
    return this.http.post<Reply>(`http://localhost:3000/comments/${commentId}/replies`, reply);
  }





  getReplies(commentId: string): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.baseUrl}/api/replies/${commentId}`);
  }

  getCommentsByProductId(productId: string | null): Observable<Comments[]> {
    return this.http.get<Comments[]>(`${this.baseUrl}?productId=${productId}`);
  }

  addReplyToComment(commentId: string | undefined, reply: Reply): Observable<Comments> {
    return this.http.post<Comments>(`/api/comments/${commentId}/reply`, reply);
  }


  addComment(comment: Comments): Observable<Comments> {
    return this.http.post<Comments>(this.baseUrl, comment);
  }


  updateComment(commentId: string | undefined, updatedComment: Partial<Comments>): Observable<Comments> {
    return this.http.patch<Comments>(`${this.baseUrl}/${commentId}`, updatedComment);
  }


  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${commentId}`);
  }

  rateComment(commentId: string | undefined, userId: string, stars: number): Observable<Comments> {
    return this.http.get<Comments>(`${this.baseUrl}/${commentId}`).pipe(
      switchMap((comment) => {
        const existingRatingIndex = comment.ratings?.findIndex((r: { userId: string; }) => r.userId === userId);
        if (existingRatingIndex !== undefined && existingRatingIndex >= 0) {
          comment.ratings![existingRatingIndex].stars = stars;
        } else {
          if (!comment.ratings) {
            comment.ratings = [];
          }
          comment.ratings.push({userId, stars});
        }
        comment.averageRating = this.calculateAverage(comment.ratings);
        return this.updateComment(commentId, {ratings: comment.ratings, averageRating: comment.averageRating});
      })
    );
  }

  private calculateAverage(ratings: { userId: string; stars: number }[]): number {
    const total = ratings.reduce((sum, rating) => sum + rating.stars, 0);
    return ratings.length > 0 ? total / ratings.length : 0;
  }

  getAllComments(): Observable<Comments[]> {
    return this.http.get<Comments[]>(this.baseUrl);
  }
}
