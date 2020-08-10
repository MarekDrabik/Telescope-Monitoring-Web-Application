import { Component, OnInit, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { AppLayoutService } from './services/app-layout.service';
import { HttpService } from './services/http.service';
import { TelemetrySettings } from './types/custom.types';

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
