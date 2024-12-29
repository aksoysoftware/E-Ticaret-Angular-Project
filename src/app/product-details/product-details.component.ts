import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProductService} from '../services/product.service';
import {cart, product} from '../data-type';
import {Comments, CommentsService} from "../services/comments.service";
import {UserService} from "../services/user.service";

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

  constructor(private activeRoute: ActivatedRoute,
              private product: ProductService,
              private commentsService: CommentsService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.isAuthenticated = !!localStorage.getItem('user');
    let productId = this.activeRoute.snapshot.paramMap.get('productId');
    console.warn(productId);

    productId && this.product.getProduct(productId).subscribe((result) => {
      this.productData = result;
      let cartData = localStorage.getItem('localCart');
      if (productId && cartData) {
        let items = JSON.parse(cartData);
        items = items.filter((item: product) => productId === item.id.toString());
        if (items.length) {
          this.removeCart = true
        } else {
          this.removeCart = false
        }
      }

      let user = localStorage.getItem('user');
      if (user) {
        let userId = user && JSON.parse(user).id;
        this.product.getCartList(userId);

        this.product.cartData.subscribe((result) => {

          let item = result.filter((item: product) => productId?.toString() === item.productId?.toString())

          if (item.length) {
            this.cartData = item[0];
            this.removeCart = true;
          }
        });
        this.product.getCartList(userId);
      }
    })
    this.loadComments(productId);

  }

  //-------------------------------------------------
  minus() {
    if (this.productQuantity > 1) {
      this.productQuantity -= 1
    }
  }

  plush() {
    return this.productQuantity += 1
  }

  addProduct() {
    this.removeCart = true;
    if (this.productData) {
      this.productData.quantity = this.productQuantity

      if (!localStorage.getItem('user')) {
        this.product.localAddToCart(this.productData)
      } else {
        let user = localStorage.getItem('user')
        let userId = user && JSON.parse(user).id;
        let cartData: cart = {...this.productData, userId, productId: this.productData.id}

        delete cartData.id
        this.product.userAddToCart(cartData).subscribe((result) => {
          if (result) {
            this.product.getCartList(userId);
            this.removeCart = true
          }
        })

      }
    }
  }

  removeTocart(id: any) {
    if (!localStorage.getItem('user')) {
      this.product.removeItemsFromCart(id)
      //this.removeCart = false;
    }
    {
      console.warn("cartData", this.cartData);

      this.cartData && this.product.removeToCartApi(this.cartData.id)
        .subscribe((result) => {
          let user = localStorage.getItem('user');
          let userId = user && JSON.parse(user).id;
          this.product.getCartList(userId)
        })
    }
    this.removeCart = false
  }

  loadComments(productId: string | null): void {
    this.commentsService.getCommentsByProductId(productId).subscribe((result) => {
      this.comments = result;
    });

  }

  addComment(): void {
    if (this.newComment.trim()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const commentData: Comments = {
        averageRating: 0, ratings: undefined,
        userName: user.name,
        productId: this.productData?.id,
        userId: user.id,
        content: this.newComment,
        timestamp: new Date().toISOString()
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
          this.comments[index] = {...this.comments[index], ...updatedComment};
          this.comments[index].averageRating = stars;
        }
      });
    } else {
      console.warn('User must be logged in to rate a comment.');
    }
  }


  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.comments.sort((a, b) => {
      return this.sortAscending
        ? a.averageRating - b.averageRating
        : b.averageRating - a.averageRating;
    });
  }

}
