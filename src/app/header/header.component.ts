import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';
import { PopupboxService } from '../services/popupbox.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuType = 'default';
  sellerName: string = '';
  userName: string = '';
  searchResult: undefined | product[];
  searchName: string = '';
  cartItemsNumber = 0;

  constructor(private route: Router, private product: ProductService, private popup: PopupboxService) {
    this.popup.userLogoutEvent().subscribe((result) => {
      if (result) {
        this.userlogout();
      }
    });

    this.popup.sellerLogoutEvent().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }

  ngOnInit(): void {
    this.updateCartItemCount();
    this.handleRouteChanges();
  }

  handleRouteChanges() {
    this.route.events.subscribe((val: any) => {
      if (val?.url) {
        if (localStorage.getItem('seller') && val.url.includes('seller')) {
          const sellerData = JSON.parse(localStorage.getItem('seller') || '{}');
          this.sellerName = sellerData.name;
          this.menuType = 'seller';
        } else if (localStorage.getItem('user')) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          this.userName = userData.name;
          this.menuType = 'user';
          this.product.getCartList(userData.id);
        } else {
          this.menuType = 'default';
        }
      }
    });
  }

  updateCartItemCount() {
    const cartItem = localStorage.getItem('localCart');
    if (cartItem) {
      this.cartItemsNumber = JSON.parse(cartItem).length;
    }
    this.product.cartData.subscribe((items) => {
      this.cartItemsNumber = items.length;
    });
  }

  userlogoutpopup() {
    this.popup.openPopUp();
  }

  userlogout() {
    localStorage.removeItem('user');
    this.route.navigate(['/login']);
    this.product.cartData.emit([]);
  }

  sellerlogoutpopup() {
    this.popup.sellerOpenPopUp();
  }

  logout() {
    localStorage.removeItem('seller');
    this.route.navigate(['/login']);
  }

  searchProduct(word: KeyboardEvent) {
    const element = word.target as HTMLInputElement;
    if (element.value) {
      this.product.searchProducts(element.value).subscribe((result) => {
        result.length = 10;
        this.searchResult = result;
      });
    }
  }

  hideSearch() {
    this.searchResult = undefined;
  }

  submintSearch(value: string) {
    if (value) {
      this.route.navigate([`search/${value}`]);
      this.product.setProductname(value);
    }
  }

  redirectToDetails(name: string) {
    this.route.navigate([`/search/${name}`]);
    this.searchName = name;
  }
}
