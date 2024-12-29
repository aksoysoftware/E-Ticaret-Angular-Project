import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { cart, order } from '../data-type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  totalPrice: number | undefined;
  cartData: cart[] | undefined;
  orderMsg: string | undefined;
  paymentMethod: string = 'kapıda'; // Default ödeme yöntemi
  selectedShippingCompany: string = 'mng'; // Default kargo şirketi

  constructor(private product: ProductService, private route: Router) {}

  ngOnInit(): void {
    this.product.getDiscountedTotalPrice().subscribe((price) => {
      if (price !== null && price > 0) {
        this.totalPrice = price; // İndirimli toplam fiyat
      } else {
        this.calculateTotalPrice(); // İndirim uygulanmamışsa hesapla
      }
    });

    if(this.totalPrice === null || this.totalPrice === 0) {
      this.product.currentCartData().subscribe((result) => {
        let price = 0;
        this.cartData = result;
        result.forEach((item) => {
          let productPrice = 0;
          if (item.quantity) {
            productPrice += +item.price * +item.quantity;
          }
          price += productPrice;
        });

        this.totalPrice = price + price / 10 + 100 - price / 100 * 8;
      });
    }

  }


  calculateTotalPrice() {
    let price = 0;
    this.cartData?.forEach((item) => {
      let productPrice = 0;
      if (item.quantity) {
        productPrice += +item.price * +item.quantity;
      }
      price += productPrice;
    });


    if (price > 0) {
      this.totalPrice = price + price / 10 + 100 - price / 100 * 8;
    } else {
      this.totalPrice = 0;
    }

  }



  oderNow(data: { email: string; address: string; contact: string; cardNumber?: string; expiryDate?: string; cvc?: string; deliveryTime: string }) {
    let user = localStorage.getItem('user');
    let userId = user && JSON.parse(user).id;
    if (this.totalPrice) {
      let orderData: order = {
        ...data,
        totalPrice: this.totalPrice,
        userId,
        id: undefined,
        paymentMethod: this.paymentMethod,
        shippingCompany: this.selectedShippingCompany,
      };

      this.cartData?.forEach((items) => {
        setTimeout(() => {
          items.id && this.product.deleteCartItems(items.id);
        }, 700);
      });

      this.product.orderNow(orderData).subscribe((result) => {
        if (result) {
          this.orderMsg = 'Siparişiniz başarıyla oluşturuldu';
          setTimeout(() => {
            this.route.navigate(['/my-order']);
            this.orderMsg = undefined;
          }, 3000);
        }
      });
    }
  }
}
