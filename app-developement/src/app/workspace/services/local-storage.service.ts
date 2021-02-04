import { Inject, Injectable } from "@angular/core";
import { LOCAL_STORAGE, StorageService } from "ngx-webstorage-service";

@Injectable({
  providedIn: "root",
})
// web browser local storage
export class LocalStorageService {
  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {}

  get() {
    return this.storage.get("layout") || [];
  }

  store(layout) {
    this.storage.set("layout", layout);
  }
}
