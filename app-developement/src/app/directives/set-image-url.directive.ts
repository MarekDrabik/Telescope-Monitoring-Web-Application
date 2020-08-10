import { Directive, Renderer2, ElementRef, SimpleChanges, OnChanges, Input } from '@angular/core';

@Directive({
  selector: '[appSetImageUrl]'
})
export class SetImageUrlDirective implements OnChanges{
  @Input() focusedImageUrl;
  
  constructor(
    private ren: Renderer2,
    private imageElement: ElementRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.focusedImageUrl) {
      this.ren.setStyle(
        this.imageElement.nativeElement, 
        'background-image', 
        `url(${this.focusedImageUrl})`
      )
    }
  }
}
