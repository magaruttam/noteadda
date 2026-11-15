import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Note } from '../models/marketplace.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  templateUrl: './note-card.html',
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
  @Output() preview = new EventEmitter<Note>();
}
