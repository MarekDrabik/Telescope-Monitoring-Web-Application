import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { GraphComponent } from '../applets/graph/graph.component';

@Directive({
  selector: '[appFixDygraphResize]'
})
export class FixDygraphResizeDirective {
//fixing issue where graph wont resize with container resizing

  @Input('appFixDygraphResize') graphComponent: GraphComponent;

  constructor(
    private hostElement: ElementRef,
    private renderer2: Renderer2
  ) { }

  @HostListener('mousedown', ['$event'])
  _onResizer(event) {
    const cornerSquareSize = 30
    const x = event.offsetX
    const y = event.offsetY
    const xOnLine = this.hostElement.nativeElement.offsetWidth - cornerSquareSize
    const yOnLine = this.hostElement.nativeElement.offsetHeight - cornerSquareSize
    const clickedInResizeSquare = ((x > xOnLine) && (y > yOnLine))
    if (clickedInResizeSquare === true) {
      var unlistenUp = this.renderer2.listen(document, 'mouseup', () => {
        unlistenMove()
        unlistenUp()

        this.graphComponent.updateDygraphSubject.next({ resize: true })
      })
      var unlistenMove = this.renderer2.listen(event.target, 'mousemove', () => {
        this.graphComponent.updateDygraphSubject.next({ resize: true })        // this.ref.detectChanges()
      })
    }
  }
}
