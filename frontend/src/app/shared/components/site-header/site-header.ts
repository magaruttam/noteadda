import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeaderComponent {
  readonly authService = inject(AuthService);

  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();

  menuOpen = false;

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  onLogout(): void {
    this.authService.logout();
    this.menuOpen = false;
  }
}
