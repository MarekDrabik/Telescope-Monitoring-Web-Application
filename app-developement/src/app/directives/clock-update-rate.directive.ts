import { AfterContentInit, Directive, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { GraphComponent } from '../applets/graph/graph.component';
import { ImageryComponent } from '../applets/imagery/imagery.component';
import { SubMenuComponent } from '../shared/sub-menu/sub-menu.component';
import { TableComponent } from '../applets/table/table.component';

@Directive({
  selector: '[appClockUpdateRate]'
})
export class ClockUpdateRateDirective implements AfterContentInit, OnDestroy {

  @Input('appClockUpdateRate') appletComponent: GraphComponent | ImageryComponent | TableComponent;
  @Input('submenuComponent') submenuComponent: SubMenuComponent;
  @Output() clockUpdateRate = new EventEmitter<boolean>();
  listener;

  constructor() { }

  ngAfterContentInit(): void {
    this.listener = this._listenForTrigger()
  }

  private _listenForTrigger() {
    return this.submenuComponent.clockUpdateRateTrigger.subscribe(event => {
      if (event === true) {
        this.appletComponent.clockUpdateSpeed = 'fast';
      } else {
        this.appletComponent.clockUpdateSpeed = 'normal';
      }
    })
  }

  ngOnDestroy(): void {
    this.listener.unsubscribe()
  }
}
