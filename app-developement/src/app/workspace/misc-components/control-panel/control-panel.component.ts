import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { NgForm, NgModelGroup } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  EpochNumber,
  RangeRestrictions,
  TelemetryUpdate,
} from "src/app/shared/types/custom.types";
import { popUp } from "../../animations/animations";
import { ClockService } from "../../services/clock.service";
import { CurrentBrowserService } from "../../services/current-browser.service";
import { HoverInfoService } from "./services/hover-info.service";

@Component({
  selector: "app-control-panel",
  templateUrl: "./control-panel.component.html",
  styleUrls: ["./control-panel.component.scss"],
  animations: [popUp],
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  showRangeReversedError: boolean = false;
  showHistoryKilledInfo: boolean = false;

  @Input() realtimeUpdateOn: boolean;
  @Input() telemetryUpdate$: BehaviorSubject<TelemetryUpdate>;
  @Input() processingUserRequest: boolean = false;

  @Input() rangeDiff: EpochNumber;
  @Input() rangeEnd: EpochNumber;
  rangeStart: EpochNumber = 1;
  receivedStart: EpochNumber = 1;
  receivedEnd: EpochNumber = 1;
  receivedDiff: EpochNumber = 1;
  receivedCount: number = 0;

  showSubmitPanel = false;
  showSubmitButton = true; //hides on invalid input
  stepOfNumberInput = "1";
  @Output() killHistory = new EventEmitter<boolean>();
  @Input() clockUpdateRate: "normal" | "fast";

  private _subs: { [s: string]: Subscription } = {};

  @Output() resumeButton = new EventEmitter<void>();
  @Output() pauseButton = new EventEmitter<void>();
  @Output() submitButton = new EventEmitter<NgForm>();
  @Output() latestRestrictions = new EventEmitter<RangeRestrictions>(); //only for imagery applet
  @ViewChild("rangeStartGroup", { static: false })
  rangeStartGroup: NgModelGroup;
  @ViewChild("rangeDiffGroup", { static: false }) rangeDiffGroup: NgModelGroup;
  @ViewChild("rangeEndGroup", { static: false }) rangeEndGroup: NgModelGroup;

  constructor(
    private utils: UtilitiesService,
    public hoverInfoService: HoverInfoService,
    public currentBrowserService: CurrentBrowserService,
    private clockService: ClockService,
    private cd: ChangeDetectorRef,
    private unsubService: UnsubscriptionService
  ) {}

  ngOnInit() {
    this._subs.telemetryUpdate = this.telemetryUpdate$.subscribe(
      (telemetryUpdate) => this._updateAll(telemetryUpdate)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("realtimeUpdateOn")) {
      this._onUpdateModeChange();
    }
    if (
      (changes.hasOwnProperty("rangeDiff") &&
        !changes.rangeDiff.isFirstChange()) ||
      (changes.hasOwnProperty("rangeEnd") && !changes.rangeEnd.isFirstChange())
    ) {
      this._onParentUpdate();
    }
    if (changes.hasOwnProperty("clockUpdateRate") && this.realtimeUpdateOn) {
      this._resubscribeToClock();
    }
  }

  private _updateAll(telemetryUpdate: TelemetryUpdate) {
    this.rangeStart = this.rangeEnd - this.rangeDiff;
    this._updateImageryWithLatestRestrictions();
    if (!telemetryUpdate) return;
    const newPointsLength = telemetryUpdate.newPoints.length;
    this.receivedCount = newPointsLength;
    if (newPointsLength === 0) {
      this.receivedStart = null;
      this.receivedEnd = null;
      this.receivedDiff = 0;
    } else {
      const timeOfOldestTelemetryPoint = telemetryUpdate.newPoints[0][0];
      const timeOfNewestTelemetryPoint =
        telemetryUpdate.newPoints[newPointsLength - 1][0];
      this.receivedStart = timeOfOldestTelemetryPoint - this.rangeStart;
      this.receivedEnd = this.rangeEnd - timeOfNewestTelemetryPoint;
      this.receivedDiff =
        timeOfNewestTelemetryPoint - timeOfOldestTelemetryPoint;
    }
  }

  private _updateImageryWithLatestRestrictions() {
    this.latestRestrictions.emit({
      rangeSpan: this.rangeDiff,
      rangeEnd: this.rangeEnd,
    });
  }

  private _onUpdateModeChange() {
    if (this.realtimeUpdateOn) {
      this._resubscribeToClock();
    } else {
      if (this._subs.clockSubscription)
        this._subs.clockSubscription.unsubscribe();
    }
  }

  private _onClockUpdate = (currentTime) => {
    this.rangeEnd = currentTime;
    this._updateAll(this.telemetryUpdate$.getValue());
  };

  private _resubscribeToClock() {
    if (this._subs.clockSubscription)
      this._subs.clockSubscription.unsubscribe();
    const clock$ =
      this.clockUpdateRate === "normal"
        ? this.clockService.clock
        : this.clockService.milliClock;
    this._subs.clockSubscription = clock$.subscribe(this._onClockUpdate);
  }

  private _onParentUpdate() {
    this._updateAll(this.telemetryUpdate$.getValue());
    this._markAllPristine();
  }

  onControlInput(thisNgModel) {
    if (thisNgModel.dirty) {
      this.showSubmitPanel = true;
    }
    if (thisNgModel.invalid || this.showRangeReversedError) {
      this.showSubmitButton = false;
    } else {
      this.showSubmitButton = true;
    }
  }

  onResumeButton() {
    this.resumeButton.emit();
  }
  onPauseButton() {
    this.pauseButton.emit();
  }
  onSubmitButton(inputForm: NgForm) {
    this.submitButton.emit(inputForm);
    this.showSubmitPanel = false;
  }

  onKillHistory() {
    this.showHistoryKilledInfo = true;
    this.killHistory.emit(true);
  }

  onCancelSubmitButton() {
    this._patchToPreviousValues();
    this._markAllPristine();
    this.showSubmitPanel = false;
  }

  private _patchToPreviousValues() {
    this.rangeStartGroup.control.patchValue(
      this.utils.timestampEpochnumberToDateTime(this.rangeStart, "24", 0)
    );
    this.rangeDiffGroup.control.patchValue({
      timediff: this.utils.timestampEpochnumberToTimestring(
        this.rangeDiff,
        0,
        false
      ),
    });
    this.rangeEndGroup.control.patchValue(
      this.utils.timestampEpochnumberToDateTime(this.rangeEnd, "24", 0)
    );
  }

  private _markAllPristine() {
    this.rangeStartGroup.control.markAsPristine();
    this.rangeDiffGroup.control.markAsPristine();
    this.rangeEndGroup.control.markAsPristine();
  }

  ngOnDestroy() {
    this.unsubService.unsubscribeFromObject(this._subs);
  }
}
