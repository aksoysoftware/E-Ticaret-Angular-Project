import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { cart, order, product } from '../data-type';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  cartData = new EventEmitter<product[] | []>();
  productName=new EventEmitter<string>();
  private apiBaseUrl = 'http://localhost:3000'; // API temel URL'i

  constructor(private http: HttpClient) { }

  private discountedTotalPrice = new BehaviorSubject<number | null>(null); // Varsayılan null

  setDiscountedTotalPrice(price: number) {
    this.discountedTotalPrice.next(price);
  }

  getDiscountedTotalPrice() {
    return this.discountedTotalPrice.asObservable();
  }

  getComparisonHistory() {
    return this.http.get<{ id: string; date: string; products: any[] }[]>('http://localhost:3000/comparisons');
  }

  getOrders(): Observable<order[]> {
    return this.http.get<order[]>('http://localhost:3000/orders');
  }

  updateOrder(orderId: string | undefined, updatedOrder: order): Observable<order> {
    return this.http.put<order>(`http://localhost:3000/orders/${orderId}`, updatedOrder);
  }

  addProduct(data: product) {
    return this.http.post('http://localhost:3000/product', data);
  }
  updateProduct(data: product, id: any) {
    return this.http.put<product>(`http://localhost:3000/product/${id}`, data);
  }

  productList() {
    return this.http.get<product[]>('http://localhost:3000/product');
  }

  deleteProduct(id: number|undefined) {
    return this.http.delete(`http://localhost:3000/product/${id}`);
  }

  getProduct(id: string) {
    return this.http.get<product>(`http://localhost:3000/product/${id}`);
  }

  popularProducts() {
    return this.http.get<product[]>(`http://localhost:3000/product?_limit=4`);
  }
  getAllProducts() {
    return this.http.get<product[]>(`http://localhost:3000/product`);
  }

  searchProducts(word: any) {
    return this.http.get<product[]>(`http://localhost:3000/product?q=${word}`);
  }

  getProductDetails(id: any) {
    return this.http.get<product>(`http://localhost:3000/product/${id}`);
  }

  localAddToCart(data: product) {
    let cartData: product[] = [];
    const localCart = localStorage.getItem('localCart');

    if (!localCart) {
      // Eğer localCart yoksa, yeni bir liste oluştur ve ürünü ekle
      cartData = [data];
      localStorage.setItem('localCart', JSON.stringify(cartData));
      this.cartData.emit(cartData);
    } else {
      // localCart varsa, mevcut ürünleri kontrol et
      cartData = JSON.parse(localCart);

      // Ürün zaten varsa, miktarı güncelle
      const existingProduct = cartData.find(item => item.id === data.id);
      if (existingProduct) {
        existingProduct.quantity! += data.quantity || 1; // Mevcut miktarı artır
      } else {
        cartData.push(data); // Ürün yoksa listeye ekle
      }

      // Güncellenmiş listeyi kaydet
      localStorage.setItem('localCart', JSON.stringify(cartData));
      this.cartData.emit(cartData);
    }
  }

  removeItemsFromCart(productId: string) {
    let cartData = localStorage.getItem('localCart');
    if (cartData) {
      let items: product[] = JSON.parse(cartData);
      items = items.filter((items: product) => productId !== items.id)
      //it item all data come except productId and we set thode details in local storege
      localStorage.setItem('localCart', JSON.stringify(items))
      this.cartData.emit(items)
    }
  }

  userAddToCart(cartData:cart){
    return this.http.post('http://localhost:3000/cart', cartData);
  }

  getCartList(userId:number){
    return this.http.get<product[]>('http://localhost:3000/cart?userId='+userId,
    {observe: 'response'}).subscribe((result)=>{
      if(result && result.body){
        this.cartData.emit(result.body)
      }
    });
  }

  removeToCartApi(cartId:string){
    return this.http.delete('http://localhost:3000/cart/'+cartId);
  }

  currentCartData() {
    const userStore = localStorage.getItem('user');
    const userData = userStore && JSON.parse(userStore);
    if (userData && userData.id) {
      return this.http.get<cart[]>('http://localhost:3000/cart?userId=' + userData.id);
    } else {
      console.error('Kullanıcı verisi bulunamadı.');
      return new Observable<cart[]>(); // Hata durumunda boş bir Observable döndür
    }
  }

  saveComparison(comparison: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/comparisons`, comparison);
  }



  orderNow(data:order){
    return this.http.post('http://localhost:3000/orders', data);
  }

  orderList(){
    let userStore=localStorage.getItem('user');
    let userData=userStore && JSON.parse(userStore);
    return this.http.get<order[]>('http://localhost:3000/orders?userId='+userData.id );
  }
  deleteCartItems(cartId:string|undefined){
    return this.http.delete('http://localhost:3000/cart/'+cartId,{observe:'response'}).subscribe((result)=>{
      if(result){
        this.cartData.emit([])
      }
    })
  }
  cancelOrder(orderId:string){
    return this.http.delete('http://localhost:3000/orders/'+orderId);
  }
  setProductname(data:any){
    this.productName.emit(data)
  }

  updateCartQuantity(productId: string, quantity: number) {
    return this.http.patch(`http://localhost:3000/cart/${productId}`, { quantity });
  }



}

