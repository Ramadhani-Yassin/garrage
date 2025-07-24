import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: number;
  product: any;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userEmail: string;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:8080/cart';

  constructor(private http: HttpClient) {}

  getCart(email: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${email}`);
  }

  addToCart(email: string, productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/${email}/add?productId=${productId}&quantity=${quantity}`, {});
  }

  updateCartItem(email: string, productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/${email}/update?productId=${productId}&quantity=${quantity}`, {});
  }

  removeCartItem(email: string, productId: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/${email}/remove?productId=${productId}`, {});
  }

  clearCart(email: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/${email}/clear`, {});
  }

  checkout(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${email}/checkout`, {});
  }
} 