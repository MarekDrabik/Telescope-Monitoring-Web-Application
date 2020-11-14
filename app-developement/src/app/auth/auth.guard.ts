import { Route } from "@angular/compiler/src/core";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: Route,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.checkIsAuthenticated().pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }
        return this.router.createUrlTree(["/auth"]);
      })
    );
  }
}
