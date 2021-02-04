import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
} from "@angular/core";
import { ResizeFixingComponent } from "src/app/shared/types/custom.types";
import { SubMenuComponent } from "../misc-components/sub-menu/sub-menu.component";

@Directive({
  selector: "[appFullscreen]",
})
export class FullscreenDirective implements AfterContentInit, OnDestroy {
  @Input("appFullscreen") componentWithResizeIssue: ResizeFixingComponent;
  @Input("submenuComponent") submenuComponent: SubMenuComponent;
  @Input("appletId") appletId;

  listener;
  isFullscreen: boolean;

  constructor(private appletEl: ElementRef, private ren: Renderer2) {}

  ngAfterContentInit(): void {
    this.listener = this._listenForTrigger();
  }

  private _listenForTrigger() {
    return this.submenuComponent.fullscreenTrigger.subscribe((event) => {
      if (event === true) {
        this.ren.addClass(this.appletEl.nativeElement, "fullscreen");
      } else {
        this.ren.removeClass(this.appletEl.nativeElement, "fullscreen");
      }
      //3rd party libraries (dygraphs, leaflet map) need to be explicitelly told to resize itself:
      if (
        this.componentWithResizeIssue.hasOwnProperty("onAppletResize")
      ) {
        this.componentWithResizeIssue.onAppletResize();
      }
    });
  }

  ngOnDestroy(): void {
    this.listener.unsubscribe();
  }
}
