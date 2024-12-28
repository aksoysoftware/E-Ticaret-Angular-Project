import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comments {
    id?: string;
    productId?: number;
    userId?: string;
    content: string;
    timestamp: string;
    userName: string;
}

@Injectable({
    providedIn: 'root',
})
export class CommentsService {
    private baseUrl = 'http://localhost:3000/comments';

    constructor(private http: HttpClient) {}

    getCommentsByProductId(productId: string | null): Observable<Comments[]> {
        return this.http.get<Comments[]>(`${this.baseUrl}?productId=${productId}`);
    }

    addComment(comment: Comments): Observable<Comments> {
        return this.http.post<Comments>(this.baseUrl, comment);
    }


    updateComment(commentId: string, updatedComment: Partial<Comments>): Observable<Comments> {
        return this.http.patch<Comments>(`${this.baseUrl}/${commentId}`, updatedComment);
    }


    deleteComment(commentId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${commentId}`);
    }
}
