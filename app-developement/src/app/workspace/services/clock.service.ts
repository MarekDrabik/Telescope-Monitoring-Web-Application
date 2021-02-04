import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ClockService {
  clock: Observable<number>;
  milliClock: Observable<number>;

  constructor() {
    //'normal' clock speed (emits every 1 second)
    this.clock = new Observable<number>((observer) => {
      let dateNowString: string;
      let dateNowMilliseconds: number;
      let periodicUpdate;

      //initiate updates
      setUpdateInterval();

      function setUpdateInterval() {
        //emit first right on the call
        observer.next(Date.now());

        periodicUpdate = setInterval(() => {
          if (observer.closed) {
            clearInterval(periodicUpdate);
          }
          observer.next(Date.now());

          dateNowString = Date.now().toString();
          dateNowMilliseconds = +dateNowString.slice(dateNowString.length - 3);
          if (dateNowMilliseconds < 0 || dateNowMilliseconds > 1000) {
            console.error("milliseconds invalid");
          }
          if (dateNowMilliseconds > 20) {
            //!== 0 would be ideal, but there is always some delay caused by processing,
            // so 20 milliseconds delay will be tolerated, bigger delay will trigger recalibration of clocks:
            clearInterval(periodicUpdate);
            setTimeout(setUpdateInterval, 1000 - dateNowMilliseconds);
          }
        }, 1000);
      }
    });

    //'fast' clock speed (emits every 100 milliseconds)
    this.milliClock = new Observable<number>((observer) => {
      let dateNow: number;
      let tenth: number;
      function reset() {
        //implemented to hopefully save performance to call
        //Date.now() only every second, not every 10th of a second
        dateNow = Date.now();
        tenth = 0;
      }
      reset();
      observer.next(dateNow); //emits on subscription
      setInterval(() => {
        if (tenth === 1000) {
          reset();
        }
        observer.next(dateNow + tenth);
        tenth += 100;
      }, 100);
    });
  }
}
