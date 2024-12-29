import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-seller-chat',
  templateUrl: './seller-chat.component.html',
  styleUrls: ['./seller-chat.component.css'],
})
export class SellerChatComponent implements OnInit {
  messages: any[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getMessages().subscribe((messages) => {
      this.messages = messages.filter((msg) => !msg.answeredBySeller); // Sadece cevaplanmamış mesajları yükle
    });
  }

  answerMessage(messageId: string, answer: string): void {
    const answeredMessage = {
      ...this.messages.find((msg) => msg.id === messageId),
      text: answer,
      isUser: false,
      answeredBySeller: true,
      timestamp: new Date().toISOString(),
    };

    this.chatService.saveMessage(answeredMessage).subscribe(() => {
      console.log('Mesaj cevaplandı ve kaydedildi');
      this.messages = this.messages.filter((msg) => msg.id !== messageId); // Mesajı listeden kaldır
    });
  }
}
