import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAutoStretchInput]'
})
export class AutoStretchInputDirective {
  // minWidth = 1; //rem
  @Input('appAutoStretchInput') value: string = ' ';
  @Input() autoStretchPadding: number;
  @Input() autoStretchCharWidth: number;
  constructor(
    private el: ElementRef,
    private ren: Renderer2,
    private ref: ChangeDetectorRef
  ) { }

  //tento pekelny kod je tu preto lebo som dostaval error expressionChangedAfterChecked, pomohlo ked do value input
  //nahravam primitive value a nie nejaku property (upperBound.value ako predtym)
  //Dalej, @hostListener('change') nefunguje jak ma, nie vsetko je change
  //'input' listener funguje ciastocne a musel byt doplneny o ngOnChanges listener
  //'input' listener ma hlavne tu funkciu, ze zachyti aj pridavanie desatinnych cisel do inputu co ngOnChanges 
  //vobec neregistruje ?!!!!!

  ngOnChanges(changes: SimpleChanges): void {
    this._setWidthToContent()
  }

  private _setWidthToContent() {
    var newWidth = (this.value.toString().length * this.autoStretchCharWidth + this.autoStretchPadding).toString() + 'em'
    this.ren.setStyle(this.el.nativeElement, 'width', newWidth)
  }

  // @HostListener('change')
  @HostListener('input')
  _setWidthToContentFromInput() {
    var newWidth = (this.el.nativeElement.value.length * this.autoStretchCharWidth + this.autoStretchPadding).toString() + 'em'
    this.ren.setStyle(this.el.nativeElement, 'width', newWidth)
  }


}
