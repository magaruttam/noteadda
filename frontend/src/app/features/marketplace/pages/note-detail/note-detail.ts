import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CategoryApiResponse,
  NoteApiResponse,
  NoteReviewApiResponse,
} from '../../../../core/models/note.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';

const COVER_COLORS = ['indigo', 'emerald', 'blue', 'slate', 'amber', 'rose', 'violet', 'cyan'];

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './note-detail.html',
})
export class NoteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly notesService = inject(NotesService);
  readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  note: NoteApiResponse | null = null;
  reviews: NoteReviewApiResponse[] = [];
  categoryName = '';
  activeImageIndex = 0;
  loading = true;
  errorMessage = '';
  purchaseMessage = '';

  selectedRating = 5;
  hoverRating = 0;
  reviewComment = '';
  submittingReview = false;
  reviewMessage = '';
  reviewError = '';

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

  get activeImageUrl(): string | null {
    return this.note?.images?.[this.activeImageIndex]?.image_url ?? this.note?.images?.[0]?.image_url ?? null;
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

  formatCompact(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return String(count);
  }

  onGetBook(): void {
    if (!this.note) return;
    this.purchaseMessage =
      this.note.price === 0
        ? `Free download ready for "${this.note.title}".`
        : `Checkout for "${this.note.title}" (Rs. ${this.note.price}) will be available soon.`;
    this.cdr.markForCheck();
  }

  onSubmitReview(): void {
    if (!this.note || this.submittingReview || this.selectedRating < 1) return;

    this.submittingReview = true;
    this.reviewMessage = '';
    this.reviewError = '';

    const noteId = this.note.id;
    this.notesService
      .submitReview(noteId, {
        rating: this.selectedRating,
        comment: this.reviewComment.trim() || null,
      })
      .subscribe({
        next: () => {
          this.submittingReview = false;
          this.reviewMessage = 'Your rating has been saved.';
          this.reviewComment = '';
          this.refreshNoteAndReviews(noteId);
        },
        error: (err) => {
          this.submittingReview = false;
          this.reviewError = this.authService.extractErrorMessage(
            err,
            'Could not save your rating.',
          );
          this.cdr.markForCheck();
        },
      });
  }

  private refreshNoteAndReviews(noteId: number): void {
    forkJoin({
      note: this.notesService.getNote(noteId),
      reviews: this.notesService.listReviews(noteId),
    }).subscribe({
      next: ({ note, reviews }) => {
        this.note = note;
        this.reviews = reviews;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }

  private loadNote(noteId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.purchaseMessage = '';
    this.reviewMessage = '';
    this.reviewError = '';

    forkJoin({
      note: this.notesService.getNote(noteId),
      categories: this.notesService.listCategories(),
      reviews: this.notesService.listReviews(noteId),
    }).subscribe({
      next: ({
        note,
        categories,
        reviews,
      }: {
        note: NoteApiResponse;
        categories: CategoryApiResponse[];
        reviews: NoteReviewApiResponse[];
      }) => {
        this.note = note;
        this.reviews = reviews;
        this.categoryName =
          categories.find((c) => c.id === note.category_id)?.name ?? `Category #${note.category_id}`;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.note = null;
        this.reviews = [];
        this.loading = false;
        this.errorMessage = 'Note not found or unable to load note details.';
        this.cdr.markForCheck();
      },
    });
  }
}
