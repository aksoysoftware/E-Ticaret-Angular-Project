import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { AuthGuard } from './auth.guard';
import { SellerAddProductComponent } from './seller-add-product/seller-add-product.component';
import { SellerUpdateProductComponent } from './seller-update-product/seller-update-product.component';
import { SearchComponent } from './search/search.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { AlertBoxComponent } from './alert-box/alert-box.component';
import { LoginComponent } from './login/login.component';
import {UpdateProfileComponent} from "./update-profile/update-profile.component";
import {ComparisonHistoryComponent} from "./comparison-history/comparison-history.component"; // LoginComponent eklendi

const routes: Routes = [
  { path: '', component: HomeComponent },

  // LoginComponent kullanıcı ve satıcı girişi için kullanılacak
  { path: 'login', component: LoginComponent },

  {
    path: 'seller-home',
    component: SellerHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'seller-add-product',
    component: SellerAddProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'seller-update-product/:id',
    component: SellerUpdateProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'search/:word',
    component: SearchComponent
  },
  { path: 'comparison-history', component: ComparisonHistoryComponent },


  {
    path: 'product-details/:productId',
    component: ProductDetailsComponent
  },
  {
    path: 'cart-page',
    component: CartPageComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'my-order',
    component: MyOrdersComponent
  },
  {
    path: 'alertbox',
    component: AlertBoxComponent
  },
  {
    path: 'update-profile',
    component: UpdateProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
