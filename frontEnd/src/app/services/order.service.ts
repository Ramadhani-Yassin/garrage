import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  userEmail: string;
  total: number;
  orderDate?: string;
  items: OrderItem[];
  status: string;
}

export interface ProductDetail {
  name: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: number;
  userName: string;
  products: ProductDetail[];
  total: number;
  status: string;
  orderDate: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(order: { userEmail: string; total: number; items: OrderItem[] }): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/place`, order);
  }

  getOrdersByUser(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${email}`);
  }

  getAllOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/all`);
  }
  updateOrderStatus(id: number, status: string): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
} 