import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header/header.component';
import { MoveResizeDirective } from '../directives/app-move-resize.directive';
import { StopDblclickPropagation } from '../directives/app-stop-dblclick-propagation.directive';
import { AppletLayoutTrackerDirective } from '../directives/applet-layout-tracker.directive';
import { AutoStretchInputDirective } from '../directives/auto-stretch-input.directive';
import { ClockUpdateRateDirective } from '../directives/clock-update-rate.directive';
import { ContextMenuDirective } from '../directives/context-menu.directive';
import { ControlValidatorDirective } from '../directives/control-validator.directive';
import { DropMenuDirective } from '../directives/drop-menu.directive';
import { FadeVerticalSelectorsDirective } from '../directives/fade-vertical-selectors.directive';
import { FixDygraphResizeDirective } from '../directives/fix-dygraph-resize.directive';
import { FixInputBlurDirective } from '../directives/fix-input-blur.directive';
import { FullscreenDirective } from '../directives/fullscreen.directive';
import { OnClickFocusDirective } from '../directives/on-click-focus.directive';
import { UipanelFormValidatorDirective } from '../directives/uipanel-form-validator.directive';
import { DygraphsComponent } from './dygraphs/dygraphs.component';
import { SubMenuComponent } from './sub-menu/sub-menu.component';
import { UiPanelComponent } from './ui-panel/ui-panel.component';

@NgModule({
  declarations: [
    UiPanelComponent,
    SubMenuComponent,
    DygraphsComponent,
    AutoStretchInputDirective,
    ControlValidatorDirective,
    FadeVerticalSelectorsDirective,
    FixInputBlurDirective,
    StopDblclickPropagation,
    UipanelFormValidatorDirective,
    OnClickFocusDirective,
    MoveResizeDirective,
    ContextMenuDirective,
    HeaderComponent,
    DropMenuDirective,
    AppletLayoutTrackerDirective,
    FullscreenDirective,
    ClockUpdateRateDirective,
    FixDygraphResizeDirective
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    UiPanelComponent,
    SubMenuComponent,
    DygraphsComponent,
    AutoStretchInputDirective,
    ControlValidatorDirective,
    FadeVerticalSelectorsDirective,
    FixInputBlurDirective,
    StopDblclickPropagation,
    UipanelFormValidatorDirective,
    OnClickFocusDirective,
    MoveResizeDirective,
    ContextMenuDirective,
    HeaderComponent,
    DropMenuDirective,
    AppletLayoutTrackerDirective,
    FullscreenDirective,
    ClockUpdateRateDirective,
    FixDygraphResizeDirective
  ]
})
export class SharedModule { }
