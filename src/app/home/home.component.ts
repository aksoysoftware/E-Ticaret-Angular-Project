import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  popularProduct: product[] | undefined;
  campaignProducts: product[] | undefined;
  allProduct: product[] | undefined;

  constructor(private product: ProductService) {}

  ngOnInit(): void {
    this.product.getAllProducts().subscribe((data) => {
      this.allProduct = data;

      this.campaignProducts = data.filter((item) => item.isCampaign);
    });

    // Fetch popular products
    this.product.popularProducts().subscribe((data) => {
      this.popularProduct = data;
    });
  }

}
