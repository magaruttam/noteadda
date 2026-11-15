import { Routes } from '@angular/router';
import { MarketplaceHomeComponent } from './features/marketplace/pages/marketplace-home';

export const routes: Routes = [
  { path: '', component: MarketplaceHomeComponent },
  { path: '**', redirectTo: '' },
];
