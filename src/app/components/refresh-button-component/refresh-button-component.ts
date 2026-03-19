import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-refresh-button-component',
  imports: [],
  templateUrl: './refresh-button-component.html',
  styleUrl: './refresh-button-component.css',
})
export class RefreshButtonComponent {
  @Input() isLoading!: boolean;
  @Output() buttonClicked = new EventEmitter<void>();

  onClick() {
    this.buttonClicked.emit();
  }
}
