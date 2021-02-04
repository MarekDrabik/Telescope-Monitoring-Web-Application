import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommanderComponent } from "./applets/commander/commander.component";
import { GraphComponent } from "./applets/graph/graph.component";
import { FocusedImageComponent } from "./applets/imagery/focused-image/focused-image.component";
import { ImageryComponent } from "./applets/imagery/imagery.component";
import { SetImageUrlDirective } from "./applets/imagery/set-image-url.directive";
import { ThumbnailComponent } from "./applets/imagery/thumbnail/thumbnail.component";
import { TimelineComponent } from "./applets/imagery/timeline/timeline.component";
import { MapComponent } from "./applets/map/map.component";
import { TableComponent } from "./applets/table/table.component";
import { MoveResizeDirective } from "./directives/app-move-resize.directive";
import { AppletLayoutTrackerDirective } from "./directives/applet-layout-tracker.directive";
import { AutoStretchInputDirective } from "./directives/auto-stretch-input.directive";
import { ClockUpdateRateDirective } from "./directives/clock-update-rate.directive";
import { ContextMenuDirective } from "./directives/context-menu.directive";
import { ResizeListenerDirective } from "./directives/resize-listener.directive";
import { FullscreenDirective } from "./directives/fullscreen.directive";
import { OnClickFocusDirective } from "./directives/on-click-focus.directive";
import { ControlPanelComponent } from "./misc-components/control-panel/control-panel.component";
import { ControlPanelFormValidatorDirective } from "./misc-components/control-panel/directives/control-panel-form-validator.directive";
import { ControlValidatorDirective } from "./misc-components/control-panel/directives/control-validator.directive";
import { DateFromEpochnumberPipe } from "./misc-components/control-panel/pipes/date-from-epochnumber.pipe";
import { EpochnumberToTimestringPipe } from "./misc-components/control-panel/pipes/epochnumber-to-timestring.pipe";
import { ReceivedDelayPipe } from "./misc-components/control-panel/pipes/received-delay.pipe";
import { ReceivedTimestringPipe } from "./misc-components/control-panel/pipes/received-timestring.pipe";
import { TimeFromEpochnumberPipe } from "./misc-components/control-panel/pipes/time-from-epochnumber.pipe";
import { StopDblclickPropagationDirective } from "./misc-components/dygraphs/directives/app-stop-dblclick-propagation.directive";
import { FadeVerticalSelectorsDirective } from "./misc-components/dygraphs/directives/fade-vertical-selectors.directive";
import { DygraphsComponent } from "./misc-components/dygraphs/dygraphs.component";
import { FixInputBlurDirective } from "./misc-components/dygraphs/services/fix-input-blur.directive";
import { DropMenuDirective } from "./misc-components/header/drop-menu.directive";
import { HeaderComponent } from "./misc-components/header/header.component";
import { LeafletMapComponent } from "./misc-components/leaflet-map/leaflet-map.component";
import { LostConnectionComponent } from "./misc-components/lost-connection/lost-connection.component";
import { SubMenuComponent } from "./misc-components/sub-menu/sub-menu.component";
import { WorkspaceComponent } from "./workspace.component";

const components = [
  WorkspaceComponent,
  GraphComponent,
  ImageryComponent,
  TableComponent,
  MapComponent,
  ThumbnailComponent,
  FocusedImageComponent,
  TimelineComponent,
  CommanderComponent,
  LostConnectionComponent,
  DygraphsComponent,
  ControlPanelComponent,
  LeafletMapComponent,
  HeaderComponent,
  SubMenuComponent,
];

const directives = [
  AppletLayoutTrackerDirective,
  MoveResizeDirective,
  AutoStretchInputDirective,
  ClockUpdateRateDirective,
  ContextMenuDirective,
  ResizeListenerDirective,
  FullscreenDirective,
  OnClickFocusDirective,
  ControlPanelFormValidatorDirective,
  ControlValidatorDirective,
  SetImageUrlDirective,
  StopDblclickPropagationDirective,
  FadeVerticalSelectorsDirective,
  DropMenuDirective,
  FixInputBlurDirective,
];
const pipes = [
  DateFromEpochnumberPipe,
  EpochnumberToTimestringPipe,
  ReceivedDelayPipe,
  ReceivedTimestringPipe,
  TimeFromEpochnumberPipe,
];

@NgModule({
  declarations: [...components, ...directives, ...pipes],
  imports: [
    SharedModule,
  ],
  exports: [
    WorkspaceComponent,
  ],
})
export class WorkspaceModule {}
