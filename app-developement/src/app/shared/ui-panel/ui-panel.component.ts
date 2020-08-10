import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';
import { RangesUpdateController } from 'src/app/controllers/ranges-update.controller';
import { HoverInfoService } from 'src/app/services/hover-info.service';
import { UiPanelValidationService } from 'src/app/services/ui-panel-validation.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { telemetryUpdateModeType, UiPanelButtonType, UiPanelSubmitEventObject, UiPanelControlName } from '../../types/custom.types';
import { popUp } from '../animations';
import { CurrentBrowserService } from 'src/app/services/current-browser.service';

@Component({
  selector: 'app-ui-panel',
  templateUrl: './ui-panel.component.html',
  styleUrls: ['./ui-panel.component.scss'],
  animations: [ popUp ]
})
export class UiPanelComponent implements OnInit, OnDestroy {

  @ViewChild('formObject', { static: true }) formObject: NgForm;
  @ViewChild('rdiff', { static: true }) rangeDiffNgModel: NgModel;
  @ViewChild('rdiffInput', { static: true }) rangeDiffInput: ElementRef;
  @ViewChild('rstart_date', { static: true }) rangeStartDateNgModel: NgModel;
  @ViewChild('rstart_time', { static: true }) rangeStartTimeNgModel: NgModel;
  @ViewChild('rend_date', { static: true }) rangeEndDateNgModel: NgModel;
  @ViewChild('rend_time', { static: true }) rangeEndTimeNgModel: NgModel;
  showRangeReversedError: boolean = false;
  showHistoryKilledInfo: boolean = false;
  showHistoryTimeout;
  //user inputs:
  rangeDiff: string = '';
  rangeStart_date: string = ''; //lower timestamp value
  rangeStart_time: string = ''; //
  rangeEnd_date: string = ''; //upper timestamp value
  rangeEnd_time: string = '';
  //server updated:
  receivedDiff: string = '';
  receivedCount: string = ''; //number of displayed values/thumbnails
  receivedPastDelay: string = '';
  receivedPresentDelay: string = '';

  @Input() telemetryUpdateMode: telemetryUpdateModeType;
  _processingUserRequest: boolean = false;
  @Input() set processingUserRequest(x) {
    if (x) {
      this._processingUserRequest = true
      if (this.showSubmitButton === true) this.showSubmitButton = false;
    }
    else {
      this._processingUserRequest = false;
      this._onHistoryFetched()
    }
  };

  showSubmitButton = false;
  showSubmitConfirmButton = true; //hidden on invalid input
  stepOfNumberInput = '1'
  @Output() killHistory = new EventEmitter<boolean>();
  // @Input (from smart container)
  @Input() rangesUpdateController: RangesUpdateController;
  _clockUpdateSpeed: 'normal' | 'fast';
  @Input() set clockUpdateSpeed(val: 'normal' | 'fast') {
    this._clockUpdateSpeed = val;
    if (val === 'normal') {
      this.stepOfNumberInput = '1';
      //tickControls is called to refresh the clocks with new format immediatly (not just in the next second)
      this.rangesUpdateController.tickRealtimeControlsAndTrimCache()
    } else {
      this.stepOfNumberInput = '0.001';
    }
  }
  get clockUpdateSpeed() {
    return this._clockUpdateSpeed;
  }
  
  receivedDiffSubscription: Subscription;
  receivedCountSubscription: Subscription;
  receivedPastDelaySubscription: Subscription;
  receivedPresentDelaySubscription: Subscription;
  rangeDiffSubscription: Subscription;
  rangeStartSubscription: Subscription;
  rangeEndSubscription: Subscription;

  // @Output (to the smart container)
  @Output() userSubmit = new EventEmitter<UiPanelSubmitEventObject>();

  constructor(
    private uiPanelValidationService: UiPanelValidationService,
    private utils: UtilitiesService,
    public hoverInfoService: HoverInfoService,
    public currentBrowserService: CurrentBrowserService
  ) { }

  ngOnInit() {
    this._resumeUpdateOnAllControls()
    this._subscribeToReceivedInformationUpdates()
  }

  // show submit button
  onControlInput(formObject: NgForm, thisNgModel) {
    if (thisNgModel.dirty) { // user modified the control value
      if (this.showSubmitButton === false) this.showSubmitButton = true;
    }
    if (thisNgModel.invalid || this.showRangeReversedError) { //invalid input will hide submit button
      if (this.showSubmitConfirmButton === true) this.showSubmitConfirmButton = false;
    } else {
      if (this.showSubmitConfirmButton === false) this.showSubmitConfirmButton = true;
    }
  }

  // restore previous value if user canceled (blured) dirty input field:
  onControlFocus(controlName){
    this._pauseUpdateOnControl(controlName)
  }
  onControlBlur(thisNgModel, controlName){
    if(!thisNgModel.dirty){
      this._resumeUpdateOnControl(controlName)
    }
  }

  //event listener on all user inputs (range controls + buttons)
  onSubmit(event: Event, formObject: NgForm, buttonType: UiPanelButtonType) {
    event.stopPropagation()
    /* do not remove potential historyKilledInfo message on pause button because the message 
     might is still relevant */
    if (buttonType !== 'pause') {
      this.showHistoryKilledInfo = false;
    }
    //this validation isnt really necessary as the submit button is hidden if input isnt valid
    let validationError = this.uiPanelValidationService.validate(formObject)
    if (validationError !== '') {
      console.error('Invalid input, not submiting!')
      return;
    }
    if (this.formObject.form.value.hasOwnProperty('rangeDiff')) {
      this._trimDiffToThreeDecimals(formObject) //to not send huge decimal numbers!
    }

    //submit for processing by applet component
    this.userSubmit.emit({
      formObject: formObject,
      buttonType: buttonType
    })
  }

