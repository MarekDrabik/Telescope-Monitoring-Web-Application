import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { AuthComponent } from "./auth.component";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";

@NgModule({
  declarations: [
    AuthComponent,
    LoadingSpinnerComponent
  ],
  imports: [SharedModule],
  exports: [AuthComponent],
})
export class AuthModule {}
