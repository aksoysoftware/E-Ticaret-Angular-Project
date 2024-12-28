import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { SellerService } from '../services/seller.service';
import { login } from '../data-type';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() isSeller: boolean = false; // Bu flag artık opsiyonel
  showLogin: boolean = true;
  authError: string = '';

  constructor(private userService: UserService, private sellerService: SellerService) { }

  ngOnInit(): void {
    // Yeniden yetkilendirme işlemleri
    this.userService.userAuthReload();
    this.sellerService.reloadSeller();
  }

  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  handleLogin(data: login) {
    this.userService.userLogin(data);
    this.userService.isLoginFail.subscribe((isError) => {
      if (isError) {
        this.authError = 'Email veya Şifre Hatalı!';
      } else {
        // Giriş başarılı, localCart'ı sunucuya aktar
        this.userService.localCartToRemotecart();
      }
    });
  }



}
