import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  cartItems: CartItem[] = [
    { id: 1, name: 'Wireless ', price: 29.99, quantity: 2, image: './autospare.png' },
    { id: 2, name: 'Speaker', price: 79.99, quantity: 1, image: './autospare.png' },
    { id: 3, name: 'Safety Belt', price: 100.78, quantity: 2, image: './autospare.png'}
  ];

  shipping = 10;
  taxRate = 0.07;

  shippingInfo = {
    name: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  };

  paymentMethod = 'credit';

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getGrandTotal(): number {
    return this.getSubtotal() + this.getTax() + this.shipping;
  }

  placeOrder() {
    if (
      this.shippingInfo.name &&
      this.shippingInfo.address &&
      this.shippingInfo.city &&
      this.shippingInfo.zip &&
      this.shippingInfo.country
    ) {
      alert('Order placed successfully!');
      // Here you would clear the cart and/or navigate to a confirmation page
    } else {
      alert('Please fill in all shipping details.');
    }
  }
}