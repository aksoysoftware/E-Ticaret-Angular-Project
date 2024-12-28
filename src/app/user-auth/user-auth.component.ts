import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { cart, login, product, singUp } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-user-auth',
  templateUrl: './user-auth.component.html',
  styleUrls: ['./user-auth.component.css']
})
export class UserAuthComponent implements OnInit {

  showLogin: boolean = true
  authError: any

  constructor(private user: UserService, private product: ProductService) { }
  ngOnInit(): void {
    this.user.userAuthReload();
  }

  singUp(value: singUp) {
    this.user.singUp(value);
  }

  opneLogin() {
    this.showLogin = true
  }
  opneSingup() {
    this.showLogin = false
  }

  login(value: login) {
    this.user.userLogin(value);
    this.user.isLoginFail.subscribe((isError) => {
      if (isError) {
        this.authError = 'Email or Password is not correct';
      }
      else {
        this.localCartToRemotecart();
      }
    })
  }

  localCartToRemotecart() {
    const localCart = localStorage.getItem('localCart');
    const user = localStorage.getItem('user');
    const userId = user && JSON.parse(user).id;

    if (localCart && userId) {
      const cartDatalist: product[] = JSON.parse(localCart);

      // Tüm ürünleri sunucuya ekleyin
      cartDatalist.forEach((product: product, index) => {
        const cartData: cart = {
          ...product,
          productId: product.id,
          userId
        };
        delete cartData.id; // Lokal id'yi kaldır
        this.product.userAddToCart(cartData).subscribe((result) => {
          if (result && index === cartDatalist.length - 1) {
            localStorage.removeItem('localCart');
            this.product.getCartList(userId);
          }
        });
      });
    }
  }



}
