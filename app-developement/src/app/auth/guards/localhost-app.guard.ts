import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AppEnvironmentService } from "../services/app-environment.service";

@Injectable({
  providedIn: "root",
})
export class LocalhostAppGuard implements CanActivate {
  constructor(
    private router: Router,
    private appEnvironmentService: AppEnvironmentService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (this.appEnvironmentService.isServerOnLocalhost()) {
      return this.router.createUrlTree(["/app"]);
    }
    return true;
  }
}
