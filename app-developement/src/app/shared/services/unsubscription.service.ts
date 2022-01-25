import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UnsubscriptionService {
  constructor() {}

  unsubscribeFromArray(subscriptions, errorMessage?) {
    console.assert(Array.isArray(subscriptions));
    for (let subscription of subscriptions) {
      this.unsubscribe(subscription);
    }
  }

  unsubscribeFromObject(objectOfSubs: { [s: string]: Subscription }) {
    for (let i in objectOfSubs) {
      this.unsubscribe(objectOfSubs[i]);
    }
  }

  unsubscribe(subscription: Subscription, errorMessageOnNoAction?) {
    if (!subscription || subscription.closed) {
      if (errorMessageOnNoAction) {
        console.error(errorMessageOnNoAction);
      }
    } else {
      subscription.unsubscribe();
    }
  }
}
