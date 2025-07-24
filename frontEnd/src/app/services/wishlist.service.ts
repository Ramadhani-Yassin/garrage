import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WishlistItem {
  id?: number;
  userEmail: string;
  productId: number;
  productName: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private apiUrl = 'http://localhost:8080/api/wishlist';

  constructor(private http: HttpClient) {}

  getWishlist(email: string): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/${email}`);
  }

  addToWishlist(email: string, productId: number, productName: string): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(`${this.apiUrl}/add?email=${email}&productId=${productId}&productName=${encodeURIComponent(productName)}`, {});
  }

  removeFromWishlist(email: string, productId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/remove?email=${email}&productId=${productId}`, {});
  }
} 