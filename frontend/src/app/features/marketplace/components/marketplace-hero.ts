import { Component, EventEmitter, Input, Output } from '@angular/core';
import { categories } from '../data/marketplace.data';

@Component({
  selector: 'app-marketplace-hero',
  standalone: true,
  templateUrl: './marketplace-hero.html',
})
export class MarketplaceHeroComponent {
  @Input() searchQuery = '';
  @Input() activeCategory = 'all';
  @Output() searchChange = new EventEmitter<string>();
  @Output() categorySelect = new EventEmitter<string>();
  @Output() browse = new EventEmitter<void>();

  readonly facultyCategories = categories.filter((category) => category.id !== 'all');
  readonly trendingSearches = [
    'Data Structures',
    'Pulchowk Mechanics',
    'BBS Accounting',
    'MBBS Anatomy',
    'OOP Java',
  ];

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
