import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/messages'; // Mesajlar için API URL'i

  constructor(private http: HttpClient) {}

  saveMessage(message: { text: string; isUser: boolean; timestamp: string; answeredBySeller: boolean }): Observable<any> {
    return this.http.post(this.apiUrl, message);
  }

  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMessagesByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }


}
