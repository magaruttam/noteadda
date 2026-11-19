import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { NoteReviewApiResponse } from '../../../../core/models/note.model';
import { NotesService } from '../../../../core/services/notes.service';
import { SellerNote } from '../../models/seller-note.model';

@Component({
  selector: 'app-note-analytics-modal',
  standalone: true,
  templateUrl: './note-analytics-modal.html',
})
export class NoteAnalyticsModalComponent implements OnChanges {
  private readonly notesService = inject(NotesService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) note!: SellerNote;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<SellerNote>();

  reviews: NoteReviewApiResponse[] = [];

  ngOnChanges(): void {
    const noteId = Number(this.note?.id);
    if (!Number.isInteger(noteId) || noteId <= 0) {
      this.reviews = [];
      return;
    }

    this.notesService.listReviews(noteId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.cdr.markForCheck();
      },
    });
  }

  get estimatedViews(): number {
    if (this.note.downloads === 0) {
      return this.note.status === 'published' ? 24 : 0;
    }
    return Math.round(this.note.downloads * 4.6 + this.note.reviews * 2.1);
  }

  get conversionRate(): string {
    if (this.estimatedViews === 0) return '0.0%';
    return `${((this.note.downloads / this.estimatedViews) * 100).toFixed(1)}%`;
  }

  get grossRevenue(): number {
    return this.note.price * this.note.downloads;
  }

  get netEarnings(): number {
    return Math.round(this.grossRevenue * 0.85);
  }

  get monthlyTrend(): { label: string; sales: number; heightPct: number }[] {
    const base = Math.max(this.note.downloads, 6);
    const weights = [0.1, 0.14, 0.13, 0.18, 0.21, 0.24];
    const labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const counts = weights.map((w) => (this.note.downloads === 0 ? 0 : Math.max(1, Math.round(base * w))));
    const max = Math.max(...counts, 1);

    return labels.map((label, i) => ({
      label,
      sales: counts[i],
      heightPct: counts[i] === 0 ? 8 : Math.round((counts[i] / max) * 100),
    }));
  }

  get ratingBreakdown(): { stars: number; pct: number }[] {
    const total = this.reviews.length;
    return [5, 4, 3, 2, 1].map((stars) => {
      if (total === 0) {
        return { stars, pct: 0 };
      }
      const count = this.reviews.filter((r) => r.rating === stars).length;
      return { stars, pct: Math.round((count / total) * 100) };
    });
  }
}
