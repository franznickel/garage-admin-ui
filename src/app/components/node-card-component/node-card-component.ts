import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-node-card-component',
  imports: [
    RouterLink
  ],
  templateUrl: './node-card-component.html',
  styleUrl: './node-card-component.css',
})
export class NodeCardComponent {
  @Input() node!: any;
}
