import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Note } from '../../models/marketplace.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  templateUrl: './note-card.html',
})
export class NoteCardComponent {
  protected readonly Math = Math;

  @Input({ required: true }) note!: Note;
  @Output() preview = new EventEmitter<Note>();

  formatDownloads(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return String(count);
  }
}
