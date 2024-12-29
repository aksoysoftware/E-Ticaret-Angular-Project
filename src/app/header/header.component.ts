import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';
import { PopupboxService } from '../services/popupbox.service';
import {SellerService} from "../services/seller.service";
import {UserService} from "../services/user.service";

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

  constructor(private route: Router, private product: ProductService, private popup: PopupboxService, private userService: UserService, private sellerService: SellerService) {
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

    this.userService.isUserLoggedIn.subscribe(() => {
      this.updateMenuType();
    });

    this.sellerService.isSellerLoggedIn.subscribe(() => {
      this.updateMenuType();
    });
  }

  ngOnInit(): void {
    this.updateMenuType();
    this.updateCartItemCount();
    this.handleRouteChanges();
  }

  updateMenuType(): void {
    if (localStorage.getItem('seller')) {
      this.menuType = 'seller';
      const sellerData = JSON.parse(localStorage.getItem('seller') || '{}');
      this.sellerName = sellerData.name || '';
    } else if (localStorage.getItem('user')) {
      this.menuType = 'user';
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      this.userName = userData.name || '';
    } else {
      this.menuType = 'default';
    }
  }



  handleRouteChanges() {
    this.route.events.subscribe(() => {
      this.updateMenuType();
    });
  }


  updateCartItemCount() {
    this.product.cartData.subscribe((items) => {
      this.cartItemsNumber = items.length;
    });
  }


  userlogoutpopup() {
    this.popup.openPopUp();
  }

  userlogout() {
    localStorage.removeItem('user');
    this.product.cartData.emit([]);
    this.updateMenuType(); // Menü tipini güncelle
    this.route.navigate(['/login']);
  }




  sellerlogoutpopup() {
    this.popup.sellerOpenPopUp();
  }

  logout() {
    localStorage.removeItem('seller');
    this.updateMenuType(); // Menü tipini güncelle
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

  routeAdminOrUser(){
    this.sellerName !== '' ? this.route.navigate(['/seller-home']) : this.route.navigate([''])
  }
}
