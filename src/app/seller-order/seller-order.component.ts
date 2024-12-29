import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { order } from '../data-type';

@Component({
  selector: 'app-seller-order',
  templateUrl: './seller-order.component.html',
  styleUrls: ['./seller-order.component.css']
})
export class SellerOrderComponent implements OnInit {
  orders: order[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.productService.getOrders().subscribe((data: order[]) => {
      this.orders = data;
    });
  }

  updateOrderStatus(orderId: string | undefined, newStatus: string): void {
    const updatedOrder = this.orders.find(order => order.id === orderId);
    if (updatedOrder) {
      updatedOrder.status = newStatus;
      this.productService.updateOrder(orderId, updatedOrder).subscribe(() => {
        this.fetchOrders();
      });
    }
  }
}
