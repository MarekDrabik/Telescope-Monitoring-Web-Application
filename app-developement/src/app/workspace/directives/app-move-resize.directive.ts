import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from "@angular/core";
import { SubMenuComponent } from "../misc-components/sub-menu/sub-menu.component";

@Directive({
  selector: "[appMoveResize]",
})
export class MoveResizeDirective implements OnInit, OnDestroy {
  maxTop = 30; //the header is the upper limit
  @Input("submenuComponent") submenuComponent: SubMenuComponent;
  @Input("moveHandle") moveHandle: HTMLElement;
  @Input("resizeInfo") resizeInfo: HTMLElement;
  @Output() moving = new EventEmitter<void>();

  unlistenGrab: Function;
  alreadyListening = false;

  constructor(private el: ElementRef, private renderer2: Renderer2) {}

  ngOnInit(): void {
    this.submenuComponent.moveResizeTrigger.subscribe((showHandles) => {
      if (!this.alreadyListening && showHandles === true && this.submenuComponent.isFullscreen === false) {
        this._displayHandlesAndListen();
      }
      if (showHandles === false) {
        this._hideHandlesAndUnlisten();
      }
    });
  }

  private _displayHandlesAndListen() {
    this.alreadyListening = true;
    this._displayHandles();
    this._setResizeStyle();
    this._listenForMoveGrab();
  }

  private _hideHandlesAndUnlisten() {
    this._hideHandles();
    if (this.unlistenGrab) {
      this.unlistenGrab();
      this.unlistenGrab = null;
    }
    this._unsetResizeStyle();
    this.alreadyListening = false;
  }

  private _setResizeStyle() {
    this.renderer2.setStyle(this.el.nativeElement, "resize", "both");
    this.renderer2.setStyle(this.el.nativeElement, "overflow", "auto");
  }
  private _unsetResizeStyle() {
    this.renderer2.setStyle(this.el.nativeElement, "resize", "none");
    this.renderer2.setStyle(this.el.nativeElement, "overflow", "hidden");
  }

  private _listenForMoveGrab() {
    this.unlistenGrab = this.renderer2.listen(
      this.moveHandle,
      "mousedown",
      (event) => {
        this.moving.emit();
        if (!this.submenuComponent.isFullscreen) {
          var unlistenUp = this.renderer2.listen(document, "mouseup", () => {
            unlistenMove();
            unlistenUp();
          });

          var unlistenMove = this.renderer2.listen(
            document,
            "mousemove",
            (event) => {
              let top: string = this.el.nativeElement.style.top;
              let topValue: number = +top.slice(0, top.length - 2); //removes 'px' and converts to number
              let left: string = this.el.nativeElement.style.left;
              let leftValue: number = +left.slice(0, left.length - 2);
              let newTop = topValue + event.movementY;
              if (newTop < this.maxTop) newTop = this.maxTop; //upper movement boundary
              newTop = newTop.toString() + "px";
              let newLeft = (leftValue + event.movementX).toString() + "px";
              this.renderer2.setStyle(this.el.nativeElement, "top", newTop);
              this.renderer2.setStyle(this.el.nativeElement, "left", newLeft);
            }
          );
        }
      }
    );
  }

  private _displayHandles() {
    this.renderer2.setStyle(this.moveHandle, "display", "flex");
    this.renderer2.setStyle(this.resizeInfo, "display", "block");
  }
  private _hideHandles() {
    this.renderer2.setStyle(this.moveHandle, "display", "none");
    this.renderer2.setStyle(this.resizeInfo, "display", "none");
  }

  ngOnDestroy(): void {
    this._hideHandlesAndUnlisten();
  }
}
