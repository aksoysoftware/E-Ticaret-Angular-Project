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
  messages: { text: string; isUser: boolean; timestamp: string; answeredBySeller?: boolean }[] = [];
  newMessage = '';

  selectedProducts: product[] = [];
  products: product[] = []; // Ürün listesi

  comparisonHistory: { products: product[]; date: Date }[] = [];
  showComparison: boolean = true; // Karşılaştırma bileşenini kontrol etmek için
  userId: string | null = null; // Kullanıcının ID'si

  constructor(
    private productService: ProductService,
    private commentsService: CommentsService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Kullanıcı ID'sini localStorage'den al
    const user = localStorage.getItem('user');
    this.userId = user ? JSON.parse(user).id : null;
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
    this.loadMessages();
  }

  loadMessages(): void {
    if (this.userId) {
      // Sadece bu kullanıcıya ait mesajları getir
      this.chatService.getMessagesByUser(this.userId).subscribe((data) => {
        this.messages = data.map((msg) => ({
          ...msg,
        }));
      });
    }
  }



  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.userId) {
      const newMessage = {
        text: this.newMessage,
        isUser: true,
        timestamp: new Date().toISOString(),
        answeredBySeller: false,
        userId: this.userId, // Kullanıcı ID'sini mesajla ilişkilendir
      };

      this.messages.push(newMessage);
      this.newMessage = '';
      this.chatService.saveMessage(newMessage).subscribe();
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
