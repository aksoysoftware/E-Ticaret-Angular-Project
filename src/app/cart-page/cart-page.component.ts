import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { cart, priceSummary } from '../data-type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {
  cartData: cart[] | undefined;
  noProductMsg = '';
  msgUserNotLogin = '';
  priceSummary: priceSummary = {
    price: 0,
    discount: 0,
    tax: 0,
    delivery: 0,
    total: 0
  };
  discountCode = '';
  discountApplied = false;
  discountAmount = 0;
  invalidDiscount = false;
  validDiscountCodes = {
    'HOSGELDIN30': 30,
    'MERHABA10': 10
  };

  constructor(private product: ProductService, private route: Router) { }

  ngOnInit(): void {
    this.call();
  }

  call() {
    if (localStorage.getItem('user')) {
      this.product.currentCartData().subscribe((result) => {
        this.cartData = result;
        this.calculatePriceSummary(result);
      });
    } else {
      let userStore = localStorage.getItem('localCart');
      console.log("userStore: " + JSON.stringify(userStore, null, 2));
      if (userStore) {
        const userData = JSON.parse(userStore);
        this.cartData = userData;
        this.calculatePriceSummary(userData);
      } else {
        this.noProductMsg = 'Sepete Ürün Eklenmemiş...';
      }
    }
  }

  calculatePriceSummary(cartItems: cart[]) {
    let amount = 0;
    cartItems.forEach((item) => {
      if (item.quantity) {
        amount += (+item.price) * (+item.quantity);
      }
    });
    if (amount > 0) {
      this.priceSummary.price = amount;
      this.priceSummary.discount = (amount / 100) * 8;
      this.priceSummary.tax = amount / 10;
      this.priceSummary.delivery = 100;
      this.priceSummary.total = this.priceSummary.price - this.priceSummary.discount + this.priceSummary.tax + this.priceSummary.delivery;
    } else {
      this.noProductMsg = 'Sepete Ürün Eklenmemiş...';
    }
  }

  removeTocart(id: string | undefined) {
    if (!id) {
      console.error('Invalid ID provided for removal.');
      return;
    }

    if (!localStorage.getItem('user')) {
      this.product.removeItemsFromCart(id);
      this.call();
    } else {
      this.cartData && this.product.removeToCartApi(id).subscribe(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.product.getCartList(user.id);
        this.call();
      });
    }
  }


  checkOut() {
    if (localStorage.getItem('user')) {
      this.route.navigate(['/checkout']);
    } else {
      this.msgUserNotLogin = 'Hesaba Giriş Yapmalısınız...';
    }
  }

  applyDiscount() {
    const discountPercentage = this.validDiscountCodes[this.discountCode.toUpperCase() as keyof typeof this.validDiscountCodes];
    if (discountPercentage) {
      this.discountAmount = (this.priceSummary.price * discountPercentage) / 100;
      this.priceSummary.discount = this.discountAmount;
      this.priceSummary.total = this.priceSummary.price - this.discountAmount + this.priceSummary.tax + this.priceSummary.delivery;
      this.discountApplied = true;
      this.invalidDiscount = false;

      // Discounted total price'ı ProductService'e gönder
      this.product.setDiscountedTotalPrice(this.priceSummary.total);

      console.log('Discount Applied:', this.priceSummary.total); // Kontrol için log
    } else {
      this.invalidDiscount = true;
      this.discountApplied = false;
    }
  }




  redirectToLogin() {
    this.route.navigate(['/login']);
  }

  updateQuantity(productId: string, quantity: number) {
    if (!productId || quantity < 1) {
      console.error('Geçersiz ürün ID veya miktar.');
      return;
    }

    if (localStorage.getItem('user')) {
      // Kullanıcı giriş yaptıysa, sunucuda güncelleme
      this.product.updateCartQuantity(productId, quantity).subscribe(() => {
        console.log('Sepet güncellendi.');
        this.call(); // Sepeti yeniden yükle
      });
    } else {
      // Kullanıcı giriş yapmadıysa, localStorage'da güncelle
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        const cartItems: cart[] = JSON.parse(localCart);
        const itemIndex = cartItems.findIndex((item) => item.id === productId);
        if (itemIndex !== -1) {
          cartItems[itemIndex].quantity = quantity;
          localStorage.setItem('localCart', JSON.stringify(cartItems));
          console.log('Local cart güncellendi.');
          this.call(); // Sepeti yeniden yükle
        }
      }
    }
  }






  protected readonly String = String;
}
