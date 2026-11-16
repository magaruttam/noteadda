import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryApiResponse, NoteApiResponse } from '../../../../core/models/note.model';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';

const COVER_COLORS = ['indigo', 'emerald', 'blue', 'slate', 'amber', 'rose', 'violet', 'cyan'];

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './note-detail.html',
})
export class NoteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly notesService = inject(NotesService);
  private readonly cdr = inject(ChangeDetectorRef);

  note: NoteApiResponse | null = null;
  categoryName = '';
  loading = true;
  errorMessage = '';
  purchaseMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const noteId = Number(idParam);
      if (!idParam || !Number.isInteger(noteId) || noteId <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid note ID.';
        this.cdr.markForCheck();
        return;
      }

      this.loadNote(noteId);
    });
  }

  get coverColor(): string {
    if (!this.note) return 'indigo';
    return COVER_COLORS[this.note.id % COVER_COLORS.length];
  }

  get sellerDisplayName(): string {
    if (!this.note) return 'Seller';
    return (
      this.note.seller?.username ||
      this.note.seller?.full_name ||
      `Seller #${this.note.seller_id}`
    );
  }

  get discountPercent(): number {
    if (!this.note?.original_price || this.note.original_price <= this.note.price) {
      return 0;
    }
    return Math.round(((this.note.original_price - this.note.price) / this.note.original_price) * 100);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  onGetBook(): void {
    if (!this.note) return;
    this.purchaseMessage =
      this.note.price === 0
        ? `Free download ready for "${this.note.title}".`
        : `Checkout for "${this.note.title}" (Rs. ${this.note.price}) will be available soon.`;
    this.cdr.markForCheck();
  }

  private loadNote(noteId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.purchaseMessage = '';

    forkJoin({
      note: this.notesService.getNote(noteId),
      categories: this.notesService.listCategories(),
    }).subscribe({
      next: ({ note, categories }: { note: NoteApiResponse; categories: CategoryApiResponse[] }) => {
        this.note = note;
        this.categoryName =
          categories.find((c) => c.id === note.category_id)?.name ?? `Category #${note.category_id}`;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.note = null;
        this.loading = false;
        this.errorMessage = 'Note not found or unable to load note details.';
        this.cdr.markForCheck();
      },
    });
  }
}
