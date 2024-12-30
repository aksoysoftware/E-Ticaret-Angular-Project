import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { cart, product } from '../data-type';
import { Comments, CommentsService, Reply } from "../services/comments.service";
import { UserService } from "../services/user.service";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  productData: undefined | product;
  productQuantity: number = 1;
  removeCart = false;
  cartData: product | undefined;
  newComment: string = '';
  comments: Comments[] = [];
  msgUserNotLogin: string = '';
  isAuthenticated: boolean = false;
  stars: number[] = [1, 2, 3, 4, 5];
  currentRating: number = 0;
  sortAscending = true;

  // Yeni: Yanıt içeriğini her yorum için ayrı saklama
  replyContentMap: { [key: string]: string } = {}; // Boş bir obje olarak tanımla
  availableColors: string[] = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Pembe', 'Beyaz', 'Siyah', 'Gri', 'Kahverengi'];

  selectedColor: string = this.availableColors[0];

  constructor(
    private activeRoute: ActivatedRoute,
    private productService: ProductService,
    private commentsService: CommentsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    const seller = localStorage.getItem('seller');
    this.isAuthenticated = !!(user || seller);
    let productId = this.activeRoute.snapshot.paramMap.get('productId');
    console.warn(productId);

    productId &&
    this.productService.getProduct(productId).subscribe((result) => {
      this.productData = result;
      let cartData = localStorage.getItem('localCart');
      if (productId && cartData) {
        let items = JSON.parse(cartData);
        items = items.filter(
          (item: product) => productId === item.id.toString()
        );
        if (items.length) {
          this.removeCart = true;
        } else {
          this.removeCart = false;
        }
      }

      let user = localStorage.getItem('user');
      if (user) {
        let userId = user && JSON.parse(user).id;
        this.productService.getCartList(userId);

        this.productService.cartData.subscribe((result) => {
          let item = result.filter(
            (item: product) =>
              productId?.toString() === item.productId?.toString()
          );

          if (item.length) {
            this.cartData = item[0];
            this.removeCart = true;
          }
        });
        this.productService.getCartList(userId);
      }
    });
    this.loadComments(productId);
  }

  minus() {
    if (this.productQuantity > 1) {
      this.productQuantity -= 1;
    }
  }

  plush() {
    return (this.productQuantity += 1);
  }

  addProduct() {
    this.removeCart = true;
    if (this.productData) {
      this.productData.quantity = this.productQuantity;

      this.productData.color = this.selectedColor;

      if (!localStorage.getItem('user')) {
        this.productService.localAddToCart(this.productData);
      } else {
        let user = localStorage.getItem('user');
        let userId = user && JSON.parse(user).id;
        let cartData: cart = {
          ...this.productData,
          userId,
          productId: this.productData.id,
          color: this.selectedColor,
        };

        delete cartData.id;
        this.productService.userAddToCart(cartData).subscribe((result) => {
          if (result) {
            this.productService.getCartList(userId);
            this.removeCart = true;
          }
        });
      }
    }
  }

  removeTocart(id: any) {
    if (!localStorage.getItem('user')) {
      this.productService.removeItemsFromCart(id);
    }
    {
      console.warn('cartData', this.cartData);

      this.cartData &&
      this.productService.removeToCartApi(this.cartData.id).subscribe((result) => {
        let user = localStorage.getItem('user');
        let userId = user && JSON.parse(user).id;
        this.productService.getCartList(userId);
      });
    }
    this.removeCart = false;
  }

  loadComments(productId: string | null): void {
    this.commentsService.getCommentsByProductId(productId).subscribe((result) => {
      this.comments = result;
    });
  }

  addComment(): void {
    if (this.newComment.trim()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const seller = JSON.parse(localStorage.getItem('seller') || '{}');

      const commentData: Comments = {
        averageRating: 0,
        ratings: undefined,
        userName: seller.name ? `${seller.name} (Satıcı)` : user.name,
        productId: this.productData?.id,
        userId: user.id || seller.id,
        content: this.newComment,
        timestamp: new Date().toISOString(),
      };

      this.commentsService.addComment(commentData).subscribe((comment) => {
        this.comments.push(comment);
        this.newComment = '';
      });
    }
  }

  rateComment(commentId: string | undefined, stars: number): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (userId) {
      this.commentsService.rateComment(commentId, userId, stars).subscribe((updatedComment) => {
        const index = this.comments.findIndex((c) => c.id === commentId);
        if (index > -1) {
          const comment = this.comments[index];
          comment.currentUserRating = stars;

          if (!comment.ratings) {
            comment.ratings = [];
          }

          const totalRatings = comment.ratings.reduce(
            (sum: number, rating: number) => sum + rating,
            0
          );
          const ratingCount = comment.ratings.length;

          comment.averageRating = ratingCount ? totalRatings / ratingCount : 0;
          this.comments[index] = { ...comment, ...updatedComment };
        }
      });
    } else {
      console.warn('Kullanıcı giriş yapmadan yorumları puanlayamaz.');
    }
  }

  // Yeni: Yanıt ekleme fonksiyonu
  addReply(commentId: string | undefined, replyContent: string): void {
    if (!replyContent || !replyContent.trim()) return; // Boş yanıtları önlemek için kontrol

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const seller = JSON.parse(localStorage.getItem('seller') || '{}');
    const userName = seller.name ? `${seller.name} (Satıcı)` : user.name;

    const reply: Reply = {
      id: this.generateRandomId(),
      userName: userName,
      userId: user.id || seller.id,
      content: replyContent.trim(),
      timestamp: new Date().toISOString(),
    };

    const commentIndex = this.comments.findIndex((c) => c.id === commentId);
    if (commentIndex > -1) {
      // Eğer replies null veya undefined ise boş bir dizi olarak başlat
      if (!this.comments[commentIndex].replies) {
        this.comments[commentIndex].replies = [];
      }
      this.comments[commentIndex].replies!.push(reply); // Yanıtı ekle
      this.replyContentMap[commentId || ''] = ''; // Yanıt alanını sıfırla
    }
  }

  // Rastgele bir ID oluşturma
  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.comments.sort((a, b) => {
      return this.sortAscending
        ? a.averageRating - b.averageRating
        : b.averageRating - a.averageRating;
    });
  }



  onColorChange(color: string): void {
    this.selectedColor = color;
  }
}
