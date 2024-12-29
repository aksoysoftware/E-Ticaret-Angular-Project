import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-comparison-history',
  templateUrl: './comparison-history.component.html',
  styleUrls: ['./comparison-history.component.css'],
})
export class ComparisonHistoryComponent implements OnInit {
  comparisonHistory: { id: string; date: string; products: any[] }[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getComparisonHistory();
  }

  getComparisonHistory(): void {
    this.productService.getComparisonHistory().subscribe((data: any) => {
      this.comparisonHistory = data.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
  }
}
