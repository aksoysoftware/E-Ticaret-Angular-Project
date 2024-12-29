import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ProductService } from '../services/product.service';
import { product } from '../data-type';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit {
  @Input() compareProducts: product[] = [];
  @Output() comparisonSaved = new EventEmitter<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {}

  removeFromCompare(productId: string) {
    this.compareProducts = this.compareProducts.filter(item => item.id !== productId);
  }

  saveComparison() {
    if (this.compareProducts.length < 2) {
      alert('Karşılaştırma için en az iki ürün seçmelisiniz!');
      return;
    }

    const comparisonResult = {
      date: new Date(),
      products: this.compareProducts.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        category: item.category,
      }))
    };

    this.productService.saveComparison(comparisonResult).subscribe(() => {
      alert('Karşılaştırma sonucu başarıyla kaydedildi!');
      this.compareProducts = []; // Listeyi temizle
    });

    // Kaydedildiğini bildirmek için olay yay
    this.comparisonSaved.emit();
  }
}
