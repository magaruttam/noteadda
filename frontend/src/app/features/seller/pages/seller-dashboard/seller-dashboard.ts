import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CategoryApiResponse,
  NoteApiResponse,
  NoteCreatePayload,
  NoteUpdatePayload,
} from '../../../../core/models/note.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { NoteCardComponent } from '../../../marketplace/components/note-card/note-card';
import { Note } from '../../../marketplace/models/marketplace.model';
import { NoteAnalyticsModalComponent } from '../../components/note-analytics-modal/note-analytics-modal';

export type SellerNoteStatus = 'published' | 'draft';

export interface SellerNote extends Note {
  categoryId: number;
  status: SellerNoteStatus;
  fileName: string;
  updatedAt: string;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    NoteCardComponent,
    NoteAnalyticsModalComponent,
  ],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly notesService = inject(NotesService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: CategoryApiResponse[] = [];
  readonly semesters = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8',
  ];
  readonly coverColors = [
    { id: 'indigo', label: 'Indigo' },
    { id: 'emerald', label: 'Emerald' },
    { id: 'blue', label: 'Blue' },
    { id: 'slate', label: 'Slate' },
    { id: 'amber', label: 'Amber' },
    { id: 'rose', label: 'Rose' },
    { id: 'violet', label: 'Violet' },
    { id: 'cyan', label: 'Cyan' },
  ];

  sellerNotes: SellerNote[] = [];
  activeTab: 'overview' | 'create' = 'overview';
  statusFilter: 'all' | SellerNoteStatus = 'all';
  searchQuery = '';
  editingNoteId: string | null = null;
  selectedAnalyticsNote: SellerNote | null = null;
  selectedFileName = '';
  selectedFile: File | null = null;
  isSubmitting = false;
  toastMessage = '';

  ngOnInit(): void {
    this.notesService.listCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        if (cats.length > 0 && !this.noteForm.controls.categoryId.value) {
          this.noteForm.controls.categoryId.setValue(cats[0].id);
        }
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

  readonly noteForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    course: [''],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    semester: [''],
    university: [''],
    pages: [null as number | null, [Validators.required, Validators.min(1)]],
    price: [null as number | null, [Validators.required, Validators.min(20)]],
    originalPrice: [null as number | null],
    color: ['indigo', [Validators.required]],
    badge: [''],
    summary: ['', [Validators.required, Validators.minLength(15)]],
    status: ['published' as SellerNoteStatus, [Validators.required]],
  });

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

  get filteredSellerNotes(): SellerNote[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.sellerNotes.filter((note) => {
      const matchesStatus = this.statusFilter === 'all' || note.status === this.statusFilter;
      const matchesQuery =
        !query ||
        [note.title, note.course, note.university, note.semester].some((v) =>
          v.toLowerCase().includes(query),
        );
      return matchesStatus && matchesQuery;
    });
  }

  get previewNote(): SellerNote {
    const raw = this.noteForm.getRawValue();
    const selectedCategory = this.categories.find((c) => c.id === Number(raw.categoryId));
    return {
      id: 'preview',
      title: raw.title.trim() || 'Your Study Note Title Will Appear Here',
      course: raw.course.trim() || 'Course',
      semester: raw.semester,
      university: raw.university.trim() || 'University',
      seller: 'You',
      category: selectedCategory?.slug || 'general',
      categoryId: Number(raw.categoryId) || 0,
      pages: Number(raw.pages) || 1,
      price: Number(raw.price) || 0,
      originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined,
      rating: 5.0,
      reviews: 0,
      downloads: 0,
      color: raw.color,
      badge: raw.badge.trim() || undefined,
      summary: raw.summary.trim() || 'Short description of what is covered in your notes.',
      status: raw.status,
      fileName: this.selectedFileName || 'study-notes.pdf',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  }

  openCreateTab(): void {
    this.editingNoteId = null;
    this.selectedFileName = '';
    this.selectedFile = null;
    this.noteForm.reset({
      title: '',
      course: '',
      categoryId: this.categories[0]?.id ?? 0,
      semester: '',
      university: '',
      pages: null,
      price: null,
      originalPrice: null,
      color: 'indigo',
      badge: '',
      summary: '',
      status: 'published',
    });
    this.activeTab = 'create';
  }

  editNote(note: SellerNote): void {
    this.editingNoteId = note.id;
    this.selectedFileName = note.fileName;
    this.selectedFile = null;
    this.noteForm.patchValue({
      title: note.title,
      course: note.course,
      categoryId: note.categoryId,
      semester: note.semester,
      university: note.university,
      pages: note.pages,
      price: note.price,
      originalPrice: note.originalPrice ?? null,
      color: note.color,
      badge: note.badge ?? '',
      summary: note.summary,
      status: note.status,
    });
    this.activeTab = 'create';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  onSubmitNote(): void {
    if (this.noteForm.invalid || this.isSubmitting) {
      this.noteForm.markAllAsTouched();
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.showToast('Please sign in first to save notes to the server.');
      return;
    }

    const raw = this.noteForm.getRawValue();
    const price = Number(raw.price);
    const originalPrice =
      raw.originalPrice && Number(raw.originalPrice) >= price ? Number(raw.originalPrice) : null;

    if (this.editingNoteId && this.isNumericId(this.editingNoteId)) {
      const noteId = Number(this.editingNoteId);
      const updatePayload: NoteUpdatePayload = {
        category_id: Number(raw.categoryId),
        title: raw.title.trim(),
        summary: raw.summary.trim(),
        description: raw.summary.trim(),
        semester: raw.semester.trim() || null,
        pages: Number(raw.pages),
        price,
        original_price: originalPrice,
        status: raw.status,
      };

      this.isSubmitting = true;
      this.notesService.updateNote(noteId, updatePayload).subscribe({
        next: (updated) => {
          const mapped = this.mapApiToSellerNote(updated, raw.course, raw.university, raw.color, raw.badge);
          this.sellerNotes = this.sellerNotes.map((item) =>
            item.id === this.editingNoteId ? mapped : item,
          );
          this.isSubmitting = false;
          this.editingNoteId = null;
          this.activeTab = 'overview';
          this.showToast('Note updated successfully.');
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showToast(this.authService.extractErrorMessage(err, 'Failed to update note.'));
          this.cdr.markForCheck();
        },
      });
      return;
    }

    const createPayload: NoteCreatePayload = {
      category_id: Number(raw.categoryId),
      title: raw.title.trim(),
      summary: raw.summary.trim(),
      description: raw.summary.trim(),
      semester: raw.semester.trim() || null,
      pages: Number(raw.pages),
      price,
      original_price: originalPrice,
      currency: 'NPR',
      status: raw.status,
      files: this.selectedFile
        ? [
            {
              file_name: this.selectedFile.name,
              file_key: `notes/files/${Date.now()}-${this.selectedFile.name}`,
              file_type: this.selectedFile.type || 'application/pdf',
              file_size: Math.max(this.selectedFile.size, 1),
              is_primary: true,
            },
          ]
        : [],
    };

    this.isSubmitting = true;
    this.notesService.createNote(createPayload).subscribe({
      next: (created) => {
        const mapped = this.mapApiToSellerNote(created, raw.course, raw.university, raw.color, raw.badge);
        this.sellerNotes = [mapped, ...this.sellerNotes.filter((n) => this.isNumericId(n.id))];
        this.isSubmitting = false;
        this.editingNoteId = null;
        this.selectedFile = null;
        this.activeTab = 'overview';
        this.showToast(
          raw.status === 'published'
            ? 'Your note is now published in your seller catalog.'
            : 'Your note was saved as a draft.',
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showToast(this.authService.extractErrorMessage(err, 'Failed to create note.'));
        this.cdr.markForCheck();
      },
    });
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
      updatedAt: apiNote.updated_at.slice(0, 10),
    };
  }

  private isNumericId(id: string): boolean {
    return /^\d+$/.test(id);
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

  private showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => {
      if (this.toastMessage === message) {
        this.toastMessage = '';
      }
    }, 3500);
  }
}
