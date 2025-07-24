import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartItems: CartItem[] = [
    { id: 1, name: 'Head Lights', price: 29.99, quantity: 2, image: './autospare.png' },
    { id: 2, name: 'Bluetooth Speaker', price: 79.99, quantity: 1, image: './autospare.png' },
    { id: 3, name: 'Wind Screen', price: 1999.99, quantity: 1, image: './autospare.png' },
  ];

  taxRate = 0.07; // 7% tax
  shipping = 10; // Flat shipping

  getSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getItemsTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getSubtotal(item), 0);
  }

  getTax(): number {
    return this.getItemsTotal() * this.taxRate;
  }

 getGrandTotal(): number {
  if (!this.cartItems || this.cartItems.length === 0) return 0;
  return this.getItemsTotal() + this.getTax() + this.shipping;
}

  increaseQuantity(item: CartItem) {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) item.quantity--;
  }

  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartItems = [];
    }
  }
}