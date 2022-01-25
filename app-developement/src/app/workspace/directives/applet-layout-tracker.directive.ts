import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
} from "@angular/core";
import { AppLayoutService } from "../services/app-layout.service";

@Directive({
  selector: "[appAppletLayoutTracker]",
})
// keeps track of applet position and size and updates layout service with change
export class AppletLayoutTrackerDirective implements OnDestroy {
  @Input("appletId") appletId: number;
  mouseDownUnlisten: Function;

  constructor(
    private appletRef: ElementRef,
    private ren2: Renderer2,
    private layoutService: AppLayoutService
  ) {
    //when clicked on this applet (including resize clicking or move clicking)
    this.mouseDownUnlisten = this.ren2.listen(
      appletRef.nativeElement,
      "mousedown",
      () => {
        let mouseUpUnlisten = this.ren2.listen(document, "mouseup", () => {
          mouseUpUnlisten();
          //applet's position:
          let currentStyleLeft = this.appletRef.nativeElement.style.left;
          let currentStyleTop = this.appletRef.nativeElement.style.top;
          let appletPosition = {
            x: +currentStyleLeft.slice(0, currentStyleLeft.length - 2),
            y: +currentStyleTop.slice(0, currentStyleTop.length - 2),
          };
          if (this._appletPositionHasChanged(appletPosition)) {
            this.layoutService.storeAppletPosition(
              this.appletId,
              appletPosition
            );
          }
          //applet's size:
          let currentStyleWidth = this.appletRef.nativeElement.style.width;
          let currentStyleHeight = this.appletRef.nativeElement.style.height;
          let appletSize = {
            width: +currentStyleWidth.slice(0, currentStyleWidth.length - 2),
            height: +currentStyleHeight.slice(0, currentStyleHeight.length - 2),
          };
          if (this._appletSizeHasChanged(appletSize)) {
            this.layoutService.storeAppletSize(this.appletId, appletSize);
          }
        });
      }
    );
  }

  private _appletPositionHasChanged(actualPosition) {
    let storedPosition = this.layoutService.getAppletDetailsProperty(
      this.appletId,
      "position"
    );
    if (
      actualPosition.x === storedPosition.x &&
      actualPosition.y === storedPosition.y
    ) {
      return false;
    }
    return true;
  }
  private _appletSizeHasChanged(actualSize) {
    let storedSize = this.layoutService.getAppletDetailsProperty(
      this.appletId,
      "size"
    );
    if (
      storedSize.width === actualSize.width &&
      storedSize.height === actualSize.height
    ) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    if (this.mouseDownUnlisten) this.mouseDownUnlisten();
  }
}
