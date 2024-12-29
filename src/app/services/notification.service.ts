import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:3000/messages';

  constructor(private http: HttpClient) {}

  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getUnreadMessagesCount(): Observable<number> {
    return this.http.get<any[]>(`${this.baseUrl}?read=false`).pipe(map(messages => messages.length));
  }

  markMessageAsRead(messageId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${messageId}`, { read: true });
  }
}
