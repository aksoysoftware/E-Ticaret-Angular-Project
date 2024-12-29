import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  answeredBySeller: boolean;
  read: boolean;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  messages: Message[] = [];
  unreadCount: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.http.get<Message[]>('http://localhost:3000/messages').subscribe((data) => {
      this.messages = data;
      this.unreadCount = this.messages.filter(msg => !msg.read).length;
    });
  }

  markAsRead(messageId: string): void {
    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > -1) {
      this.messages[messageIndex].read = true;
      this.unreadCount = this.messages.filter(msg => !msg.read).length;

      // Update message in the database
      this.http.patch(`http://localhost:3000/messages/${messageId}`, { read: true }).subscribe();
    }
  }

  respondToMessage(messageId: string, responseText: string): void {
    const newMessage = {
      id: this.generateRandomId(),
      text: responseText,
      isUser: false,
      timestamp: new Date().toISOString(),
      answeredBySeller: true,
      read: true
    };

    this.http.post('http://localhost:3000/messages', newMessage).subscribe(() => {
      this.messages.push(newMessage);
      this.markAsRead(messageId); // Mark original message as read
    });
  }

  generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
