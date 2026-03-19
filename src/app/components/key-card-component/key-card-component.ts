import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListKeysResponseItem, GetBucketInfoKey } from '../../generated/';

@Component({
  selector: 'app-key-card-component',
  imports: [RouterLink],
  templateUrl: './key-card-component.html',
  styleUrl: './key-card-component.css',
})
export class KeyCardComponent {
  @Input() key!: ListKeysResponseItem | GetBucketInfoKey;
  @Input() deleteButton: boolean = false;
  @Output() deleteButtonClicked = new EventEmitter<void>();

  delete() {
    this.deleteButtonClicked.emit();
  }
}
