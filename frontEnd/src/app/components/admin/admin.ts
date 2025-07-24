import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { UserService, User } from '../../services/user.service';
import { OrderService, AdminOrder } from '../../services/order.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

interface Order {
  id: number;
  userId: number;
  userName: string;
  products: string[];
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'shipped';
  orderDate: Date;
}

interface AdminInfo {
  name: string;
  email: string;
  role: string;
  lastLogin: Date;
  totalSales: number;
  totalOrders: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, BaseChartDirective],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab = 'dashboard';
  sidebarCollapsed = false;
  notifications = 5;
  showAddProductModal = false;
  showAddUserModal = false;
  orderFilter = 'all';
  errorMessage: string = '';
  successMessage: string = '';
  showLogoutModal: boolean = false;
  showOrderDetailsModal = false;
  selectedOrder: AdminOrder | null = null;

  adminInfo: User = {
    id: undefined,
    fullName: '',
    email: '',
    role: '',
    region: '',
    status: '',
    joinDate: '',
  };

  products: Product[] = [];
  newProduct: Partial<Product> = {};
  editingProduct: Product | null = null;

  users: User[] = [];

  orders: AdminOrder[] = [];

  newUser: Partial<User> = {};
  adminEmail: string = '';
  currentUser: User | null = null;
  analyticsSummary: any = null;
  salesByDay: { labels: string[], data: number[] } = { labels: [], data: [] };
  salesByProduct: { labels: string[], data: number[] } = { labels: [], data: [] };
  orderStatusLabels: string[] = [];
  orderStatusData: number[] = [];
  bestSeller: string = 'Laptop';
  lowStockCount: number = 3;
  activities: any[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUser = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.errorMessage = 'You are not authorized to view this page.';
      // Optionally redirect to login or profile
      return;
    }
    this.adminEmail = this.currentUser.email;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.fetchAdminInfo();
      this.fetchProducts();
      this.fetchUsers();
      this.fetchOrders();
      this.fetchAnalytics();
      this.fetchRecentActivities();
    });
    this.fetchAdminInfo();
    this.fetchProducts();
    this.fetchUsers();
    this.fetchOrders();
    this.fetchAnalytics();
    this.fetchRecentActivities();
    console.log('Admin Dashboard initialized');
  }

  fetchAdminInfo() {
    if (!this.adminEmail) {
      this.errorMessage = 'No admin email found. Please log in again.';
      return;
    }
    this.userService.getProfile(this.adminEmail).subscribe((user: User) => {
      if (user && user.email) {
        this.adminInfo = user;
      } else {
        this.errorMessage = 'Failed to load admin profile.';
      }
    }, (err: any) => {
      this.errorMessage = 'Failed to load admin profile.';
    });
  }

  updateAdminProfile() {
    if (!this.adminInfo.email) {
      this.errorMessage = 'Cannot update profile: missing email.';
      return;
    }
    this.userService.updateProfileByEmail(this.adminInfo).subscribe((updated: User) => {
      this.adminInfo = updated;
      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => { this.successMessage = ''; }, 2500);
      this.fetchAdminInfo(); // Refresh info after update
    }, (err: any) => {
      this.errorMessage = 'Failed to update profile.';
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      dashboard: '📊 Dashboard Overview',
      products: '📦 Product Management',
      users: '👥 User Management',
      orders: '🛒 Order Management',
      analytics: '📈 Analytics & Reports',
      settings: '⚙️ System Settings',
      profile: '👤 Admin Profile'
    };
    return titles[this.activeTab] || 'Admin Panel';
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getActiveUsers(): number {
    return this.users.filter(user => user.status === 'active').length;
  }

  getTodayOrders(): number {
    const today = new Date();
    return this.orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === today.toDateString();
    }).length;
  }

  getFilteredOrders(): AdminOrder[] {
    if (this.orderFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.orderFilter);
  }

  getTotalSales(): number {
    return this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }

  addProduct() {
    if (this.newProduct.name && this.newProduct.price) {
      this.productService.addProduct(this.newProduct as Product).subscribe(product => {
        this.products.push(product);
        this.newProduct = {};
        this.showAddProductModal = false;
      });
    }
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
    this.showAddProductModal = true;
    this.newProduct = { ...product };
  }

  updateProduct() {
    if (this.editingProduct && this.newProduct.name && this.newProduct.price) {
      this.productService.updateProduct(this.editingProduct.id!, this.newProduct as Product).subscribe(updated => {
        const idx = this.products.findIndex(p => p.id === updated.id);
        if (idx > -1) this.products[idx] = updated;
        this.editingProduct = null;
        this.newProduct = {};
        this.showAddProductModal = false;
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p.id !== id);
      });
    }
  }

  closeProductModal() {
    this.showAddProductModal = false;
    this.editingProduct = null;
    this.newProduct = {};
  }

  addUser() {
    if (this.newUser.fullName && this.newUser.email) {
      const user: User = {
        fullName: this.newUser.fullName,
        email: this.newUser.email,
        role: this.newUser.role || 'user',
        status: this.newUser.status || 'active',
        region: this.newUser.region || '',
        password: this.newUser.password || '',
      };
      // Here you would call a userService method to add the user to the backend
      // For now, just add to the local array for UI feedback
      this.users.push(user);
      this.newUser = {};
      this.showAddUserModal = false;
      console.log('User added:', user);
    }
  }

  editUser(user: User) {
    console.log('Editing user:', user);
    // Implement edit functionality
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== id);
      console.log('User deleted:', id);
    }
  }

  updateOrderStatus(orderId: number, status: string) {
    this.orderService.updateOrderStatus(orderId, status).subscribe(updatedOrder => {
      const idx = this.orders.findIndex(o => o.id === updatedOrder.id);
      if (idx > -1) {
        // Update only the changed fields to preserve reference
        Object.assign(this.orders[idx], updatedOrder);
      }
    });
  }

  viewOrderDetails(order: AdminOrder) {
    this.selectedOrder = order;
    this.showOrderDetailsModal = true;
  }

  closeOrderDetailsModal() {
    this.showOrderDetailsModal = false;
    this.selectedOrder = null;
  }

  logout() {
    this.showLogoutModal = true;
  }


  confirmLogout() {
    this.showLogoutModal = false;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
    window.location.href = '/home';
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  showAddProductWizard() {
    this.editingProduct = null;
    this.newProduct = {};
    this.showAddProductModal = true;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.productService.uploadImage(formData).subscribe({
        next: (imagePath: string) => {
          this.newProduct.image = imagePath;
        },
        error: () => {
          alert('Image upload failed');
        }
      });
    }
  }

  fetchProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  fetchOrders() {
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders as AdminOrder[];
    });
  }

  fetchAnalytics() {
    this.http.get<any>('http://localhost:8080/api/orders/analytics/summary').subscribe(res => {
      this.analyticsSummary = res;
      const statusCounts = res.statusCounts || {};
      this.orderStatusLabels = Object.keys(statusCounts);
      this.orderStatusData = Object.values(statusCounts);
    });
    this.http.get<any>('http://localhost:8080/api/orders/analytics/sales-by-day').subscribe(res => {
      this.salesByDay.labels = Object.keys(res);
      this.salesByDay.data = Object.values(res);
    });
    this.http.get<any>('http://localhost:8080/api/orders/analytics/sales-by-product').subscribe(res => {
      this.salesByProduct.labels = Object.keys(res);
      this.salesByProduct.data = Object.values(res);
    });
    this.http.get<any>('http://localhost:8080/api/orders/analytics/product-performance').subscribe(res => {
      this.bestSeller = res.bestSeller;
      this.lowStockCount = res.lowStockCount;
    });
  }

  fetchRecentActivities() {
    this.http.get<any[]>('http://localhost:8080/api/orders/activities/recent').subscribe({
      next: (res) => { this.activities = res || []; },
      error: () => { this.activities = []; }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user': return '🆕';
      case 'order': return '✅';
      case 'product': return '📦';
      case 'wishlist': return '❤️';
      default: return '🔔';
    }
  }
}