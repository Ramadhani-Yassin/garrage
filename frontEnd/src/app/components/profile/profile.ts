import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user.model';
import { ProductService, Product } from '../../services/product.service';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { OrderService, Order as BackendOrder, OrderItem as OrderItemDto } from '../../services/order.service';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { filter } from 'rxjs/operators';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  avatar: string;
  joinDate: Date;
}

interface Address {
  id: number;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface Spare {
  id: number;
  code: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: Date;
  used: boolean;
}

interface FAQ {
  question: string;
  answer: string;
  expanded: boolean;
}

interface Settings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: boolean;
  orderHistoryPrivate: boolean;
  twoFactorEnabled: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule, RouterModule],
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  // Component state
  sidebarCollapsed = false;
  activeTab = 'dashboard';
  orderFilter = 'all';
  spareTab = 'available';
  searchQuery: string = '';
  notifications = 3;
  showAddAddressModal = false;
  showLogoutModal: boolean = false;
  cart: Cart | null = null;
  showCartModal = false;
  cartLoading = false;
  selectedOrder: BackendOrder | null = null;
  showOrderDetailsModal: boolean = false;
  showPaymentModal = false;
  paymentMethod = '';
  paymentPhoneOrCard = '';
  paymentFullName = '';
  paymentError = '';
  paymentSubmitting = false;

  // User data
  userProfile: any = {};
  successMessage: string = '';
  errorMessage: string = '';
  showOrderSuccess: boolean = false;

  // Orders data
  orders: BackendOrder[] = [];

  // Wishlist data
  wishlist: Product[] = [
    {
      id: 1,
      name: 'Laptop Stand',
      price: 49.99,
      image: './autospare.png',
      stock: 10,
      status: 'active',
      category: ''
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      price: 29.99,
      image: './autospare.png',
      stock: 0,
      status: 'inactive',
      category: ''
    }
  ];
  wishlistItems: WishlistItem[] = [];

  // Addresses data
  addresses: Address[] = [
    {
      id: 1,
      type: 'home',
      firstName: 'John',
      lastName: 'Doe',
      street: 'Mkapa Road',
      city: 'Zanzibar',
      state: 'Zanzibar',
      zipCode: '10001',
      country: 'Tanzania',
      isDefault: true
    }
  ];

  // New address form
  newAddress: Partial<Address> = {
    type: 'home',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  };

  // Coupons data
  spares: Spare[] = [
    {
      id: 1,
      code: 'SAVE20',
      description: '20% off your next purchase',
      discount: 20,
      discountType: 'percentage',
      expiryDate: new Date('2024-12-31'),
      used: false
    },
    {
      id: 2,
      code: 'FREESHIP',
      description: 'Free shipping on orders over $50',
      discount: 0,
      discountType: 'fixed',
      expiryDate: new Date('2024-06-30'),
      used: true
    }
  ];

  // Settings data
  settings: Settings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    profileVisibility: true,
    orderHistoryPrivate: false,
    twoFactorEnabled: false
  };

  faqs: FAQ[] = [];

  // Example: Search/filter wishlist and orders by product name or order id
  filteredWishlist: Product[] = [];
  // Remove filteredOrders: Order[] = [];
  products: Product[] = [];

  private routerSub?: Subscription;

  constructor(
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    private cartService: CartService,
    private orderService: OrderService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.fetchProfileData();
      this.fetchCart();
    });
    this.fetchProfileData();
    this.fetchCart();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private fetchProfileData(): void {
    let user = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        user = JSON.parse(stored);
      }
    }
    if (user && user.email) {
      this.userService.getProfile(user.email).subscribe({
        next: (profile: User) => {
          this.userProfile = profile;
          // Update localStorage with latest info
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('currentUser', JSON.stringify(profile));
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load profile.';
        }
      });
    }
    this.faqs = [
      {
        question: 'How do I reset my password?',
        answer: 'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions to reset your password.',
        expanded: false
      },
      {
        question: 'How can I track my order?',
        answer: 'You can track your order by going to the "My Orders" section and clicking on the tracking number of your order.',
        expanded: false
      },
      {
        question: 'What is the return policy?',
        answer: 'You can return items within 30 days of receipt. Please ensure that items are in their original condition.',
        expanded: false
      }
    ];
    this.filteredWishlist = this.wishlist;
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
    // Fetch orders for the current user
    if (user && user.email) {
      this.orderService.getOrdersByUser(user.email).subscribe(orders => {
        this.orders = orders;
      });
    }
    // Fetch wishlist for the current user
    if (user && user.email) {
      this.wishlistService.getWishlist(user.email).subscribe(items => {
        this.wishlistItems = items;
      });
    }
  }

  fetchCart(): void {
    const user = this.getCurrentUser();
    if (user && user.email) {
      this.cartLoading = true;
      this.cartService.getCart(user.email).subscribe({
        next: (cart) => { this.cart = cart; this.cartLoading = false; },
        error: () => { this.cartLoading = false; }
      });
    }
  }
  openCart(): void {
    this.showCartModal = true;
    this.fetchCart();
  }
  closeCart(): void {
    this.showCartModal = false;
  }
  addToCart(product: Product): void {
    const user = this.getCurrentUser();
    if (!user || !user.email || typeof product.id !== 'number') return;
    this.cartService.addToCart(user.email, product.id, 1).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.showCartModal = true;
        this.successMessage = `${product.name} added to cart!`;
        setTimeout(() => { this.successMessage = ''; }, 2000);
      },
      error: () => {}
    });
  }
  updateCartItem(item: CartItem, quantity: number): void {
    const user = this.getCurrentUser();
    if (!user || !user.email) return;
    this.cartService.updateCartItem(user.email, item.product.id, quantity).subscribe(cart => this.cart = cart);
  }
  removeCartItem(item: CartItem): void {
    const user = this.getCurrentUser();
    if (!user || !user.email) return;
    this.cartService.removeCartItem(user.email, item.product.id).subscribe(cart => this.cart = cart);
  }
  clearCart(): void {
    const user = this.getCurrentUser();
    if (!user || !user.email) return;
    this.cartService.clearCart(user.email).subscribe(cart => this.cart = cart);
  }
  checkoutCart(): void {
    const user = this.getCurrentUser();
    if (!user || !user.email) return;
    this.cartService.checkout(user.email).subscribe(() => { this.clearCart(); this.closeCart(); });
  }
  confirmOrder(): void {
    // Instead of placing the order, open the payment modal
    this.showCartModal = false;
    this.showPaymentModal = true;
    this.paymentMethod = '';
    this.paymentPhoneOrCard = '';
    this.paymentFullName = '';
    this.paymentError = '';
  }
  finishOrdering(): void {
    if (!this.paymentMethod || !this.paymentPhoneOrCard || !this.paymentFullName) {
      this.paymentError = 'Please fill in all payment details.';
      return;
    }
    if (this.paymentSubmitting) return;
    this.paymentSubmitting = true;
    this.paymentError = '';
    // Build the order payload as before, but add payment info
    const user = this.getCurrentUser();
    if (!user || !user.email || !this.cart || !this.cart.items.length) {
      this.paymentSubmitting = false;
      return;
    }
    const items: OrderItemDto[] = this.cart.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price
    }));
    const orderPayload = {
      userEmail: user.email,
      total: this.getCartTotal(),
      items,
      payment: {
        method: this.getPaymentMethodLabel(this.paymentMethod),
        phoneOrCard: this.paymentPhoneOrCard,
        fullName: this.paymentFullName
      }
    };
    this.clearCart();
    this.cart = { id: 0, userEmail: '', items: [] };
    this.showOrderSuccess = true;
    this.successMessage = 'Order confirmed successfully!';
    this.showPaymentModal = false;
    setTimeout(() => { this.showOrderSuccess = false; this.successMessage = ''; }, 3000);
    this.orderService.placeOrder(orderPayload).subscribe({
      next: () => {
        this.fetchProfileData();
        this.paymentSubmitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to place order.';
        this.paymentSubmitting = false;
      }
    });
  }
  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'mix': return 'MIX BY YAS';
      case 'mpesa': return 'M-PESA';
      case 'halopesa': return 'HALOPESA';
      case 'airtel': return 'AIRTEL MONEY';
      case 'bank': return 'BANK';
      default: return method;
    }
  }
  getCurrentUser(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('currentUser');
      if (stored) return JSON.parse(stored);
    }
    return null;
  }

  // Navigation methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      orders: 'My Orders',
      wishlist: 'Wishlist',
      profile: 'Profile',
      addresses: 'Addresses',
      coupons: 'Coupons',
      reviews: 'Reviews',
      support: 'Support',
      settings: 'Settings'
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  get firstName(): string {
    return this.userProfile?.fullName?.split(' ')[0] || '';
  }

  // Dashboard methods
  getPendingOrdersCount(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getCompletedOrdersCount(): number {
    return this.orders.filter(order => order.status === 'delivered' || order.status === 'approved').length;
  }

  getAvailableSpares(): number {
    return this.spares.filter(spare => !spare.used && !this.isExpired(spare)).length;
  }

  getRecentOrders(): BackendOrder[] {
    return this.orders.slice(0, 3);
  }

  getRecommendedProducts(): Product[] {
    return this.wishlist.slice(0, 3);
  }

  getTotalSpent(): string {
    const total = this.orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    return `$${total.toFixed(2)}`;
  }

  getReviewsCount(): number {
    return this.orders.filter(order => order.status === 'delivered').length * 2;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
  }

  // Order methods
  getFilteredOrders(): BackendOrder[] {
    if (this.orderFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.orderFilter);
  }

  viewOrderDetails(order: BackendOrder): void {
    this.selectedOrder = order;
    this.showOrderDetailsModal = true;
  }
  closeOrderDetailsModal(): void {
    this.showOrderDetailsModal = false;
    this.selectedOrder = null;
  }

  trackOrder(order: BackendOrder): void {
    console.log('Tracking order:', order.id);
  }

  cancelOrder(order: BackendOrder): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      order.status = 'cancelled';
    }
  }

  reorderItems(order: BackendOrder): void {
    console.log('Reordering items from order:', order.id);
  }

  getProductNames(order: BackendOrder): string {
    return order.items.map((p: any) => p.productName + ' (' + p.quantity + ')').join(', ');
  }

  statusLabel(status: string | null | undefined): string {
    if (!status) return 'Pending';
    const map: { [key: string]: string } = {
      pending: 'Pending',
      shipping: 'Shipping',
      shipped: 'Shipped',
      delivered: 'Delivered',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
      cancelled: 'Cancelled',
    };
    return map[status] || (typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending');
  }

  // Wishlist methods
  removeFromWishlist(productId: number): void {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
  }

  viewProduct(product: Product): void {
    console.log('Viewing product:', product.name);
  }

  browseProdcuts(): void {
    console.log('Browsing products');
  }

  isInWishlist(product: Product): boolean {
    return this.wishlistItems.some(item => item.productId === product.id);
  }
  addOrRemoveWishlist(product: Product): void {
    const user = this.getCurrentUser();
    if (!user || !user.email || typeof product.id !== 'number') return;
    if (this.isInWishlist(product)) {
      this.wishlistService.removeFromWishlist(user.email, product.id).subscribe(() => {
        this.wishlistItems = this.wishlistItems.filter(item => item.productId !== product.id);
      });
    } else {
      this.wishlistService.addToWishlist(user.email, product.id, product.name).subscribe(item => {
        this.wishlistItems.push(item);
      });
    }
  }

  // Profile methods
  updateProfile(): void {
    if (!this.userProfile.email) {
      this.errorMessage = 'Cannot update profile: missing email.';
      return;
    }
    this.userService.updateProfileByEmail(this.userProfile).subscribe({
      next: (updated: User) => {
        this.userProfile = updated;
        this.successMessage = 'Profile updated successfully!';
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(updated));
        }
        setTimeout(() => { this.successMessage = ''; }, 2500);
      },
      error: () => {
        this.errorMessage = 'Failed to update profile.';
      }
    });
  }

  resetForm(): void {
    // Reset to original values - you might want to keep a backup
    console.log('Resetting form');
  }

  // Address methods
  addAddress(): void {
    if (this.newAddress.firstName && this.newAddress.lastName && this.newAddress.street) {
      const address: Address = {
        id: Date.now(),
        type: this.newAddress.type || 'home',
        firstName: this.newAddress.firstName,
        lastName: this.newAddress.lastName,
        street: this.newAddress.street,
        city: this.newAddress.city || '',
        state: this.newAddress.state || '',
        zipCode: this.newAddress.zipCode || '',
        country: this.newAddress.country || '',
        isDefault: this.newAddress.isDefault || false
      };

      if (address.isDefault) {
        this.addresses.forEach(addr => addr.isDefault = false);
      }

      this.addresses.push(address);
      this.showAddAddressModal = false;
      this.resetNewAddress();
    }
  }

  editAddress(address: Address): void {
    console.log('Editing address:', address);
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addresses = this.addresses.filter(addr => addr.id !== Number(addressId));
    }
  }

  setDefaultAddress(addressId: string): void {
    this.addresses.forEach(addr => {
      addr.isDefault = addr.id === Number(addressId);
    });
  }

  private resetNewAddress(): void {
    this.newAddress = {
      type: 'home',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    };
  }

  // Coupon methods
  getFilteredSpares(): Spare[] {
    switch (this.spareTab) {
      case 'available':
        return this.spares.filter(spare => !spare.used && !this.isExpired(spare));
      case 'used':
        return this.spares.filter(spare => spare.used);
      case 'expired':
        return this.spares.filter(spare => this.isExpired(spare));
      default:
        return this.spares;
    }
  }

  getUsedSpares(): number {
    return this.spares.filter(spare => spare.used).length;
  }

  getExpiredSpares(): number {
    return this.spares.filter(spare => this.isExpired(spare)).length;
  }

  isExpired(spare: Spare): boolean {
    return new Date() > spare.expiryDate;
  }

  copySpareCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Spare code copied:', code);
    });
  }

  // FAQ methods
  toggleFaq(faq: FAQ): void {
    faq.expanded = !faq.expanded;
  }

  // Settings methods
  saveSettings(): void {
    console.log('Saving settings:', this.settings);
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account');
    }
  }

  // Utility methods
  logout(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
    window.location.href = '/home';
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input?.value || '';

    // Filter wishlist by product name
    this.filteredWishlist = this.wishlist.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getCartTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getCartQuantity(product: Product): number {
    if (!this.cart || !this.cart.items) return 0;
    const item = this.cart.items.find(i => i.product.id === product.id);
    return item ? item.quantity : 0;
  }
  incrementCart(product: Product): void {
    const user = this.getCurrentUser();
    if (!user || !user.email || typeof product.id !== 'number') return;
    this.cartService.addToCart(user.email, product.id, 1).subscribe(cart => this.cart = cart);
  }
  decrementCart(product: Product): void {
    const user = this.getCurrentUser();
    if (!user || !user.email || typeof product.id !== 'number') return;
    const item = this.cart?.items.find(i => i.product.id === product.id);
    if (item && item.quantity > 1) {
      this.cartService.updateCartItem(user.email, product.id, item.quantity - 1).subscribe(cart => this.cart = cart);
    } else if (item && item.quantity === 1) {
      this.cartService.removeCartItem(user.email, product.id).subscribe(cart => this.cart = cart);
    }
  }

  getCartItemCount(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get wishlistProducts(): Product[] {
    // Map wishlistItems to full product info from products list
    return this.wishlistItems
      .map(item => this.products.find(p => p.id === item.productId))
      .filter((p): p is Product => !!p);
  }

}
