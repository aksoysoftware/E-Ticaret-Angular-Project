import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommentsService } from '../services/comments.service';
import { product } from '../data-type';

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
    private commentsService: CommentsService
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

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messages.push({ text: this.newMessage, isUser: true });
      this.newMessage = '';

      // Simulate a response from support
      setTimeout(() => {
        this.messages.push({ text: 'Destek ekibi yakında sizinle iletişime geçecektir.', isUser: false });
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
    console.log('Comparison component hidden');
  }
}
