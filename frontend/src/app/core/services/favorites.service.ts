import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { NoteApiResponse } from '../models/note.model';
import { AuthService } from './auth.service';
import { NotesService } from './notes.service';

const GUEST_STORAGE_KEY = 'noteadda_favorites_guest';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);
  private readonly notesService = inject(NotesService);

  private readonly favoriteIdsSignal = signal<number[]>([]);
  private readonly favoriteNotesSignal = signal<NoteApiResponse[]>([]);
  private readonly loadingSignal = signal<boolean>(false);

  readonly favoriteIds = this.favoriteIdsSignal.asReadonly();
  readonly favoriteNotes = this.favoriteNotesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly count = computed(() => this.favoriteIdsSignal().length);

  constructor() {
    effect(() => {
      const authenticated = this.authService.isAuthenticated();
      const userId = this.authService.userProfile().id;

      if (authenticated && userId && userId > 0) {
        this.loadFromServer();
      } else {
        this.favoriteNotesSignal.set([]);
        this.favoriteIdsSignal.set(this.readFromStorage(GUEST_STORAGE_KEY));
      }
    });
  }

  refresh(): void {
    if (this.authService.isAuthenticated()) {
      this.loadFromServer();
    } else {
      this.favoriteIdsSignal.set(this.readFromStorage(GUEST_STORAGE_KEY));
    }
  }

  isFavorite(noteId: number | string): boolean {
    const id = Number(noteId);
    if (!Number.isInteger(id) || id <= 0) return false;
    return this.favoriteIdsSignal().includes(id);
  }

  toggleFavorite(noteId: number | string): boolean {
    const id = Number(noteId);
    if (!Number.isInteger(id) || id <= 0) return false;

    const currentIds = this.favoriteIdsSignal();
    const exists = currentIds.includes(id);
    const nextIds = exists ? currentIds.filter((item) => item !== id) : [id, ...currentIds];
    this.favoriteIdsSignal.set(nextIds);

    if (!this.authService.isAuthenticated()) {
      this.writeToStorage(GUEST_STORAGE_KEY, nextIds);
      return !exists;
    }

    if (exists) {
      this.favoriteNotesSignal.set(this.favoriteNotesSignal().filter((n) => n.id !== id));
      this.notesService.removeFavorite(id).subscribe({
        error: () => this.loadFromServer(),
      });
    } else {
      this.notesService.addFavorite(id).subscribe({
        next: () => this.loadFromServer(false),
        error: () => this.loadFromServer(),
      });
    }

    return !exists;
  }

  clearFavorites(): void {
    this.favoriteIdsSignal.set([]);
    this.favoriteNotesSignal.set([]);

    if (!this.authService.isAuthenticated()) {
      this.writeToStorage(GUEST_STORAGE_KEY, []);
      return;
    }

    this.notesService.clearFavorites().subscribe({
      error: () => this.loadFromServer(),
    });
  }

  private loadFromServer(showLoading = true): void {
    if (showLoading) {
      this.loadingSignal.set(true);
    }
    this.notesService.listFavorites().subscribe({
      next: (notes) => {
        this.favoriteNotesSignal.set(notes);
        this.favoriteIdsSignal.set(notes.map((n) => n.id));
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      },
    });
  }

  private readFromStorage(key: string): number[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((value) => Number(value))
        .filter((value, index, arr) => Number.isInteger(value) && value > 0 && arr.indexOf(value) === index);
    } catch {
      return [];
    }
  }

  private writeToStorage(key: string, ids: number[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      // Ignore storage quota errors
    }
  }
}
