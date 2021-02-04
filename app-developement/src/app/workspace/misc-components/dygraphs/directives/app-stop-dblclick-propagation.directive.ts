import {
  Directive,
  ElementRef,
  OnInit,
  Renderer2,
  OnDestroy,
} from "@angular/core";

@Directive({
  selector: "[appStopDblclickPropagation]",
})
export class StopDblclickPropagationDirective implements OnInit, OnDestroy {
  unlisten: Function;

  constructor(private el: ElementRef, private ren: Renderer2) {}

  ngOnInit(): void {
    this.unlisten = this.ren.listen(
      this.el.nativeElement,
      "dblclick",
      (event) => {
        event.stopPropagation();
      }
    );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.unlisten) this.unlisten();
  }
}
