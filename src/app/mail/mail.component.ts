import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent {
  userEmail: string = '';
  messageContent: string = '';
  confirmationMessage: string = '';

  constructor(private http: HttpClient) {}

  sendMessage(): void {
    const messageData = {
      email: this.userEmail,
      message: this.messageContent,
      timestamp: new Date().toISOString()
    };

    this.http.post('http://localhost:3000/messages', messageData).subscribe(() => {
      this.confirmationMessage = 'Mesajınız gönderilmiştir. Satıcı sizinle iletişime geçecektir.';
      this.resetForm();
    });
  }

  resetForm(): void {
    this.userEmail = '';
    this.messageContent = '';
  }
}
