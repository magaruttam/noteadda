import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/marketplace/marketplace.routes').then((m) => m.MARKETPLACE_ROUTES),
  },
  {
    path: 'seller',
    loadComponent: () =>
      import('./features/seller/pages/seller-dashboard/seller-dashboard').then(
        (m) => m.SellerDashboardComponent,
      ),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/pages/my-account/my-account').then(
        (m) => m.MyAccountComponent,
      ),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