  onCancelSubmit(event: Event) {
    event.stopPropagation()
    this.showSubmitButton = false;
    this.showSubmitConfirmButton = true; //reset for next rendering
    this._markAllPristine()
    this._resumeUpdateOnAllControls()
  }

  onKillHistory() {
    this.showHistoryKilledInfo = true;
    // UNCOMMENT TO HIDE WARNING AFTER SOME TIME
    // clearTimeout(this.showHistoryTimeout) //kill if there is previous hide event pending
    // this.showHistoryTimeout = setTimeout(() => { this.showHistoryKilledInfo = false }, 10000)
    this.killHistory.emit(true)
  }

  private _subscribeToReceivedInformationUpdates() {
    this.rangesUpdateController.receivedCountSubject.subscribe(count => {
      this.receivedCount = count;
    })
    this.rangesUpdateController.receivedDiffSubject.subscribe(diff => {
      if (diff !== null) { //else its no data available
        this.receivedDiff = diff
      } else {
        this.receivedDiff = '0.0';
      }
    })
    this.rangesUpdateController.receivedPastDelaySubject.subscribe(pastDelay => {
      if (pastDelay !== null) { //else its no data available
        this.receivedPastDelay = this.utils.trimZeroesFromTimestring(pastDelay)
      } else {
        this.receivedPastDelay = 'n/a';
      }
    })
    this.rangesUpdateController.receivedPresentDelaySubject.subscribe(presentDelay => {
      if (presentDelay !== null) { //else its no data available
        this.receivedPresentDelay = this.utils.trimZeroesFromTimestring(presentDelay)
      } else {
        this.receivedPresentDelay = 'n/a';
      }
    })
  }

  private _pauseUpdateOnControl(controlName: UiPanelControlName){
    this._unsubscribeFromControlUpdate(controlName);
  }
  private _resumeUpdateOnControl(controlName: UiPanelControlName) {
    this._reSubscribeToControlUpdate(controlName)
  }
  private _resumeUpdateOnAllControls(){
    for (let controlName of ['rangeStart', 'rangeEnd', 'rangeDiff'] as UiPanelControlName[]) {
      this._reSubscribeToControlUpdate(controlName)
    }
  }
  private _reSubscribeToControlUpdate(controlName: UiPanelControlName) {
    let controlSubscription: Subscription = this[controlName+'Subscription']
    let controlSubject: BehaviorSubject<any> = this.rangesUpdateController[controlName+'Subject']
    if (!controlSubscription || controlSubscription.closed){
      this[controlName+'Subscription'] = controlSubject.subscribe(
        update => {
          if (update.hasOwnProperty('timediff')) {
            this[controlName] = update.timediff
          } else {
            this[controlName+'_date'] = update.date
            //_time format (decimal milliseconds visibility) has to correspond to current step of number input
            // which is set by clockUpdateSpeed
            this[controlName+'_time'] = this.utils.trimTimestringsMilliseconds(
              update.time, 
              this.stepOfNumberInput === '1' ? 0 : 3
            )
          }
        }, 
        error => {
          console.error('Range control resubscription error: ', error);
        }
      )
    }
  }

  private _unsubscribeFromControlUpdate(controlName: UiPanelControlName) {
    let controlSubscription: Subscription = this[controlName+'Subscription']
    controlSubscription.unsubscribe()
  }

  private _markAllPristine() {
    this.rangeDiffNgModel.control.markAsPristine()
    this.rangeStartDateNgModel.control.markAsPristine()
    this.rangeStartTimeNgModel.control.markAsPristine()
    this.rangeEndDateNgModel.control.markAsPristine()
    this.rangeEndTimeNgModel.control.markAsPristine()
  }

  private _onHistoryFetched = () => {
    this._markAllPristine()
    this._resumeUpdateOnAllControls()
  }

  private _trimDiffToThreeDecimals(formObject: NgForm) {
    let diffValue = formObject.form.value.rangeDiff.timediff;
    let trimmedDiff = this.utils.trimTimestringsMilliseconds(diffValue, 3)
    formObject.form.patchValue({ 'rangeDiff': { 'timediff': trimmedDiff } })
  }

  private _refreshNumberInputs() {
    //refreshes start and end controls with 
    this.rangesUpdateController.rangeStartSubject.next(this.rangesUpdateController.rangeStartSubject.getValue())
    this.rangesUpdateController.rangeEndSubject.next(this.rangesUpdateController.rangeEndSubject.getValue())
  }

  ngOnDestroy() {
    if (this.rangeDiffSubscription && this.rangeDiffSubscription.unsubscribe) { this.rangeDiffSubscription.unsubscribe() }
    if (this.rangeStartSubscription && this.rangeStartSubscription.unsubscribe) { this.rangeStartSubscription.unsubscribe() }
    if (this.rangeEndSubscription && this.rangeEndSubscription.unsubscribe) { this.rangeEndSubscription.unsubscribe() }
    if (this.receivedDiffSubscription && this.receivedDiffSubscription.unsubscribe) { this.receivedDiffSubscription.unsubscribe() }
    if (this.receivedCountSubscription && this.receivedCountSubscription.unsubscribe) { this.receivedCountSubscription.unsubscribe() }
    if (this.receivedPastDelaySubscription && this.receivedPastDelaySubscription.unsubscribe) { this.receivedPastDelaySubscription.unsubscribe() }
    if (this.receivedPresentDelaySubscription && this.receivedPresentDelaySubscription.unsubscribe) { this.receivedPresentDelaySubscription.unsubscribe() }
  }
}
