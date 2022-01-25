import { Directive, HostListener, Input, Renderer2 } from "@angular/core";
import { fromEvent, merge, Subject, Subscription } from "rxjs";
import { bufferTime, filter, map, timeInterval } from "rxjs/operators";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import { SubMenuComponent } from "../misc-components/sub-menu/sub-menu.component";

type DisplaySubjectPayload = {
  show: boolean;
  mouseEvent: MouseEvent | null;
};

@Directive({
  selector: "[appContextMenu]",
})
export class ContextMenuDirective {
  @Input("submenuComponent") submenuComponent: SubMenuComponent;
  submenuElement: HTMLElement;
  moveResizeShown: boolean = false;
  manipulatingApplet$ = new Subject<any>();
  private _display$ = new Subject<DisplaySubjectPayload>();
  private _subs: Subscription[] = [];

  constructor(
    private renderer2: Renderer2,
    private _unsubService: UnsubscriptionService
  ) {}
  ngAfterViewInit(): void {
    this.submenuElement = this.submenuComponent.el.nativeElement;
    this._subs.push(this._listenForMenuTriggers());
  }

  @HostListener("resizing", ["$event"])
  onAppletResizing = (resizing) => {
    this.manipulatingApplet$.next("resizing");
  };

  @HostListener("moving", ["$event"])
  onAppletGrabbing = (moving) => {
    this.manipulatingApplet$.next("moving");
  };

  @HostListener("contextmenu", ["$event"])
  onRightClick = (event) => {
    event.preventDefault();
    this._display$.next({
      show: true,
      mouseEvent: event,
    });
    this._unloadMenuOnClickElsewhere();
  };

  private _unloadMenuOnClickElsewhere() {
     // on click elsewhere apart of move-resize handles
    let menuUnload = merge(
      this.manipulatingApplet$,
      fromEvent(document, 'mousedown').pipe( //putting filter here because bufferTime corrupts MouseEvent object
        filter((event) => !event.composedPath().includes(this.submenuElement))
      )
    )
      .pipe(
        bufferTime(100), //catching simultaneos emitions while manipulating move/resize
        filter((events) => {
          return (
            !events.includes("resizing") &&
            !events.includes("moving") &&
            events.length !== 0
          );
        })
      )
      .subscribe((_) => {
        menuUnload.unsubscribe();
        this._display$.next({
          show: false,
          mouseEvent: null,
        });
      });
  }

  private _listenForMenuTriggers() {
    return this._display$
      .pipe(
        timeInterval(),
        filter(
          (intervalObj) =>
            // ignore hide request on immediate hide+show request
            // (happens on another righclick while menu is already open)
            !(intervalObj.interval < 300 && intervalObj.value.show === false)
        )
      )
      .subscribe((timeIntervalPayload) =>
        this._displayMenuAndMoveResizeHandles(timeIntervalPayload.value)
      );
  }

  private _displayMenuAndMoveResizeHandles(payload: DisplaySubjectPayload) {
    if (payload.show === true) {
      this._showMoveResizeHandles();
      this._showContextMenu(payload.mouseEvent);
    } else {
      this._hideMoveResizeHandles();
      this._hideContextMenu();
    }
  }
  private _showMoveResizeHandles() {
    this.submenuComponent.moveResizeTrigger.emit(true);
  }

  private _hideMoveResizeHandles() {
    this.submenuComponent.moveResizeTrigger.emit(false);
  }
  private _showContextMenu(event) {
    let optimalPosition = this._calculateOptimalPositionProperties(event);
    this.renderer2.setStyle(this.submenuElement, "position", "fixed");
    this.renderer2.setStyle(this.submenuElement, "left", optimalPosition.left);
    this.renderer2.setStyle(
      this.submenuElement,
      "right",
      optimalPosition.right
    );
    this.renderer2.setStyle(this.submenuElement, "top", optimalPosition.top);
    this.renderer2.setStyle(
      this.submenuElement,
      "bottom",
      optimalPosition.bottom
    );
    this.renderer2.setStyle(this.submenuElement, "display", "block");
    this.renderer2.setStyle(this.submenuElement, "z-index", "1300");
  }
  private _hideContextMenu() {
    this.renderer2.setStyle(this.submenuElement, "display", "none");
  }
  //optimal position so that we don't render menu outside of viewport:
  private _calculateOptimalPositionProperties(event) {
    let clickX = event.clientX;
    let clickY = event.clientY - 16;
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;
    let left, right, top, bottom;
    //position based on click position to viewport (to not render window outside the viewport)
    if (clickX < centerX) {
      //left half of viewport
      left = clickX.toString() + "px";
      right = "unset";
    } else {
      //right half of viewport
      left = "unset";
      right = (window.innerWidth - clickX - 16).toString() + "px";
    }
    if (clickY < centerY) {
      //upper half of viewport
      top = (clickY + 10).toString() + "px";
      bottom = "unset";
    } else {
      //lower half of viewport
      top = "unset";
      bottom = (window.innerHeight - clickY - 48).toString() + "px";
    }
    return { left, right, top, bottom };
  }

  ngOnDestroy(): void {
    this._unsubService.unsubscribeFromArray(this._subs);
  }
}
