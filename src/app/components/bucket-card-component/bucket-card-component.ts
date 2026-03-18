import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { KeyInfoBucketResponse, ListBucketsResponseItem } from '../../generated/';

@Component({
  selector: 'app-bucket-card-component',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './bucket-card-component.html',
  styleUrl: './bucket-card-component.css',
})
export class BucketCardComponent {
  @Input() bucket!: any;
}
