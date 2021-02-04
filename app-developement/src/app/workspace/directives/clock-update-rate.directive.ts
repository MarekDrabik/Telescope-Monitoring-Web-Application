import {
  AfterContentInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { SubMenuComponent } from "../misc-components/sub-menu/sub-menu.component";
import { TelemetryApplet } from "../models/telemetry-applet.model";

@Directive({
  selector: "[appClockUpdateRate]",
})
export class ClockUpdateRateDirective implements AfterContentInit, OnDestroy {
  @Input("appClockUpdateRate") appletComponent: TelemetryApplet;
  @Input("submenuComponent") submenuComponent: SubMenuComponent;
  @Output() clockUpdateRate = new EventEmitter<boolean>();
  listener;

  constructor() {}

  ngAfterContentInit(): void {
    this.listener = this._listenForTrigger();
  }

  private _listenForTrigger() {
    return this.submenuComponent.clockUpdateRateTrigger.subscribe((event) => {
      if (event === true) {
        this.appletComponent.clockUpdateRate = "fast";
      } else {
        this.appletComponent.clockUpdateRate = "normal";
      }
    });
  }

  ngOnDestroy(): void {
    this.listener.unsubscribe();
  }
}
