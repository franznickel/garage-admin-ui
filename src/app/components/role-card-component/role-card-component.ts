import {Component, Input} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-role-card-component',
  imports: [
    DecimalPipe
  ],
  templateUrl: './role-card-component.html',
  styleUrl: './role-card-component.css',
})
export class RoleCardComponent {
  @Input() role!: any;
  @Input() node!: any;
}
