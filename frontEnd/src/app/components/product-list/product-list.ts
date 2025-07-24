import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  private navSub?: Subscription;
  showLoginModal = false;
  modalMessage = '';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.navSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.startsWith('/product-list')) {
        this.fetchProducts();
      }
    });
    this.fetchProducts();
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  addToCart(product: Product) {
    this.modalMessage = `You must <b>login</b> or <b>register</b> to add "${product.name}" to your cart and place an order.`;
    this.showLoginModal = true;
    this.router.navigate(['/login']).then(() => {
      this.showLoginModal = false;
    });
  }
  closeModal() {
    this.showLoginModal = false;
  }

  getProductImage(product: Product): string {
    if (!product.image) return '';
    // If already absolute, return as is
    if (product.image.startsWith('http')) return product.image;
    return 'http://localhost:8080' + product.image;
  }
}