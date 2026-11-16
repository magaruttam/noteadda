import { Routes } from '@angular/router';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/marketplace-home/marketplace-home').then((m) => m.MarketplaceHomeComponent),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./pages/notes-catalog/notes-catalog').then((m) => m.NotesCatalogComponent),
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./pages/note-detail/note-detail').then((m) => m.NoteDetailComponent),
  },
];
