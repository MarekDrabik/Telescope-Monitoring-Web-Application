import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommanderComponent } from "../applets/commander/commander.component";
import { SharedModule } from "../shared/shared.module";
import { GraphComponent } from "../applets/graph/graph.component";
import { FocusedImageComponent } from "../applets/imagery/focused-image/focused-image.component";
import { ImageryComponent } from "../applets/imagery/imagery.component";
import { ThumbnailComponent } from "../applets/imagery/thumbnail/thumbnail.component";
import { TimelineComponent } from "../applets/imagery/timeline/timeline.component";
import { TableComponent } from "../applets/table/table.component";
import { LayoutComponent } from "./layout/layout.component";
import { LostConnectionComponent } from "./lost-connection/lost-connection.component";
import { SetImageUrlDirective } from "../directives/set-image-url.directive";
import { Route, RouterModule } from "@angular/router";

// const routes: Route[] = [{ path: "", component: LayoutComponent }];

@NgModule({
  declarations: [
    LayoutComponent,
    GraphComponent,
    ImageryComponent,
    TableComponent,
    ThumbnailComponent,
    FocusedImageComponent,
    TimelineComponent,
    CommanderComponent,
    LostConnectionComponent,
    SetImageUrlDirective,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    FormsModule,
    // RouterModule.forChild(routes),
  ],
  exports: [
    LayoutComponent,
    // RouterModule,
  ],
})
export class LayoutModule {}
