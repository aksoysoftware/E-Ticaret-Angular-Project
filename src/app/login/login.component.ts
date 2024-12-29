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
  @Input() isSeller: boolean = false;
  showLogin: boolean = true;
  authError: string = '';

  constructor(private userService: UserService, private sellerService: SellerService) { }

  ngOnInit(): void {
    this.isSeller = false; // Varsayılan olarak "Kullanıcı"
    this.userService.userAuthReload();
    this.sellerService.reloadSeller();
  }


  toggleLogin() {
    this.showLogin = !this.showLogin;
  }

  handleLogin(data: login) {
    if (this.isSeller) {
      // Satıcı login işlemi
      this.sellerService.userLogin(data);
      this.sellerService.isLoginFail.subscribe((isError) => {
        if (isError) {
          this.authError = 'Email veya Şifre Hatalı!';
        }
      });
    } else {
      // Kullanıcı login işlemi
      this.userService.userLogin(data);
      this.userService.isLoginFail.subscribe((isError) => {
        if (isError) {
          this.authError = 'Kullanıcı Email veya Şifre Hatalı!';
        } else {
          this.userService.localCartToRemotecart();
        }
      });
    }
  }





}
