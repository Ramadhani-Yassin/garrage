import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../../services/product.service';

interface Review {
  reviewer: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit, OnDestroy {
  @Input() product?: Product;

  products: Product[] = [];

  reviews: Review[] = [
    { reviewer: 'Alice', rating: 5, comment: 'Excellent product!' },
    { reviewer: 'Bob', rating: 4, comment: 'Works well, good value.' }
  ];

  relatedProducts: Product[] = [];

  private routeSub?: Subscription;
  private navSub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private productService: ProductService) {}

  ngOnInit() {
    this.navSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.startsWith('/product-details')) {
        this.fetchProducts();
      }
    });
    this.fetchProducts();
  }

  private fetchProducts() {
    this.routeSub?.unsubscribe();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.productService.getProducts().subscribe(products => {
        this.products = products;
        this.product = this.products.find(p => p.id === id);
        this.relatedProducts = this.products.filter(p => p.id !== id).slice(0, 2);
      });
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.navSub?.unsubscribe();
  }

  addToCart() {
    if (this.product) {
      alert(`Added ${this.product.name} to cart!`);
    }
  }

  viewProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  getDescription(product: Product | undefined): string {
    if (!product) return 'Make a reserve now. The price is friendly.';
    const desc = (product as any).description;
    return desc && typeof desc === 'string' && desc.trim().length > 0
      ? desc
      : 'Make a reserve now. The price is friendly.';
  }
}