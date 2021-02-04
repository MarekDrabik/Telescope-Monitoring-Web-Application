import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
} from "@angular/core";
import { ResizeFixingComponent } from "src/app/shared/types/custom.types";

@Directive({
  selector: "[appResizeListener]",
})
export class ResizeListenerDirective {
  @Input("appResizeListener") componentWithIssue: ResizeFixingComponent;
  @Output() resizing = new EventEmitter<boolean>();

  constructor(private hostElement: ElementRef, private renderer2: Renderer2) {}

  @HostListener("mousedown", ["$event"])
  _onResizer(event) {

    const cornerSquareSize = 30;
    const x = event.offsetX;
    const y = event.offsetY;
    const xOnLine =
      this.hostElement.nativeElement.offsetWidth - cornerSquareSize;
    const yOnLine =
      this.hostElement.nativeElement.offsetHeight - cornerSquareSize;
    const clickedInResizeSquare = x > xOnLine && y > yOnLine;
    if (clickedInResizeSquare === true) {
      this.resizing.emit(true);
      var unlistenUp = this.renderer2.listen(document, "mouseup", () => {
        unlistenMove();
        unlistenUp();
        if (this.componentWithIssue) this.componentWithIssue.onAppletResize();
      });
      var unlistenMove = this.renderer2.listen(
        event.target,
        "mousemove",
        () => {
          if (this.componentWithIssue) this.componentWithIssue.onAppletResize();
        }
      );
    }
  }
}
