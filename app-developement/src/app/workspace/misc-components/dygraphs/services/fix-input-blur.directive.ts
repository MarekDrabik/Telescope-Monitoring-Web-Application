import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[appFixInputBlur]",
})
export class FixInputBlurDirective implements OnInit, OnDestroy {
  // fixing bug where inputs won't blur if user clicks on chart as they should

  unlisten: Function;
  @Input("appFixInputBlur") parentElement: HTMLElement;

  constructor(private inputEl: ElementRef, private ren: Renderer2) {}

  ngOnInit(): void {
    this.unlisten = this.ren.listen(
      this.inputEl.nativeElement,
      "focus",
      (event) => {
        let parentClickListener = this.ren.listen(
          this.parentElement,
          "click",
          () => {
            this.inputEl.nativeElement.blur();
            parentClickListener(); //unlisten
          }
        );
      }
    );
  }

  ngOnDestroy(): void {
    if (this.unlisten) this.unlisten();
  }
}
