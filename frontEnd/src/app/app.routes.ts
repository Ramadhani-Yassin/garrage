import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Admin } from './components/admin/admin';
import { NotFound } from './components/not-found/not-found';
import { Login } from './components/login/login';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { ProductDetails } from './components/product-details/product-details';
import { ProductList } from './components/product-list/product-list';
import { Profile } from './components/profile/profile';
import { Register } from './components/register/register';


export const routes: Routes = [
    {path: '', component: Home},
    {path: 'home', component: Home},
    {path: 'admin', component: Admin},
    {path: 'login', component: Login},
    {path: 'cart', component: Cart},
    {path: 'checkout', component: Checkout},
    {path: 'footer', component: Footer},
    {path: 'navbar', component: Navbar},
    {path: 'product-details', component: ProductDetails},
    {path: 'product-list', component: ProductList},
    {path: 'profile', component: Profile},
    {path: 'register', component: Register},
    {path: '**', component: NotFound}

];
