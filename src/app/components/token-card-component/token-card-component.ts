import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetAdminTokenInfoResponse } from '../../generated/';

@Component({
  selector: 'app-token-card-component',
  imports: [],
  templateUrl: './token-card-component.html',
  styleUrl: './token-card-component.css',
})
export class TokenCardComponent {
  @Input() token!: GetAdminTokenInfoResponse;
  @Input() deleteButton: boolean = false;
  @Output() deleteButtonClicked = new EventEmitter<void>();

  delete() {
    this.deleteButtonClicked.emit();
  }
}
