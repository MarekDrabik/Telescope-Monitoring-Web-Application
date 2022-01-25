import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpService } from "src/app/shared/services/http.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private httpService: HttpService) {}

  checkIsAuthenticated(): Observable<boolean> {
    return this.httpService.getAuthStatus().pipe(
      // on non-error response:
      map((response) => {
        if (response.status === 202) {
          //is authenticated
          return true;
        }
        //valid reponse but invalid code
        return false;
      }),
      //invalid response (error)
      catchError((error, _caught) => {
        return of(false);
      })
    );
  }
}
