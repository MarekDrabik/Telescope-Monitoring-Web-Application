import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { HttpService } from "../shared/services/http.service";
import { UnsubscriptionService } from "../shared/services/unsubscription.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent implements OnInit {
  isLoading = false;
  error: string = null;
  constructor(
    private httpService: HttpService,
    private router: Router,
    private unsubService: UnsubscriptionService
  ) {}
  private _sub: Subscription;

  ngOnInit() {}

  onSubmit(form) {
    this.isLoading = true;
    this.httpService.authenticate(form.value).subscribe(
      (response) => {
        if (response.status == 202) {
          this.router.navigate(["/app"]);
        }
      },
      (error) => {
        if (error.status === 0) {
          this.error = "Connection error, server unreachable.";
        } else {
          this.error = `Error: ${error.error || error.message}`;
        }
        this.isLoading = false;
      },
      () => {
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubService.unsubscribe(this._sub);
  }
}
