import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppLayoutService } from '../services/app-layout.service';

@Directive({
  selector: '[appOnClickFocus]'
})
export class OnClickFocusDirective implements OnInit, OnDestroy {

  @Input('appletId') appletId: number;
  zIndexSubscription: Subscription;
  unlisten: Function;

  constructor(
    private el: ElementRef,
    private renderer2: Renderer2,
    private layoutService: AppLayoutService
  ) { }

  ngOnInit(): void {

    //display applet in front of the others on click
    this.zIndexSubscription = this.layoutService.zIndexSubject.subscribe(zIndexToId => {
      if (Object.keys(zIndexToId).length !== 0) {
        this.renderer2.setStyle(this.el.nativeElement, 'z-index', zIndexToId[this.appletId.toString()])
      }
    })

    //emit applet's id on click
    this.unlisten = this.renderer2.listen(this.el.nativeElement, 'mousedown', () => {
      this.layoutService.focusApplet(this.appletId)
      if (this.el.nativeElement.tagName === 'DIV') { //true for applet references in the header
        this.layoutService.scrollIntoViewSubject.next(this.appletId)
      }
    })
  }

  ngOnDestroy(): void {
    if (this.zIndexSubscription && this.zIndexSubscription.unsubscribe) this.zIndexSubscription.unsubscribe();
    if (this.unlisten) this.unlisten();
  }


}


