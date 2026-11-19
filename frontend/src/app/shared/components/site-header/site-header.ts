import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, HlmButtonImports, HlmAvatarImports, HlmInput, HlmSeparator],
  templateUrl: './site-header.html',
})
export class SiteHeaderComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();

  menuOpen = false;
  profileMenuOpen = false;

  onSearchInput(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.profileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.profileMenuOpen) return;
    const menuWrap = this.elementRef.nativeElement.querySelector('.profile-dropdown');
    if (menuWrap && !menuWrap.contains(event.target as Node)) {
      this.profileMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.profileMenuOpen = false;
    this.menuOpen = false;
  }
}
