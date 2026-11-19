import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { SellerNote, SellerNoteStatus } from '../../models/seller-note.model';

@Component({
  selector: 'app-seller-notes-table',
  standalone: true,
  imports: [HlmCardImports, HlmButtonImports, HlmInput, HlmTableImports, HlmBadge, HlmTooltip],
  templateUrl: './seller-notes-table.html',
})
export class SellerNotesTableComponent {
  @Input({ required: true }) notes: SellerNote[] = [];
  @Input() statusFilter: 'all' | SellerNoteStatus = 'all';
  @Input() searchQuery = '';

  @Output() statusFilterChange = new EventEmitter<'all' | SellerNoteStatus>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() analytics = new EventEmitter<SellerNote>();
  @Output() edit = new EventEmitter<SellerNote>();
  @Output() toggleStatus = new EventEmitter<SellerNote>();
  @Output() delete = new EventEmitter<SellerNote>();
  @Output() createNew = new EventEmitter<void>();

  get filteredNotes(): SellerNote[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.notes.filter((note) => {
      const matchesStatus = this.statusFilter === 'all' || note.status === this.statusFilter;
      const matchesQuery =
        !query ||
        [note.title, note.course, note.university, note.semester].some((v) =>
          v.toLowerCase().includes(query),
        );
      return matchesStatus && matchesQuery;
    });
  }
}
