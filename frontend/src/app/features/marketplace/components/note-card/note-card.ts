import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { Note } from '../../models/marketplace.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [HlmCardImports, HlmBadge, HlmButtonImports],
  templateUrl: './note-card.html',
})
export class NoteCardComponent {
  protected readonly Math = Math;
  readonly favoritesService = inject(FavoritesService);

  @Input({ required: true }) note!: Note;
  @Output() preview = new EventEmitter<Note>();

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.note.id);
  }

  formatDownloads(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return String(count);
  }
}
