import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommentsService } from '../services/comments.service';
import { product } from '../data-type';
import {ChatService} from "../services/chat.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  popularProduct: product[] | undefined;
  campaignProducts: product[] | undefined;
  allProduct: product[] | undefined;

  isChatOpen = false;
  messages: { text: string; isUser: boolean }[] = [];
  newMessage = '';

  selectedProducts: product[] = [];
  products: product[] = []; // Ürün listesi

  comparisonHistory: { products: product[]; date: Date }[] = [];
  showComparison: boolean = true; // Karşılaştırma bileşenini kontrol etmek için


  constructor(
    private productService: ProductService,
    private commentsService: CommentsService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Fetch all products
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products;
      this.commentsService.getAllComments().subscribe((comments) => {
        // Map products to include comment count
        this.allProduct = products.map((product) => ({
          ...product,
          commentCount: comments.filter((comment) => comment.productId === product.id).length,
        }));

        // Filter campaign products
        this.campaignProducts = this.allProduct.filter((item) => item.isCampaign);

        // Filter popular products
        this.popularProduct = this.allProduct.filter((item) => item.isPopular);
      });
    });
  }

  loadMessages(): void {
    this.chatService.getMessages().subscribe((messages) => {
      this.messages = messages;
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message = {
        text: this.newMessage,
        isUser: true,
        timestamp: new Date().toISOString(),
        answeredBySeller: false, // Varsayılan değer
      };

      // Mesajı listeye ekle ve UI'yi güncelle
      this.messages.push(message);
      this.newMessage = '';

      // Mesajı database'e kaydet
      this.chatService.saveMessage(message).subscribe(() => {
      });

      // Destek mesajını simüle et
      setTimeout(() => {
        const supportMessage = {
          text: 'Destek ekibi yakında sizinle iletişime geçecektir.',
          isUser: false,
          timestamp: new Date().toISOString(),
          answeredBySeller: false, // Varsayılan değer
        };
        this.messages.push(supportMessage);

        // Destek mesajını database'e kaydet
        this.chatService.saveMessage(supportMessage).subscribe(() => {
        });
      }, 1000);
    }
  }


  addToCompare(product: product): void {
    if (!this.selectedProducts.find(p => p.id === product.id)) {
      this.selectedProducts.push(product);
    } else {
      alert('Bu ürün zaten karşılaştırmaya eklendi.');
    }
  }

  handleComparisonSaved(): void {
    // Karşılaştırma kaydedildiğinde app-compare bileşenini gizle
    this.showComparison = false;
  }
}
