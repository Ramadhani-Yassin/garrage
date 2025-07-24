import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../../services/product.service';


@Component({
  selector: 'app-home',
  imports: [CommonModule, Navbar, Footer],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  featuredCategories = [
    { id: 1, name: 'Brakes', icon: '🚗' },
    { id: 2, name: 'Filters', icon: '🛢️' },
    { id: 3, name: 'Engine Parts', icon: '⚙️' },
    { id: 4, name: 'Suspension', icon: '🚙' },
  ];
  featuredProducts: Product[] = [];

  searchResults: any[] = [];
  searchQuery: string = '';
  notFound: boolean = false;

  private navSub?: Subscription;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.navSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.startsWith('/home')) {
        this.fetchProducts();
      }
    });
    this.fetchProducts();
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe(products => {
      this.featuredProducts = products.slice(0, 4);
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (!query.trim()) {
      this.searchResults = [];
      this.notFound = false;
      return;
    }
    const lower = query.toLowerCase();
    this.searchResults = this.featuredProducts.filter(
      p =>
        p.name.toLowerCase().includes(lower) ||
        p.price.toString().includes(lower)
    );
    this.notFound = this.searchResults.length === 0;
  }

  addToCart(productId: number) {
    this.router.navigate(['/login']);
  }
}
