import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppletModel } from 'src/app/models/applet.model';
import { TelemetrySource, AppletType } from 'src/app/types/custom.types';
import { AppLayoutService } from 'src/app/services/app-layout.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.scss']
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

  @Input() moveResizeOption: boolean;
  moveResizeTrigger = new EventEmitter<boolean>();
  @ViewChild('moveresizeCheckbox', { static: false }) moveresizeCheckbox: ElementRef;

  constructor(
    public layoutService: AppLayoutService,
    private utilitiesService: UtilitiesService,
    private appletModel: AppletModel,
    public el: ElementRef
  ) { }

  ngOnInit() {
    if (this.telemetrySelectionOption_radio || this.telemetrySelectionOption_checkboxes) { //if telemetrySelection is available option
      let appletDetails = this.layoutService.getAppletDetails(this.appletId)
      let appletType = appletDetails.appletType as AppletType
      this.sourcesAvailableForThisApplet = this.appletModel.getAvailableTelemetrySources(appletType)
      this.initialSources = appletDetails.telemetrySources
      this.previouslySelected = appletDetails.telemetrySources
    }
  }

  // updates layout + prevents user from unselecting all checkboxes
  onTelemetrySelection(formObject: NgForm) {
    let selectedSources: TelemetrySource[] = this.utilitiesService.extractSelectedSources(formObject)
    if (selectedSources.length === 0) { //user unselected all sources, dont allow it
      if (this.telemetrySelectionOption_checkboxes) formObject.form.patchValue({ [this.previouslySelected[0]]: true })
    }
    else {
      this.previouslySelected = selectedSources;
      this.layoutService.changeTelemetrySources(
        this.appletId,
        selectedSources
      )
    }
  }

  onAddApplet(event: Event, appletType: AppletType) {
    this.layoutService.addApplet(appletType)
  }

  onAppletDeletion(event: Event) {
    this.layoutService.deleteApplet(this.appletId)
  }

  onCheckClockUpdateRate(checked) {
    this.clockUpdateRateTrigger.emit(checked)
  }

  onCheckHideTimeline(checked) {
    this.timelineCollapseTrigger.emit(checked)
  }

  onCheckFullscreen(checked) {
    this.isFullscreen = checked; // referenced by other components
    this.fullscreenTrigger.emit(checked)
    if (checked) { //unload moveresize if active and disable its checkbox on fullscreen
      if (this.moveresizeCheckbox.nativeElement.checked === true) {
        this.moveresizeCheckbox.nativeElement.click()
      }
    }
  }

  onCheckMoveresize(checked) {
    this.moveResizeTrigger.emit(checked)
  }
}
