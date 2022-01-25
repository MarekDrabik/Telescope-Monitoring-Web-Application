import { Directive, Input, ElementRef, OnInit, Renderer2 } from "@angular/core";

@Directive({
  selector: "[appDropMenu]",
})
export class DropMenuDirective implements OnInit {
  @Input() dropSide: "top" | "bottom" | "right" | "left" = "bottom";
  @Input("appDropMenu") subMenuAsComponent;

  constructor(private el: ElementRef, private renderer2: Renderer2) {}

  ngOnInit(): void {
    //hide submenu by default:
    let subMenuAsElement = this.subMenuAsComponent.el.nativeElement;
    this.renderer2.setStyle(this.el.nativeElement, "position", "relative");
    this.renderer2.setStyle(subMenuAsElement, "position", "absolute");
    this.renderer2.setStyle(subMenuAsElement, "display", "none");

    //drop menu on main element click:
    this.renderer2.listen(this.el.nativeElement, "click", (event) => {
      event.stopPropagation();
      let subMenuPosition = this._calculateSubmenuPosition();
      this.renderer2.setStyle(subMenuAsElement, "left", subMenuPosition.left);
      this.renderer2.setStyle(subMenuAsElement, "right", subMenuPosition.right);
      this.renderer2.setStyle(subMenuAsElement, "top", subMenuPosition.top);
      this.renderer2.setStyle(
        subMenuAsElement,
        "bottom",
        subMenuPosition.bottom
      );
      this.renderer2.setStyle(subMenuAsElement, "display", "block");
      this._unloadOnMouseLeave();
    });
  }

  private _unloadOnMouseLeave() {
    let subMenuAsElement = this.subMenuAsComponent.el.nativeElement;
    let enteredSubMenu = false;
    let leftMainMenu = false;
    let leftSubMenu = false;
    let l1 = this.renderer2.listen(subMenuAsElement, "mouseenter", () => {
      enteredSubMenu = true;
    });
    let l2 = this.renderer2.listen(this.el.nativeElement, "mouseleave", () => {
      leftMainMenu = true;
      __unloadIfConditionsMet();
    });
    let l3 = this.renderer2.listen(subMenuAsElement, "mouseleave", () => {
      leftSubMenu = true;
      __unloadIfConditionsMet();
    });
    let __unloadIfConditionsMet = () => {
      if ((leftMainMenu && !enteredSubMenu) || leftSubMenu) {
        this.renderer2.setStyle(subMenuAsElement, "display", "none");
        l1();
        l2();
        l3(); //unlisten all 3
      }
    };
  }

  private _calculateSubmenuPosition() {
    let mainElementHeight;
    let top = "unset";
    let bottom = "unset";
    let right = "unset";
    let left = "unset";
    switch (
      this.dropSide //additional sides need to be implemented if needed
    ) {
      case "bottom":
        mainElementHeight = this.el.nativeElement.offsetHeight;
        top = mainElementHeight.toString() + "px";
        left = "0px";
        break;

      default:
        break;
    }
    return { top, bottom, left, right };
  }
}
