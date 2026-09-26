import { Routes } from '@angular/router';
import { Injector, inject, runInInjectionContext } from '@angular/core';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { CanActivateFn } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';

const lazyAuthGuard: CanActivateFn = async (route, state) => {
	const injector = inject(Injector);
	const { authGuard } = await import('./core/guards/auth.guard');
	const result = runInInjectionContext(injector, () => authGuard(route, state));
	return isObservable(result) ? firstValueFrom(result) : result;
};

export const routes: Routes = [
	{
		path: '', component: MainLayoutComponent, children: [
			{ path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), title: 'İpek Toptan Kuru Gıda | Doğal Lezzetler' },
			{ path: 'catalog', loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent), title: 'Ürünler | İpek Toptan' },
			{ path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent), title: 'Ürün Detayı | İpek Toptan' },
			{ path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent), title: 'Sepetim | İpek Toptan' },
			{ path: 'contacts', loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent), title: 'İletişim | İpek Toptan' },
		],
	},
	{ path: 'admin/login', loadComponent: () => import('./pages/admin/admin-login.component').then(m => m.AdminLoginComponent), title: 'Yönetici Girişi | İpek Toptan' },
	{
		path: 'admin', loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent), canActivate: [lazyAuthGuard], children: [
			{ path: '', loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent), title: 'Genel Bakış | İpek Yönetim' },
			{ path: 'orders', loadComponent: () => import('./pages/admin/admin-orders.component').then(m => m.AdminOrdersComponent), title: 'Siparişler | İpek Yönetim' },
			{ path: 'products', loadComponent: () => import('./pages/admin/admin-products.component').then(m => m.AdminProductsComponent), title: 'Ürünler | İpek Yönetim' },
			{ path: 'categories', loadComponent: () => import('./pages/admin/admin-categories.component').then(m => m.AdminCategoriesComponent), title: 'Kategoriler | İpek Yönetim' },
		],
	},
	{ path: '**', redirectTo: '' },
];
