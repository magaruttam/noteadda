import { ChangeDetectorRef, Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { catchError, forkJoin, of } from 'rxjs';
import { NoteApiResponse } from '../../../../core/models/note.model';
import { AuthService } from '../../../../core/services/auth.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { Note } from '../../models/marketplace.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    NoteCardComponent,
    HlmCardImports,
    HlmBadge,
    HlmButtonImports,
  ],
  templateUrl: './favorites.html',
})
export class FavoritesComponent implements OnInit {
  readonly favoritesService = inject(FavoritesService);
  private readonly authService = inject(AuthService);
  private readonly notesService = inject(NotesService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  notes: Note[] = [];
  loading = true;
  private categorySlugById: Record<number, string> = {};
  private loadedGuestIdsKey = '';

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        const apiNotes = this.favoritesService.favoriteNotes();
        this.loading = this.favoritesService.loading();
        this.notes = apiNotes.map((n) =>
          this.notesService.mapApiNoteToMarketplaceNote(n, undefined, this.categorySlugById),
        );
        this.cdr.markForCheck();
      } else {
        const ids = this.favoritesService.favoriteIds();
        const idsKey = ids.join(',');
        if (idsKey !== this.loadedGuestIdsKey) {
          this.loadedGuestIdsKey = idsKey;
          this.loadGuestNotes(ids);
        }
      }
    });
  }

  ngOnInit(): void {
    this.notesService
      .listCategories()
      .pipe(catchError(() => of([])))
      .subscribe((categories) => {
        this.categorySlugById = Object.fromEntries(categories.map((c) => [c.id, c.slug]));
        if (this.authService.isAuthenticated()) {
          this.favoritesService.refresh();
        } else {
          const ids = this.favoritesService.favoriteIds();
          this.loadedGuestIdsKey = ids.join(',');
          this.loadGuestNotes(ids);
        }
      });
  }

  openNote(note: Note): void {
    this.router.navigate(['/notes', note.id]);
  }

  clearAll(): void {
    this.favoritesService.clearFavorites();
  }

  private loadGuestNotes(ids: number[]): void {
    if (ids.length === 0) {
      this.notes = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    forkJoin(
      ids.map((id) => this.notesService.getNote(id).pipe(catchError(() => of(null as NoteApiResponse | null)))),
    ).subscribe({
      next: (apiNotes) => {
        this.notes = apiNotes
          .filter((n): n is NoteApiResponse => n !== null)
          .map((n) => this.notesService.mapApiNoteToMarketplaceNote(n, undefined, this.categorySlugById));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notes = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
