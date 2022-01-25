import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { RxjsComplexSwitch } from "src/app/shared/rxjs-complex-switch.model";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  AppletType,
  TelemetrySource,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { AppLayoutService } from "src/app/workspace/services/app-layout.service";
import { TelemetrySourcesService } from "../../services/telemetry-sources.service";

@Component({
  selector: "app-sub-menu",
  templateUrl: "./sub-menu.component.html",
  styleUrls: ["./sub-menu.component.scss"],
})
export class SubMenuComponent implements OnInit {
  @Input() appletId: number = null; //used by most of menu variants

  //MENU OPTIONS:
  @Input() appletCreationOption: boolean;

  //Telemetry Sources selection:
  @Input() telemetrySelectionOption_radio: boolean; //provides initial value and triggers selection
  @Input() telemetrySelectionOption_checkboxes: boolean; //provides initial value and triggers selection
  initialSources: TelemetrySource[];
  previouslySelected: TelemetrySource[];
  sourcesAvailableForThisApplet: TelemetrySource[];

  @Input() appletDeletionOption: boolean;

  @Input() collapseTimelineOption: boolean;
  timelineCollapseTrigger = new EventEmitter<boolean>();

  @Input() clockUpdateRateOption: boolean;
  clockUpdateRateTrigger = new EventEmitter<boolean>();

  @Input() fullscreenOption: boolean;
  fullscreenTrigger = new EventEmitter<boolean>();
  isFullscreen: boolean = false;

  moveResizeTrigger = new EventEmitter<boolean>();

  constructor(
    public layoutService: AppLayoutService,
    private utilitiesService: UtilitiesService,
    public el: ElementRef,
    private telemetrySourcesService: TelemetrySourcesService,
  ) {}

  ngOnInit() {
    this._initializeTelemetrySources();
  }

  private _initializeTelemetrySources() {
    if (
      this.telemetrySelectionOption_radio ||
      this.telemetrySelectionOption_checkboxes
    ) {
      //if telemetrySelection is available option
      let appletDetails = this.layoutService.getAppletDetails(this.appletId);
      let appletType = appletDetails.appletType as AppletType;
      this.sourcesAvailableForThisApplet = this.telemetrySourcesService.getAvailableTelemetrySources(
        appletDetails.telemetryTypes
      );
      this.initialSources = appletDetails.telemetrySources;
      this.previouslySelected = appletDetails.telemetrySources;
    }
  }

  // updates layout + prevents user from unselecting all checkboxes
  onTelemetrySelection(formObject: NgForm) {
    let selectedSources: TelemetrySource[] = this.utilitiesService.extractSelectedSources(
      formObject
    );
    if (selectedSources.length === 0) {
      //user unselected all sources, dont allow it
      if (this.telemetrySelectionOption_checkboxes)
        formObject.form.patchValue({ [this.previouslySelected[0]]: true });
    } else {
      this.previouslySelected = selectedSources;
      this.layoutService.changeTelemetrySources(this.appletId, selectedSources);
    }
  }

  onAddApplet(
    event: Event,
    appletType: AppletType,
    telemetryTypes: TelemetryType[]
  ) {
    this.layoutService.addApplet(appletType);
  }

  onAppletDeletion(event: Event) {
    this.layoutService.deleteApplet(this.appletId);
  }

  onCheckClockUpdateRate(checked) {
    this.clockUpdateRateTrigger.emit(checked);
  }

  onCheckHideTimeline(checked) {
    this.timelineCollapseTrigger.emit(checked);
  }

  onCheckFullscreen(checked) {
    this.isFullscreen = checked; // referenced by other components
    this.fullscreenTrigger.emit(checked);
    this.moveResizeTrigger.emit(false);
  }
}
