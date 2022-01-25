import {
  animate,
  group,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

export const popUp = trigger("popUp", [
  state(
    "created",
    style({
      opacity: 1,
    })
  ),
  transition("void <=> *", animate(200)),
]);

export const creation = trigger("creation", [
  state(
    "in",
    style({
      opacity: 0.8,
    })
  ),
  transition(":enter", [
    style({
      opacity: 0,
    }),
    animate(300),
  ]),
  transition(":leave", [
    animate(
      500,
      style({
        opacity: 0,
      })
    ),
  ]),
]);

export const showSelector = trigger("showSelector", [
  state(
    "show",
    style({
      height: "15px",
      padding: "1px",
      opacity: 1,
    })
  ),
  state(
    "hide",
    style({
      height: "0px",
      padding: "0px",
      opacity: 0,
    })
  ),
  transition("hide <=> show", [animate(100)]),
]);

export const showSide = trigger("showSide", [
  state(
    "show",
    style({
      opacity: 1,
    })
  ),
  state(
    "hide",
    style({
      opacity: 0,
    })
  ),
  transition("hide <=> show", [animate(300)]),
]);

export const timelineCollapse = trigger("timelineCollapse", [
  state(
    "show",
    style({
      height: "14vh",
      "min-height": "14vh",
      opacity: "1",
    })
  ),
  state(
    "hide",
    style({
      height: "0px",
      "min-height": "0px",
      opacity: "0",
    })
  ),
  transition(
    "show => hide",
    group([
      animate(
        100,
        style({
          height: "0px",
          "min-height": "0px",
        })
      ),
      animate(
        50,
        style({
          opacity: "0",
        })
      ),
    ])
  ),
  transition(
    "hide => show",
    group([
      animate(
        100,
        style({
          height: "14vh",
          "min-height": "14vh",
        })
      ),
      animate(
        50,
        style({
          opacity: "1",
        })
      ),
    ])
  ),
]);
