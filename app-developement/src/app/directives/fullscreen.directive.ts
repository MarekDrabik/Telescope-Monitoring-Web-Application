import { AfterContentInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { GraphComponent } from '../applets/graph/graph.component';
import { SubMenuComponent } from '../shared/sub-menu/sub-menu.component';

@Directive({
  selector: '[appFullscreen]'
})
export class FullscreenDirective implements AfterContentInit, OnDestroy{

  @Input('appFullscreen') graphComponent: GraphComponent;
  @Input('submenuComponent') submenuComponent: SubMenuComponent;
  @Input('appletId') appletId;

  listener;
  isFullscreen: boolean;

  constructor(
    private appletEl: ElementRef,
    private ren: Renderer2
    ) {}

  ngAfterContentInit(): void {
    this.listener = this._listenForTrigger()  
  }

  private _listenForTrigger() {
    return this.submenuComponent.fullscreenTrigger.subscribe( event => {
      if (event === true) {
        this.ren.addClass(this.appletEl.nativeElement, 'fullscreen')
      } else {
        this.ren.removeClass(this.appletEl.nativeElement, 'fullscreen')
      }
      // dygraph need to be explicitelly told to resize itself:
      if (this.graphComponent) {
        this.graphComponent.updateDygraphSubject.next({resize: true})
      }
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.listener.unsubscribe()
  }

}
