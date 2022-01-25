import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[appAutoStretchInput]",
})
export class AutoStretchInputDirective implements OnChanges {
  // minWidth = 1; //rem
  @Input("appAutoStretchInput") value: string = "0:00:00";
  @Input() autoStretchPadding: number;
  @Input() autoStretchCharWidth: number;
  constructor(private el: ElementRef, private ren: Renderer2) {}

  //tento pekelny kod je tu preto lebo som dostaval error expressionChangedAfterChecked, pomohlo ked do value input
  //nahravam primitive value a nie nejaku property (upperBound.value ako predtym)
  //Dalej, @hostListener('change') nefunguje jak ma, nie vsetko je change
  //'input' listener funguje ciastocne a musel byt doplneny o ngOnChanges listener
  //'input' listener ma hlavne tu funkciu, ze zachyti aj pridavanie desatinnych cisel do inputu co ngOnChanges
  //vobec neregistruje.

  ngOnInit() {
    this._setWidthToContentFromInput(7);
  }

  ngOnChanges(): void {
    this._setWidthToContent();
  }

  private _setWidthToContent() {
    var newWidth =
      (
        this.value.toString().length * this.autoStretchCharWidth +
        this.autoStretchPadding
      ).toString() + "em";
    this.ren.setStyle(this.el.nativeElement, "width", newWidth);
  }

  // @HostListener('change')
  @HostListener("input")
  _setWidthToContentFromInput(length = this.el.nativeElement.value.length) {
    var newWidth =
      (
        length * this.autoStretchCharWidth +
        this.autoStretchPadding
      ).toString() + "em";
    this.ren.setStyle(this.el.nativeElement, "width", newWidth);
  }
}
