import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-marketplace-hero',
  standalone: true,
  templateUrl: './marketplace-hero.html',
  styleUrl: './marketplace-hero.css',
})
export class MarketplaceHeroComponent {
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() browse = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
