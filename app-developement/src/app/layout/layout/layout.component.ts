import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayoutService } from 'src/app/services/app-layout.service';
import { AppletDetails, ConnectionProblem } from 'src/app/types/custom.types';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  @ViewChildren('applet', {read: ElementRef}) applets: QueryList<ElementRef>;

  imageries: AppletDetails[] = [];
  graphs: AppletDetails[] = [];
  tables: AppletDetails[] = [];
  commanders: AppletDetails[] = [];
  //keep refrence to subscriptions to unsubscribe onDestroy
  subscriptions: Subscription[] = []
  displayLostConnection: boolean = false;
  connectionProblemCause: ConnectionProblem;

  constructor(
    private appLayoutService: AppLayoutService,
    private connectionLostService: ConnectionBrokenService
  ) {}

  ngOnInit() {
    //subscriber for lost server connection:
    this.subscriptions[0] = this.connectionLostService.displayLostConnectionSubject.subscribe(info => {
      this.connectionProblemCause = info[1];
      this.displayLostConnection = info[0];
    })

    this.subscriptions[1] = this.appLayoutService.currentAppletsSubject.subscribe(currentApplets => {
      this.imageries = currentApplets.filter(x => x.appletType==='imagery').sort((a,b)=>a.id-b.id)
      this.graphs = currentApplets.filter(x => x.appletType==='graph').sort((a,b)=>a.id-b.id)
      this.tables = currentApplets.filter(x => x.appletType==='table').sort((a,b)=>a.id-b.id)
      this.commanders = currentApplets.filter(x => x.appletType==='commander').sort((a,b)=>a.id-b.id)
    })
    //scrollIntoView on appletReference click:
    this.subscriptions[2] = this.appLayoutService.scrollIntoViewSubject.subscribe(idToFocus => {
      this.applets.forEach(x => {
        if (+x.nativeElement.id === idToFocus) {
          x.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'})
        }
      })
    })

  }

  trackByFunction(index, item) { //so that we dont reinstanciate running applets
    return item.id;
  }

  ngOnDestroy(): void {
    // just convention, not rly needed as this component will never get destroyed
    for (let sub of this.subscriptions) {
      if (sub.unsubscribe) {sub.unsubscribe()}
    }
  }
}
