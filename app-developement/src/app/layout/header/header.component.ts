import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayoutService } from '../../services/app-layout.service';
import { ClockService } from '../../services/clock.service';
import { UtilitiesService } from '../../services/utilities.service';
import { AppletDetails } from '../../types/custom.types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // keep reference of subs to unsub in ngOnDestroy
  subscriptions: Subscription[] = [];

  currentApplets: AppletDetails[] = []
  currentTime: string;

  constructor(
    public layoutService: AppLayoutService,
    private clockService: ClockService,
    private utils: UtilitiesService
  ) { }

  ngOnInit() {
    this.subscriptions[0] = this.clockService.clock.subscribe(currentTime => {
      let dateTime = this.utils.timestampEpochnumberToDateTime(currentTime, '24', 0);
      this.currentTime = dateTime.date + ' ' + dateTime.time;
    })
    
    this.subscriptions[1] = this.layoutService.currentAppletsSubject.subscribe(currentApplets => {
      this.currentApplets = currentApplets; 
    })
  
    //reload currentApplets on every telemetry source change, therefore updating
    //names of applets' references with the first name in a row of current applet sources
    this.subscriptions[2] = this.layoutService.changeSourcesSubject.subscribe(obj => {
      this.currentApplets = this.layoutService.layout
    })    
  }

  // fixes a bug where submenu disapears on click
  trackByFunction(index, item) { 
    return item.id;
  }

  ngOnDestroy(): void {
    // just convention, not rly needed as header will never get destroyed
    for (let sub of this.subscriptions) {
      if (sub.unsubscribe) {sub.unsubscribe()}
    }
  }


}