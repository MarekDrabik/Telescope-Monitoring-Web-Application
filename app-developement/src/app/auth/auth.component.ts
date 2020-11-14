import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpService } from "../services/http.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent implements OnInit {
  isLoading = false;
  error: string = null;
  constructor(private httpService: HttpService, private router: Router) {}

  ngOnInit() {}

  onSubmit(form) {
    this.isLoading = true;
    this.httpService.authenticate(form.value).subscribe(
      (response) => {
        if (response.status == 202) {
          this.router.navigate(["/app"]);
          // this.isLoading = false;
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
        // this.isLoading = false;
      }
    );
  }
}
