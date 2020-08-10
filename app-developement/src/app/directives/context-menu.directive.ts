import { Directive, HostListener, Input, Renderer2 } from '@angular/core';
import { SubMenuComponent } from '../shared/sub-menu/sub-menu.component';

@Directive({
  selector: '[appContextMenu]'
})
export class ContextMenuDirective {

  @Input('submenuComponent') submenuComponent: SubMenuComponent;

  constructor(
    private renderer2: Renderer2
  ) { }

  @HostListener('contextmenu', ['$event'])
  onRightClick = (event) => {
    // console.log('click')
    event.preventDefault()
    let optimalPosition = this._calculateOptimalPositionProperties(event)
    let submenuElement = this.submenuComponent.el.nativeElement //hack to get native element of submenuComponent component
    this.renderer2.setStyle(submenuElement, 'position', 'fixed')
    this.renderer2.setStyle(submenuElement, 'left', optimalPosition.left)
    this.renderer2.setStyle(submenuElement, 'right', optimalPosition.right)
    this.renderer2.setStyle(submenuElement, 'top', optimalPosition.top)
    this.renderer2.setStyle(submenuElement, 'bottom', optimalPosition.bottom)
    this.renderer2.setStyle(submenuElement, 'display', 'block')
    this.renderer2.setStyle(submenuElement, 'z-index', '600')
    //register listener that will unload this contextmenu
    let menuUnload = this.renderer2.listen(document, 'mousedown', (outsideClick) => { //mousedown to include all mouse buttons
      if (!outsideClick.composedPath().includes(submenuElement)) {
        this.renderer2.setStyle(submenuElement, 'display', 'none') //hides the menu if its left mouse button
        //if its right mouse button, this menu will reapear immediatly because there is another listener onRightClick()
        menuUnload() //stop listening to global menuUnload event
      }
    })
  }

  //optimal position so that we don't render menu outside of viewport:
  private _calculateOptimalPositionProperties(event) {
    let clickX = event.clientX
    let clickY = event.clientY - 16
    let centerX = window.innerWidth / 2
    let centerY = window.innerHeight / 2
    let left, right, top, bottom;
    //position based on click position to viewport (to not render window outside the viewport)
    if (clickX < centerX) { //left half of viewport
      left = clickX.toString() + 'px';
      right = 'unset';
    } else { //right half of viewport
      left = 'unset';
      right = (window.innerWidth - clickX - 16).toString() + 'px';
    }
    if (clickY < centerY) { //upper half of viewport
      top = (clickY + 10).toString() + 'px';
      bottom = 'unset';
    } else { //lower half of viewport
      top = 'unset';
      bottom = (window.innerHeight - clickY - 48).toString() + 'px';
    }
    return { left, right, top, bottom }
  }
}
