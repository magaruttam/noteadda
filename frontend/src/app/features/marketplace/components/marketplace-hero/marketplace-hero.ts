import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-marketplace-hero',
  standalone: true,
  imports: [HlmButtonImports],
  templateUrl: './marketplace-hero.html',
})
export class MarketplaceHeroComponent {
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() browse = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
