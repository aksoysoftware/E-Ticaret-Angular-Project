import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommentsService } from '../services/comments.service';
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

  constructor(
    private productService: ProductService,
    private commentsService: CommentsService
  ) {}

  ngOnInit(): void {
    // Fetch all products
    this.productService.getAllProducts().subscribe((products) => {
      this.commentsService.getAllComments().subscribe((comments) => {
        // Map products to include comment count
        this.allProduct = products.map((product) => ({
          ...product,
          commentCount: comments.filter((comment) => comment.productId === product.id).length,
        }));

        // Filter campaign products
        this.campaignProducts = this.allProduct.filter((item) => item.isCampaign);

        // Example: Filter popular products if needed
        this.popularProduct = this.allProduct.filter((item) => item.isPopular);
      });
    });
  }
}
