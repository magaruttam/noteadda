import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { concatMap, from, of, toArray } from 'rxjs';
import {
  CategoryApiResponse,
  NoteApiResponse,
  NoteCreatePayload,
  NoteImageResponse,
  NoteUpdatePayload,
} from '../../../../core/models/note.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotesService } from '../../../../core/services/notes.service';
import { NoteCardComponent } from '../../../marketplace/components/note-card/note-card';
import { SellerNote, SellerNoteStatus } from '../../models/seller-note.model';

interface PendingNoteImage {
  file: File;
  previewUrl: string;
}

export interface SellerNoteSavedEvent {
  apiNote: NoteApiResponse;
  isEdit: boolean;
  course: string;
  university: string;
  color: string;
  badge: string;
  message: string;
}

@Component({
  selector: 'app-seller-note-form',
  standalone: true,
  imports: [ReactiveFormsModule, NoteCardComponent],
  templateUrl: './seller-note-form.html',
})
export class SellerNoteFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly notesService = inject(NotesService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() categories: CategoryApiResponse[] = [];
  @Input() editingNote: SellerNote | null = null;

  @Output() saved = new EventEmitter<SellerNoteSavedEvent>();
  @Output() imagesUpdated = new EventEmitter<{ noteId: string; images: NoteImageResponse[] }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() notify = new EventEmitter<string>();

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

  selectedFileName = '';
  selectedFile: File | null = null;
  noteImages: NoteImageResponse[] = [];
  pendingImages: PendingNoteImage[] = [];
  imageUploading = false;
  imageError = '';
  isSubmitting = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingNote']) {
      this.clearPendingImages();
      this.imageError = '';
      this.selectedFile = null;

      if (this.editingNote) {
        this.selectedFileName = this.editingNote.fileName;
        this.noteImages = [...this.editingNote.images];
        this.noteForm.patchValue({
          title: this.editingNote.title,
          course: this.editingNote.course,
          categoryId: this.editingNote.categoryId,
          semester: this.editingNote.semester,
          university: this.editingNote.university,
          pages: this.editingNote.pages,
          price: this.editingNote.price,
          originalPrice: this.editingNote.originalPrice ?? null,
          color: this.editingNote.color,
          badge: this.editingNote.badge ?? '',
          summary: this.editingNote.summary,
          status: this.editingNote.status,
        });
      } else {
        this.selectedFileName = '';
        this.noteImages = [];
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
      }
    } else if (changes['categories'] && !this.editingNote && !this.noteForm.controls.categoryId.value) {
      if (this.categories.length > 0) {
        this.noteForm.controls.categoryId.setValue(this.categories[0].id);
      }
    }
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
      coverImageUrl: this.noteImages[0]?.image_url ?? this.pendingImages[0]?.previewUrl,
      badge: raw.badge.trim() || undefined,
      summary: raw.summary.trim() || 'Short description of what is covered in your notes.',
      status: raw.status,
      fileName: this.selectedFileName || 'study-notes.pdf',
      images: this.noteImages,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  onNoteImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    this.imageError = '';
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const validFiles: File[] = [];

    for (const file of files) {
      if (!allowedTypes.has(file.type)) {
        this.imageError = 'Only JPEG, PNG, WEBP, and GIF images are supported.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = `Image "${file.name}" exceeds the 5 MB limit.`;
        return;
      }
      validFiles.push(file);
    }

    if (this.editingNote && this.isNumericId(this.editingNote.id) && this.authService.isAuthenticated()) {
      const noteId = Number(this.editingNote.id);
      this.imageUploading = true;
      from(validFiles)
        .pipe(
          concatMap((file) => this.notesService.uploadNoteImage(noteId, file)),
          toArray(),
        )
        .subscribe({
          next: (uploaded) => {
            this.noteImages = [...this.noteImages, ...uploaded];
            this.imagesUpdated.emit({ noteId: String(noteId), images: this.noteImages });
            this.imageUploading = false;
            this.notify.emit(`Uploaded ${uploaded.length} image(s).`);
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.imageUploading = false;
            this.imageError = this.authService.extractErrorMessage(err, 'Failed to upload note image.');
            this.cdr.markForCheck();
          },
        });
      return;
    }

    for (const file of validFiles) {
      this.pendingImages.push({ file, previewUrl: URL.createObjectURL(file) });
    }
  }

  moveExistingImage(index: number, delta: -1 | 1): void {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= this.noteImages.length) return;

    const reordered = [...this.noteImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (this.editingNote && this.isNumericId(this.editingNote.id) && this.authService.isAuthenticated()) {
      const noteId = Number(this.editingNote.id);
      this.imageUploading = true;
      this.notesService.reorderNoteImages(noteId, reordered.map((img) => img.id)).subscribe({
        next: (updated) => {
          this.noteImages = updated;
          this.imagesUpdated.emit({ noteId: String(noteId), images: updated });
          this.imageUploading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.imageUploading = false;
          this.imageError = this.authService.extractErrorMessage(err, 'Failed to reorder images.');
          this.cdr.markForCheck();
        },
      });
    }
  }

  deleteExistingImage(image: NoteImageResponse): void {
    if (!this.editingNote || !this.isNumericId(this.editingNote.id)) return;
    const noteId = Number(this.editingNote.id);

    this.imageUploading = true;
    this.notesService.deleteNoteImage(noteId, image.id).subscribe({
      next: () => {
        this.noteImages = this.noteImages.filter((img) => img.id !== image.id);
        this.imagesUpdated.emit({ noteId: String(noteId), images: this.noteImages });
        this.imageUploading = false;
        this.notify.emit('Image removed.');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.imageUploading = false;
        this.imageError = this.authService.extractErrorMessage(err, 'Failed to delete image.');
        this.cdr.markForCheck();
      },
    });
  }

  movePendingImage(index: number, delta: -1 | 1): void {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= this.pendingImages.length) return;
    const [moved] = this.pendingImages.splice(index, 1);
    this.pendingImages.splice(targetIndex, 0, moved);
  }

  removePendingImage(index: number): void {
    const [removed] = this.pendingImages.splice(index, 1);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  onSubmitNote(): void {
    if (this.noteForm.invalid || this.isSubmitting) {
      this.noteForm.markAllAsTouched();
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.notify.emit('Please sign in first to save notes to the server.');
      return;
    }

    const raw = this.noteForm.getRawValue();
    const price = Number(raw.price);
    const originalPrice =
      raw.originalPrice && Number(raw.originalPrice) >= price ? Number(raw.originalPrice) : null;

    if (this.editingNote && this.isNumericId(this.editingNote.id)) {
      const noteId = Number(this.editingNote.id);
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
          this.isSubmitting = false;
          this.saved.emit({
            apiNote: updated,
            isEdit: true,
            course: raw.course,
            university: raw.university,
            color: raw.color,
            badge: raw.badge,
            message: 'Note updated successfully.',
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notify.emit(this.authService.extractErrorMessage(err, 'Failed to update note.'));
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
        const filesToUpload = this.pendingImages.map((p) => p.file);
        const upload$ = filesToUpload.length
          ? from(filesToUpload).pipe(
              concatMap((file, index) => this.notesService.uploadNoteImage(created.id, file, undefined, index)),
              toArray(),
            )
          : of([] as NoteImageResponse[]);

        upload$.subscribe({
          next: (uploadedImages) => {
            this.isSubmitting = false;
            this.selectedFile = null;
            this.clearPendingImages();
            this.saved.emit({
              apiNote: { ...created, images: uploadedImages },
              isEdit: false,
              course: raw.course,
              university: raw.university,
              color: raw.color,
              badge: raw.badge,
              message:
                raw.status === 'published'
                  ? 'Your note is now published in your seller catalog.'
                  : 'Your note was saved as a draft.',
            });
            this.cdr.markForCheck();
          },
          error: (imgErr) => {
            this.isSubmitting = false;
            this.selectedFile = null;
            this.clearPendingImages();
            this.saved.emit({
              apiNote: created,
              isEdit: false,
              course: raw.course,
              university: raw.university,
              color: raw.color,
              badge: raw.badge,
              message: this.authService.extractErrorMessage(
                imgErr,
                'Note created, but some images failed to upload. Edit the note to retry.',
              ),
            });
            this.cdr.markForCheck();
          },
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notify.emit(this.authService.extractErrorMessage(err, 'Failed to create note.'));
        this.cdr.markForCheck();
      },
    });
  }

  private clearPendingImages(): void {
    for (const item of this.pendingImages) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.pendingImages = [];
  }

  private isNumericId(id: string): boolean {
    return /^\d+$/.test(id);
  }
}
