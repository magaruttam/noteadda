import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SellerNote } from '../../pages/seller-dashboard/seller-dashboard';

@Component({
  selector: 'app-note-analytics-modal',
  standalone: true,
  templateUrl: './note-analytics-modal.html',
  styleUrl: './note-analytics-modal.css',
})
export class NoteAnalyticsModalComponent {
  @Input({ required: true }) note!: SellerNote;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<SellerNote>();

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
    if (this.note.reviews === 0) {
      return [
        { stars: 5, pct: 0 },
        { stars: 4, pct: 0 },
        { stars: 3, pct: 0 },
      ];
    }
    return [
      { stars: 5, pct: 74 },
      { stars: 4, pct: 19 },
      { stars: 3, pct: 7 },
    ];
  }
}
