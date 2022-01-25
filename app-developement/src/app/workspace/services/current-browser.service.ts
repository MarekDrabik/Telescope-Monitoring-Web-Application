import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CurrentBrowserService {
  browser: "default" | "mozzila";

  constructor() {
    this.browser =
      navigator.userAgent.search("Chrom") === -1 ? "mozzila" : "default";
  }
}
