import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { forkJoin } from 'rxjs';
import { NotesService } from '../../../../core/services/notes.service';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer';
import { SiteHeaderComponent } from '../../../../shared/components/site-header/site-header';
import { MarketplaceHeroComponent } from '../../components/marketplace-hero/marketplace-hero';
import { NoteCardComponent } from '../../components/note-card/note-card';
import { MarketplaceCategory, Note } from '../../models/marketplace.model';

type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    MarketplaceHeroComponent,
    NoteCardComponent,
    HlmButtonImports,
    HlmCardImports,
  ],
  templateUrl: './marketplace-home.html',
})
export class MarketplaceHomeComponent implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly notesService = inject(NotesService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: MarketplaceCategory[] = [{ id: 'all', label: 'All Notes', count: '0' }];
  notes: Note[] = [];

  ngOnInit(): void {
    forkJoin({
      categories: this.notesService.listCategories(),
      notes: this.notesService.listNotes({ status: 'published', limit: 100 }),
    }).subscribe({
      next: ({ categories: apiCats, notes: apiNotes }) => {
        const slugById: Record<number, string> = {};
        for (const cat of apiCats) {
          slugById[cat.id] = cat.slug;
        }
        this.notes = apiNotes.map((n) =>
          this.notesService.mapApiNoteToMarketplaceNote(n, undefined, slugById),
        );
        this.categories = [
          { id: 'all', label: 'All Notes', count: String(this.notes.length) },
          ...apiCats.map((cat) => ({
            id: cat.slug,
            label: cat.name,
            count: String(this.notes.filter((n) => n.category === cat.slug).length),
          })),
        ];
        this.cdr.markForCheck();
      },
      error: () => {
        this.notes = [];
        this.cdr.markForCheck();
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

  scrollCategories(container: HTMLElement, direction: 'left' | 'right'): void {
    const amount = direction === 'left' ? -280 : 280;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  }

  openNoteDetail(note: Note): void {
    this.router.navigate(['/notes', note.id]);
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
