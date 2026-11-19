import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CategoryApiResponse,
  NoteApiResponse,
  NoteImageResponse,
} from '../../../../core/models/note.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { NoteAnalyticsModalComponent } from '../../components/note-analytics-modal/note-analytics-modal';
import {
  SellerNoteFormComponent,
  SellerNoteSavedEvent,
} from '../../components/seller-note-form/seller-note-form';
import { SellerNotesTableComponent } from '../../components/seller-notes-table/seller-notes-table';
import { SellerNote, SellerNoteStatus } from '../../models/seller-note.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    SellerNotesTableComponent,
    SellerNoteFormComponent,
    NoteAnalyticsModalComponent,
  ],
  templateUrl: './seller-dashboard.html',
})
export class SellerDashboardComponent implements OnInit {
  private readonly notesService = inject(NotesService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: CategoryApiResponse[] = [];
  sellerNotes: SellerNote[] = [];
  activeTab: 'overview' | 'create' = 'overview';
  statusFilter: 'all' | SellerNoteStatus = 'all';
  searchQuery = '';
  editingNote: SellerNote | null = null;
  selectedAnalyticsNote: SellerNote | null = null;
  toastMessage = '';

  ngOnInit(): void {
    this.notesService.listCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cdr.markForCheck();
      },
      error: () => {
        this.categories = [];
        this.cdr.markForCheck();
      },
    });

    if (!this.authService.isAuthenticated()) {
      return;
    }

    const userId = this.authService.userProfile().id;
    if (userId) {
      this.fetchSellerNotes(userId);
    } else {
      this.authService.fetchCurrentUser().subscribe({
        next: (user) => this.fetchSellerNotes(user.id),
        error: () => {},
      });
    }
  }

  get publishedCount(): number {
    return this.sellerNotes.filter((n) => n.status === 'published').length;
  }

  get totalSales(): number {
    return this.sellerNotes.reduce((sum, note) => sum + note.downloads, 0);
  }

  get totalRevenue(): number {
    return this.sellerNotes.reduce((sum, note) => sum + note.price * note.downloads, 0);
  }

  get averageRating(): string {
    const rated = this.sellerNotes.filter((n) => n.rating > 0);
    if (!rated.length) return '—';
    const avg = rated.reduce((sum, n) => sum + n.rating, 0) / rated.length;
    return avg.toFixed(1);
  }

  openCreateTab(): void {
    this.editingNote = null;
    this.activeTab = 'create';
  }

  editNote(note: SellerNote): void {
    this.editingNote = note;
    this.activeTab = 'create';
  }

  onNoteSaved(event: SellerNoteSavedEvent): void {
    const mapped = this.mapApiToSellerNote(
      event.apiNote,
      event.course,
      event.university,
      event.color,
      event.badge,
    );

    if (event.isEdit && this.editingNote) {
      const targetId = this.editingNote.id;
      this.sellerNotes = this.sellerNotes.map((item) => (item.id === targetId ? mapped : item));
    } else {
      this.sellerNotes = [mapped, ...this.sellerNotes.filter((n) => this.isNumericId(n.id))];
    }

    this.editingNote = null;
    this.activeTab = 'overview';
    this.showToast(event.message);
    this.cdr.markForCheck();
  }

  onNoteImagesUpdated(event: { noteId: string; images: NoteImageResponse[] }): void {
    this.sellerNotes = this.sellerNotes.map((item) =>
      item.id === event.noteId
        ? { ...item, images: [...event.images], coverImageUrl: event.images[0]?.image_url }
        : item,
    );
  }

  toggleStatus(note: SellerNote): void {
    const nextStatus: SellerNoteStatus = note.status === 'published' ? 'draft' : 'published';

    if (this.isNumericId(note.id) && this.authService.isAuthenticated()) {
      this.notesService.updateNote(Number(note.id), { status: nextStatus }).subscribe({
        next: (updated) => {
          this.sellerNotes = this.sellerNotes.map((item) =>
            item.id === note.id
              ? {
                  ...item,
                  status: updated.status === 'published' ? 'published' : 'draft',
                  updatedAt: updated.updated_at.slice(0, 10),
                }
              : item,
          );
          this.showToast(
            nextStatus === 'published'
              ? `"${note.title}" is now published.`
              : `"${note.title}" moved to drafts.`,
          );
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.showToast(this.authService.extractErrorMessage(err, 'Failed to update note status.'));
          this.cdr.markForCheck();
        },
      });
      return;
    }

    this.sellerNotes = this.sellerNotes.map((item) =>
      item.id === note.id
        ? { ...item, status: nextStatus, updatedAt: new Date().toISOString().slice(0, 10) }
        : item,
    );
    this.showToast(
      nextStatus === 'published' ? `"${note.title}" is now published.` : `"${note.title}" moved to drafts.`,
    );
  }

  deleteNote(note: SellerNote): void {
    if (this.isNumericId(note.id) && this.authService.isAuthenticated()) {
      this.notesService.deleteNote(Number(note.id)).subscribe({
        next: () => {
          this.sellerNotes = this.sellerNotes.filter((item) => item.id !== note.id);
          this.showToast('Note deleted.');
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.showToast(this.authService.extractErrorMessage(err, 'Failed to delete note.'));
          this.cdr.markForCheck();
        },
      });
      return;
    }

    this.sellerNotes = this.sellerNotes.filter((item) => item.id !== note.id);
    this.showToast('Note deleted.');
  }

  openAnalytics(note: SellerNote): void {
    this.selectedAnalyticsNote = note;
  }

  closeAnalytics(): void {
    this.selectedAnalyticsNote = null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedAnalyticsNote) {
      this.closeAnalytics();
    }
  }

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => {
      if (this.toastMessage === message) {
        this.toastMessage = '';
      }
    }, 3500);
  }

  private fetchSellerNotes(sellerId: number): void {
    this.notesService.listNotes({ seller_id: sellerId, limit: 100 }).subscribe({
      next: (apiNotes) => {
        this.sellerNotes = apiNotes.map((n) => this.mapApiToSellerNote(n));
        this.cdr.markForCheck();
      },
      error: () => {
        this.sellerNotes = [];
        this.cdr.markForCheck();
      },
    });
  }

  private mapApiToSellerNote(
    apiNote: NoteApiResponse,
    courseOverride?: string,
    universityOverride?: string,
    colorOverride?: string,
    badgeOverride?: string,
  ): SellerNote {
    const base = this.notesService.mapApiNoteToMarketplaceNote(apiNote, apiNote.seller_id);
    return {
      ...base,
      categoryId: apiNote.category_id,
      course: courseOverride?.trim() || base.course,
      university: universityOverride?.trim() || base.university,
      color: colorOverride || base.color,
      badge: badgeOverride?.trim() || base.badge,
      status: apiNote.status === 'published' ? 'published' : 'draft',
      fileName: apiNote.files?.[0]?.file_name || 'study-notes.pdf',
      images: apiNote.images ?? [],
      updatedAt: apiNote.updated_at.slice(0, 10),
    };
  }

  private isNumericId(id: string): boolean {
    return /^\d+$/.test(id);
  }
}
