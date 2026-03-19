import { Component, Input } from '@angular/core';
import { GetAdminTokenInfoResponse } from '../../generated/';

@Component({
  selector: 'app-token-card-component',
  imports: [],
  templateUrl: './token-card-component.html',
  styleUrl: './token-card-component.css',
})
export class TokenCardComponent {
    @Input() token!: GetAdminTokenInfoResponse ;
}
