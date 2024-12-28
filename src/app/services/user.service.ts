import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { login, singUp, product, cart } from '../data-type';
import { Observable } from 'rxjs';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  isUserLogedIn = new EventEmitter<boolean>(false);
  isLoginFail = new EventEmitter<boolean>(false);

  constructor(private http: HttpClient, private router: Router, private productService: ProductService) {}

  // Kullanıcı kaydı
  singUp(value: singUp) {
    this.http.post('http://localhost:3000/user', value, { observe: 'response' }).subscribe((result) => {
      this.isUserLogedIn.emit(true);
      if (result) {
        localStorage.setItem('user', JSON.stringify(result.body));
        this.router.navigate(['/']);
      }
    });
  }

  // Kullanıcı oturumu yeniden yükleme
  userAuthReload() {
    if (localStorage.getItem('user')) {
      this.router.navigate(['/']);
    }
  }

  // Kullanıcı girişi
  userLogin(data: login) {
    this.checkUserType(data).subscribe((response: { isSeller: boolean; isUser: boolean; user: any }) => {
      if (response.isSeller) {
        // Kullanıcı satıcı ise, "seller" bilgilerini kaydet
        localStorage.setItem('seller', JSON.stringify(response.user));
        this.router.navigate(['/seller-dashboard']); // Satıcı yönlendirmesi
        this.isLoginFail.emit(false);
      } else if (response.isUser) {
        // Kullanıcı normal kullanıcı ise, "user" bilgilerini kaydet
        localStorage.setItem('user', JSON.stringify(response.user));
        this.localCartToRemotecart(); // Local cart'ı sunucuya senkronize et
        this.router.navigate(['/']); // Kullanıcı yönlendirmesi
        this.isLoginFail.emit(false);
      } else {
        // Kullanıcı bulunamadı
        this.isLoginFail.emit(true);
      }
    });
  }

  // Kullanıcı tipini kontrol et
  checkUserType(data: login): Observable<{ isSeller: boolean; isUser: boolean; user: any }> {
    return new Observable((observer) => {
      let isUser: boolean = false;
      let isSeller: boolean = false;
      let user: any = null;

      // Normal kullanıcı kontrolü
      this.http.get<any[]>(`http://localhost:3000/user?email=${data.email}&password=${data.password}`).subscribe((users) => {
        if (users.length > 0) {
          isUser = true;
          user = users[0];
        }

        // Satıcı kontrolü
        this.http.get<any[]>(`http://localhost:3000/seller?email=${data.email}&password=${data.password}`).subscribe((sellers) => {
          if (sellers.length > 0) {
            isSeller = true;
            user = sellers[0];
          }

          // Sonuçları gönder
          observer.next({ isSeller, isUser, user });
          observer.complete();
        });
      });
    });
  }



  localCartToRemotecart() { //düzeltilecek
    const localCart = localStorage.getItem('localCart');
    const user = localStorage.getItem('user');
    const userId = user && JSON.parse(user).id;

    if (localCart && userId) {
      const cartDatalist: product[] = JSON.parse(localCart);

      // Sunucudan mevcut kullanıcı sepetini al
      this.productService.currentCartData().subscribe((serverCart) => {
        const serverProductIds = serverCart.map(item => item.productId); // Sunucudaki ürün ID'leri
        console.log("serverProductIds: " + JSON.stringify(serverProductIds));

        // Local cart'taki ürünleri sunucudaki ürünlerle karşılaştır
        let newProducts = cartDatalist.filter(product => !serverProductIds.includes(product.id));

        if (newProducts.length > 0) {
          // Sunucuda olmayan yeni ürünleri ekle
          const uniqueProducts: product[] = [];
          const productIdSet: Set<string | number> = new Set();

          newProducts.forEach((product) => {
            if (!productIdSet.has(product.id)) {
              productIdSet.add(product.id);
              uniqueProducts.push(product);
            }
          });

          const requests = uniqueProducts.map((product: product) => {
            const cartData: cart = {
              ...product,
              productId: product.id, // Sunucuda karşılaştırma için ürün ID'si
              userId,
              quantity: product.quantity || 1 // Miktarı kontrol et
            };
            delete cartData.id; // Lokal cart'taki ID'yi kaldır
            console.log("cartData: " + JSON.stringify(cartData, null, 2));
            return this.productService.userAddToCart(cartData).toPromise();
          });


          Promise.all(requests).then(() => {
            // İşlem tamamlandığında localCart'ı temizle
            localStorage.removeItem('localCart');
            this.productService.getCartList(userId); // Kullanıcının sepetini yeniden yükle
          }).catch((error) => {
            console.error('Sunucuya ürün ekleme hatası:', error);
          });
        } else {
          // Eğer localCart'taki tüm ürünler sunucuda varsa temizle
          localStorage.removeItem('localCart');
        }
      });
    }
  }






}
