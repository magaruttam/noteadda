import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { forkJoin } from 'rxjs';
import { NotesService } from '../../../../core/services/notes.service';
import { PublicUserProfile, UsersService } from '../../../../core/services/users.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { Note } from '../../models/marketplace.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    SiteHeaderComponent,
    SiteFooterComponent,
    NoteCardComponent,
    HlmCardImports,
    HlmAvatarImports,
    HlmBadge,
    HlmButtonImports,
  ],
  templateUrl: './user-profile.html',
})
export class UserProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly notesService = inject(NotesService);
  private readonly cdr = inject(ChangeDetectorRef);

  user: PublicUserProfile | null = null;
  notes: Note[] = [];
  totalDownloads = 0;
  averageRating = 0;
  isAvatarLightboxOpen = false;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const userId = Number(idParam);
      if (!idParam || !Number.isInteger(userId) || userId <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid user ID.';
        this.cdr.markForCheck();
        return;
      }

      this.loadProfile(userId);
    });
  }

  get displayName(): string {
    if (!this.user) return 'User';
    return this.user.full_name?.trim() || this.user.username;
  }

  get initials(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  openAvatarLightbox(): void {
    if (!this.user?.profile_image_url) return;
    this.isAvatarLightboxOpen = true;
  }

  closeAvatarLightbox(): void {
    this.isAvatarLightboxOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isAvatarLightboxOpen) {
      this.closeAvatarLightbox();
    }
  }

  private loadProfile(userId: number): void {
    this.loading = true;
    this.isAvatarLightboxOpen = false;
    this.errorMessage = '';

    forkJoin({
      user: this.usersService.getPublicProfile(userId),
      apiNotes: this.notesService.listNotes({ seller_id: userId, status: 'published', limit: 100 }),
      categories: this.notesService.listCategories(),
    }).subscribe({
      next: ({ user, apiNotes, categories }) => {
        const categorySlugById = Object.fromEntries(categories.map((c) => [c.id, c.slug]));
        this.user = user;
        this.notes = apiNotes.map((n) =>
          this.notesService.mapApiNoteToMarketplaceNote(n, undefined, categorySlugById),
        );
        this.totalDownloads = apiNotes.reduce((sum, n) => sum + (n.downloads_count || 0), 0);
        const ratedNotes = apiNotes.filter((n) => (n.reviews_count || 0) > 0);
        this.averageRating = ratedNotes.length
          ? ratedNotes.reduce((sum, n) => sum + (Number(n.rating) || 0), 0) / ratedNotes.length
          : 0;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.user = null;
        this.notes = [];
        this.loading = false;
        this.errorMessage = 'User profile not found.';
        this.cdr.markForCheck();
      },
    });
  }
}
