import { Routes } from '@angular/router';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/marketplace-home/marketplace-home').then((m) => m.MarketplaceHomeComponent),
  },
];
