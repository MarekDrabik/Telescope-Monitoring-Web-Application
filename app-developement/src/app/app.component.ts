import { Component, ViewEncapsulation } from '@angular/core';
import { HttpService } from './shared/services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None //to apply general styles for whole app
})
export class AppComponent {
  constructor( private httpService: HttpService ) {
  }
}
