import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { MarketplaceHeroComponent } from '../../components/marketplace-hero/marketplace-hero';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { categories } from '../../data/marketplace.data';
import { Note } from '../../models/marketplace.model';

type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent, MarketplaceHeroComponent, NoteCardComponent],
  templateUrl: './marketplace-home.html',
  styleUrl: './marketplace-home.css',
})
export class MarketplaceHomeComponent implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly notesService = inject(NotesService);

  readonly categories = categories;
  notes: Note[] = [];

  ngOnInit(): void {
    this.notesService.listNotes({ status: 'published', limit: 100 }).subscribe({
      next: (apiNotes) => {
        this.notes = apiNotes.map((n) => this.notesService.mapApiNoteToMarketplaceNote(n));
      },
      error: () => {
        this.notes = [];
      },
    });
  }

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'price-low', label: 'Price: low to high' },
    { value: 'price-high', label: 'Price: high to low' },
  ];

  searchQuery = '';
  activeCategory = 'all';
  sortBy: SortOption = 'popular';
  sortMenuOpen = false;
  selectedNote: Note | null = null;

  get activeSortLabel(): string {
    return this.sortOptions.find((option) => option.value === this.sortBy)?.label ?? 'Most popular';
  }

  get filteredNotes(): Note[] {
    const query = this.searchQuery.trim().toLowerCase();
    const filtered = this.notes.filter((note) => {
      const matchesCategory = this.activeCategory === 'all' || note.category === this.activeCategory;
      const matchesQuery =
        !query ||
        [note.title, note.course, note.university, note.seller, note.semester].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesCategory && matchesQuery;
    });

    return filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return b.downloads - a.downloads;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  onCategorySelect(category: string): void {
    this.activeCategory = category;
  }

  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
  }

  onSortSelect(value: SortOption): void {
    this.sortBy = value;
    this.sortMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeCategory = 'all';
  }

  closePreview(): void {
    this.selectedNote = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.sortMenuOpen) return;
    const sortDropdown = this.elementRef.nativeElement.querySelector('.sort-dropdown');
    if (sortDropdown && !sortDropdown.contains(event.target as Node)) {
      this.sortMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.sortMenuOpen) {
      this.sortMenuOpen = false;
    }
    if (this.selectedNote) {
      this.closePreview();
    }
  }
}
