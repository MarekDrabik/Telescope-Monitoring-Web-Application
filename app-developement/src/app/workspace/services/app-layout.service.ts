import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { HttpService } from "src/app/shared/services/http.service";
import {
  AppletDetails,
  AppletType,
  TelemetrySettings,
  TelemetrySource,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { ConnectionBrokenService } from "./connection-broken.service";
import { LocalStorageService } from "./local-storage.service";
import { TelemetrySourcesService } from "./telemetry-sources.service";

@Injectable({
  providedIn: "root",
})
export class AppLayoutService implements OnDestroy {
  layout: AppletDetails[] = [];
  telemetrySettings: TelemetrySettings;
  zIndexSubject: BehaviorSubject<{ [id: string]: number }>; //behavior makes new applets receive this update
  currentAppletsSubject: BehaviorSubject<AppletDetails[]>;
  changeSourcesSubject = new Subject<{
    id: number;
    telemetrySources: TelemetrySource[];
  }>();
  scrollIntoViewSubject = new Subject<number>();
  _sub: Subscription;

  readonly DEFAULT_POSITION = { x: -170, y: 50 };
  previousAppPosition = this.DEFAULT_POSITION;

  constructor(
    private localStorageService: LocalStorageService,
    private httpService: HttpService,
    private telemetrySourcesService: TelemetrySourcesService,
    private connectionLostService: ConnectionBrokenService
  ) {
    // initialize subjects with empty values first because we cannot start building the app before we fetch
    // settings from the server
    this.currentAppletsSubject = new BehaviorSubject<AppletDetails[]>([]);
    this.zIndexSubject = new BehaviorSubject<{ [id: string]: number }>({});
    this._initializeLayout();
  }

  addApplet(appletType: AppletType) {
    let newAppletDetails = this._generateDetailsForNewApplet(
      appletType
    );
    this.layout.push(newAppletDetails);
    this.currentAppletsSubject.next(this.layout);
    this.focusApplet(newAppletDetails.id);
    this.localStorageService.store(this.layout);
  }

  deleteApplet(appletId: number) {
    this.layout = this.layout.filter((applet) => applet.id !== appletId);
    this.currentAppletsSubject.next(this.layout);
    this.localStorageService.store(this.layout);
  }

  getAppletDetails = (id: number): AppletDetails => {
    if (!this.layout || this.layout.length === 0) return null; //generic check
    for (let applet of this.layout) {
      if (applet.id === id) return applet;
    }
    return null; //not found
  };

  getAppletDetailsProperty = (id: number, detailsProperty: string) => {
    if (this.layout.length === 0) throw Error("Cannot modify empty layout");
    if (!this.layout[0].hasOwnProperty(detailsProperty))
      throw Error("Property not in applet details!");

    for (let appletDetails of this.layout) {
      if (appletDetails.id === id) return appletDetails[detailsProperty];
    }
  };

  storeAppletPosition(
    appletId: number,
    appletPosition: { x: number; y: number }
  ) {
    this._modifyAppletDetails(appletId, { position: appletPosition });
  }

  storeAppletSize(
    appletId: number,
    appletSize: { width: number; height: number }
  ) {
    this._modifyAppletDetails(appletId, { size: appletSize });
  }

  storeAppletHistory(appletId: number, appletHistory: Array<any>) {
    this._modifyAppletDetails(appletId, { history: appletHistory });
  }

  changeTelemetrySources(appletId: number, newSources: TelemetrySource[]) {
    this._modifyAppletDetails(appletId, { telemetrySources: newSources });
    this.changeSourcesSubject.next({
      id: appletId,
      telemetrySources: this.getAppletDetailsProperty(
        appletId,
        "telemetrySources"
      ),
    });
  }

  focusApplet(appletId: number) {
    let currentZIndexOfThatView = this.getAppletDetailsProperty(
      appletId,
      "zIndex"
    );
    let zIndexToIds = this._getDetailToIds("zIndex");
    let id: string, zIndex: number;
    //subtract 1 from zindexes of all applets that are rendered in front of currently selected applet
    //this is done so that we always repeat same z-indexes (e.g. 101, 102, 103 if we have 3 existing applets)
    for ([id, zIndex] of Object.entries(zIndexToIds)) {
      if (zIndex > currentZIndexOfThatView)
        this._modifyAppletDetails(+id, {
          zIndex: this.getAppletDetailsProperty(+id, "zIndex") - 1,
        });
    }
    //now give the selected applet highest index (e.g. 103 if we have 3 existing applets)
    this._modifyAppletDetails(appletId, { zIndex: this.layout.length + 100 });
    //finally, inform all applets about new setup
    this.zIndexSubject.next(this._getDetailToIds("zIndex"));
  }

  private _initializeLayout() {
    this.layout = this.localStorageService.get(); //get webbrowser stored layout settings
    //start loading the whole app only after you fetch telemetry settings from the server:
    this._sub = this.httpService.getSettings().subscribe(
      (telemetrySettings) => {
        // update the layout (telemetry sources) to current user telemetry settings
        // (telemetry-settings.json file stored on the server)
        this.telemetrySourcesService.initialize(
          telemetrySettings as TelemetrySettings
        );
        this._updateLayoutToCurrentTelemetrySettings();
        this.currentAppletsSubject.next(this.layout);
        this.zIndexSubject.next(this._getDetailToIds("zIndex"));
      },
      (err) => {
        console.error(
          "Couldnt get initial settings file, server unreachable",
          err
        );
        this.connectionLostService.onConnectionBroken();
      }
    );
  }

  private _modifyAppletDetails(
    id: number,
    details: { [detailsProperty: string]: any }
  ) {
    if (this.layout.length === 0) throw Error("Cannot modify empty layout");
    for (let prop of Object.keys(details)) {
      if (!this.layout[0].hasOwnProperty(prop))
        throw Error("Property not in applet details!");
    }
    let index: string, appletDetails: AppletDetails;
    for ([index, appletDetails] of Object.entries(this.layout)) {
      if (appletDetails.id === id)
        this.layout[+index] = { ...appletDetails, ...details };
    }
    this.localStorageService.store(this.layout);
  }

  private _getTypeDefaultDetails(appletType: AppletType) {
    let defaultAppletDetails = {
      //general
      position: this._getPositionForAnotherApplet(),
      size: { width: 550, height: 450 },
      zIndex: 100,
      history: [],
      telemetryTypes: [],
    };
    switch (
      appletType //type specific defaults can be added here:
    ) {
      case "table":
        defaultAppletDetails.size = { width: 520, height: 250 };
        defaultAppletDetails.telemetryTypes = ["point", "text"] as TelemetryType[];
        break;

      case "graph":
        defaultAppletDetails.telemetryTypes = ["point"] as TelemetryType[];
        break;

      case "map":
        defaultAppletDetails.telemetryTypes = ["position"] as TelemetryType[];
        break;

      case "imagery":
        defaultAppletDetails.telemetryTypes = ["image"] as TelemetryType[];
        break;

      case "commander":
        defaultAppletDetails.size = { width: 250, height: 150 };
        break;

      default:
        break;
    }
    return defaultAppletDetails;
  }

  private _getPositionForAnotherApplet() {
    const availableWidth = window.document.body.offsetWidth;
    const availableHeight = window.document.body.offsetHeight;
    const RAISE = { x: 200, y: 100 };
    let newPosition = { ...this.previousAppPosition };
    if (
      this.previousAppPosition.x + 2 * RAISE.x > availableWidth &&
      this.previousAppPosition.y + 2 * RAISE.y > availableHeight
    ) {
      newPosition = {
        x: this.DEFAULT_POSITION.x + RAISE.x,
        y: this.DEFAULT_POSITION.y,
      }; //reset if too many apps were created;
    } else {
      if (newPosition.x + 2 * RAISE.x < availableWidth) {
        newPosition.x = this.previousAppPosition.x + RAISE.x;
      } else {
        newPosition.x = this.DEFAULT_POSITION.x + RAISE.x;
        newPosition.y = this.previousAppPosition.y + RAISE.y;
      }
    }
    this.previousAppPosition = { ...newPosition };
    return newPosition;
  }

  private _generateDetailsForNewApplet(
    appletType: AppletType
  ) {
    let newId = this._generateUniqueId();
    let defaultDetails = this._getTypeDefaultDetails(appletType);
    let telemetrySources: TelemetrySource[];
    telemetrySources = this.telemetrySourcesService.getAvailableTelemetrySources(
      defaultDetails.telemetryTypes
    );
    if (telemetrySources.length !== 0) {
      telemetrySources = telemetrySources.slice(0, 1); //pick only 1. source by default
    }
    return { id: newId, ...defaultDetails, appletType, telemetrySources };
  }

  private _getDetailToIds(detailsProperty: keyof AppletDetails): { [id: string]: any } {
    if (this.layout.length === 0) return {};
    if (!this.layout[0].hasOwnProperty(detailsProperty))
      throw Error("Property not in applet details!");
    let result: { [id: string]: any } = {};
    for (let appletLayout of this.layout) {
      result[appletLayout.id.toString()] = appletLayout[detailsProperty];
    }
    return result;
  }

  private _generateUniqueId(): number {
    let currentlyTakenIds: number[] = this.layout.map(
      (appletDetails) => appletDetails.id
    ); // [] or array of ids
    for (let id = 0; id <= 1000; id++) {
      if (!currentlyTakenIds.includes(id)) return id;
    }
    console.error("Couldnt generate unique id out of 1000 tries!");
  }

  //telemetry settings that are stored on server in telemetry-settings.json
  private _updateLayoutToCurrentTelemetrySettings() {
    let previousTelemetrySourcesOfApplets = this._getDetailToIds(
      "telemetrySources"
    );
    let typesOfTelemetry = this._getDetailToIds("telemetryTypes");
    let appletId, appletSources;
    let sourcesAvailableForThisAppletType = [];
    let currentSourcesOfApplet = [];

    for ([appletId, appletSources] of Object.entries(
      previousTelemetrySourcesOfApplets
    )) {
      if (this._appletIsATelemetryApplet(+appletId)) {
        //appletSources can be [] or have multiple sourcenames as strings
        //compare current sources with what is currently registered in TelemetrySourcesService and take action
        sourcesAvailableForThisAppletType = this.telemetrySourcesService.getAvailableTelemetrySources(
          typesOfTelemetry[+appletId]
        );
        //filter out sources that are no longer available:
        currentSourcesOfApplet = previousTelemetrySourcesOfApplets[
          +appletId
        ].filter((source) => {
          return sourcesAvailableForThisAppletType.includes(source);
        });
        //if all previously displayed sources were now filtered out, then let applet display one available source
        //display just one so to not take care of multiple sources for imagery etc...
        if (currentSourcesOfApplet.length === 0) {
          if (sourcesAvailableForThisAppletType.length !== 0) {
            currentSourcesOfApplet.push(sourcesAvailableForThisAppletType[0]);
          }
        }
        this._modifyAppletDetails(+appletId, {
          telemetrySources: currentSourcesOfApplet,
        });
      }
    }
  }

  private _appletIsATelemetryApplet(appletId) {
    let appletType = this.getAppletDetailsProperty(appletId, "appletType");
    return (
      appletType === "imagery" ||
      appletType === "graph" ||
      appletType === "table"
    );
  }

  ngOnDestroy(): void {
    if (this._sub && this._sub.unsubscribe) this._sub.unsubscribe;
  }
}
