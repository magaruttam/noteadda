import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-site-header',
  standalone: true,
  templateUrl: './site-header.html',
})
export class SiteHeaderComponent {
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sellClick = new EventEmitter<void>();

  menuOpen = false;
  profileOpen = false;

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
