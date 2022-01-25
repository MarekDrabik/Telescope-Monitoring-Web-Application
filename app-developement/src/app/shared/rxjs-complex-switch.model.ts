import { merge, Observable, Subscription } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";

export class RxjsComplexSwitch {
  private _actionPerformingSubscription: Subscription;

  constructor(
    private _input: {
      action: Function;
      performActionOn: Observable<any>[];
      enableOn: Observable<any>[];
      disableOn: Observable<any>[];
      whenEnabled: Function[];
      whenDisabled: Function[];
    }
  ) {
    this._createTracker();
  }

  private _createTracker() {
    merge(
      merge(...this._input.enableOn).pipe(map((x) => "enable")),
      merge(...this._input.disableOn).pipe(map((x) => "disable"))
    )
      .pipe(distinctUntilChanged())
      .subscribe((x) => {
        if (x === "enable") {
          this._startPerformingAction();
        } else {
          this._stopPerformingAction();
        }
      });
  }

  private _startPerformingAction() {
    this._actionPerformingSubscription = merge(
      ...this._input.performActionOn
    ).subscribe(() => {
      this._input.action();
    });
    this._input.whenEnabled.forEach((callback) => callback());
  }

  private _stopPerformingAction() {
    if (
      !this._actionPerformingSubscription ||
      this._actionPerformingSubscription.closed
    ) {
      console.error("subscription is closed, unexpected!");
    } else {
      this._actionPerformingSubscription.unsubscribe();
      this._input.whenDisabled.forEach((callback) => callback());
    }
  }
}
