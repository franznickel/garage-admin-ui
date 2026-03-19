import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-card-component',
  imports: [],
  templateUrl: './info-card-component.html',
  styleUrl: './info-card-component.css',
})
export class InfoCardComponent {
  @Input() value!: string | number;
  @Input() key!: string;
}
