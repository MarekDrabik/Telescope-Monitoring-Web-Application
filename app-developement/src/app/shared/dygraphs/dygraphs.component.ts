import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { DygraphOptions, DygraphSubject, TelemetryCachePoint } from 'src/app/types/custom.types';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FixLegendPositionService } from '../../services/fix-legend-position.service';
import { creation, showSelector, showSide } from '../animations';
import { CurrentBrowserService } from 'src/app/services/current-browser.service';

@Component({
  selector: 'app-dygraphs',
  templateUrl: './dygraphs.component.html',
  styleUrls: ['./dygraphs.component.scss'],
  encapsulation: ViewEncapsulation.None, //to apply style to elements of dygraph package
  providers: [FixLegendPositionService],
  //(!applies style to whole document!)
  animations: [ creation, showSide, showSelector ]
})
export class DygraphsComponent implements OnInit, AfterViewInit {
// this class has a lot of hacky code (especially zoom/unzoom functionality) as 
// I couldn't find any better solutions

  @ViewChild('chart', { static: true }) chart: ElementRef;
  showInfo = false; //unzoominformation message
  showSelector: 'hide' | 'show' = 'hide'; // that its also zoomedVertically is handled in fade-vertical-selectors.directive
  dygraph;
  @Input() updateDygraphSubject: DygraphSubject;

  @ViewChild('formObject', { static: true }) verticalRangeForm: NgForm;
  upperBound: number = 3;
  lowerBound: number = 3;
  verticalSelectorStep = null;
  initialRange = [null, null];
  verticalInputSubject: Subject<any>;
  ZOOM_RATE = 10;
  SHOW_INFO_DURATION = 5000;

  zoomedVertically = false;
  showVerticalSides: 'hide' | 'show' = 'hide';
  showRightSide: 'hide' | 'show' = 'hide';
  showLeftSide: 'hide' | 'show' = 'hide';
  isFreshZoomIn = true;
  showInfoTimeout;

  zoomTracker = {
    lastYRange: null,
    unzoomedFromDblclick: false
  }

  constructor(
    private ren: Renderer2,
    private ref: ChangeDetectorRef,
    private utils: UtilitiesService,
    private appDygraphElement: ElementRef,
    private fixLegendPositionService: FixLegendPositionService,
    public currentBrowserService: CurrentBrowserService
  ) { }

  ngOnInit() {
    this._subscribeToVerticalInputSubject()
  }

  ngAfterViewInit(): void {
    //custom plugin that uses preventDefault feature of dygraphs to implement my 
    // own doubleclick behaviour
    let preventDoubleClick = {
      activate: function (g) {
        return ({
          dblclick: e => {
            e.preventDefault();
          }
        })
      }
    }
    this.dygraph = new Dygraph(this.chart.nativeElement, [[0, null]], {
      plugins: [
        preventDoubleClick
      ]
    });
    this.dygraph.ready(() => {
      //set some initial values:
      // this._updateSelectors(['value', 'step'])
      this.fixLegendPositionService.initiate(this.appDygraphElement, this.ren)
      this._registerCallbacks()
      this._subscribeToParentUpdates()
      this._resizeGraphToContainer() //last in the execution fixes ugly graphic around range selector
    })
  }

  private _registerCallbacks() {
    this.dygraph.updateOptions({
      drawCallback: () => {
        let yRange = this.dygraph.yAxisRange()
        let x0 = this.dygraph.xAxisRange()[0]
        let x1 = this.dygraph.xAxisRange()[1]
        if (this.dygraph.isZoomed()) {

          // keep track of zoom values in input selectors (zoom changes not only through inputs)
          this._updateSelectors(['value', 'step'])
          //on zoom (from user selection / boundary widget)
          if (this.dygraph.isZoomed('x')) {
            let xAxisExtremes = this.dygraph.xAxisExtremes()
            // console.log('xAxisEctresmes:', xAxisExtremes, 'x0, x1:', x0, x1)
            if (x0 > xAxisExtremes[0]) {
              this.showLeftSide = 'show';
            }
            else { //if specifically this side is unzoomed
              this.showLeftSide = 'hide';
            }
            if (x1 < xAxisExtremes[1]) {
              this.showRightSide = 'show';
            }
            else { //if specifically this side is unzoomed
              this.showRightSide = 'hide';
            }
          } else { //graph is unzoomed horizontally and zoomed vertically
            this.showLeftSide = 'hide';
            this.showRightSide = 'hide';
          }

          if (this.dygraph.isZoomed('y')) {
            //store the yRange of the last zoomed state so that we can restore this zoom if needed (see zoomCallback())
            this.zoomTracker.lastYRange = yRange;
            this.zoomedVertically = true; this.showVerticalSides = 'show';
          } else { //graph is unzoomed vertically and zoomed horizontally
            this.zoomedVertically = false; this.showVerticalSides = 'hide';
          }

        } else { //graph totally unzoomed. this 'else' is here only to fix bug where horizontal zoom
          // didnt unzoom on user submit as it should
          this.showLeftSide = 'hide';
          this.showRightSide = 'hide';
        }

        // this.ref.detectChanges()
        //always update legend position so it doesnt bug for Unzoom: 
        let properPosition = this.fixLegendPositionService.legendPositionSubject.getValue()
        this.fixLegendPositionService.modifyLegendPositionAccordingly(properPosition)
      },
      zoomCallback: (x0, x1, yRange) => {
        //NOT CALLED on selectors input because that is changing valueRange

        if (this.dygraph.isZoomed() && this.isFreshZoomIn) {
          this.isFreshZoomIn = false; //to show message just once
          clearTimeout(this.showInfoTimeout) //kill if there is previous hide event pending
          this.showInfo = true;
          this.showInfoTimeout = setTimeout(() => this.showInfo = false, this.SHOW_INFO_DURATION)
        }

        if (!this.dygraph.isZoomed()) {
          //on total unzoom:
          if (this.zoomTracker.unzoomedFromDblclick) { //full unzoom is intentional, nothing to tinker,
            //just reset the property
            this.zoomTracker.unzoomedFromDblclick = false;
          }
          else if (this.zoomTracker.lastYRange !== null) { //total unzoom was triggered by horizontal rangeselector,
            // but there was a vertical zoom before that should be kept, so restore it:
            this.dygraph.updateOptions({ valueRange: this.zoomTracker.lastYRange })
            //this.zoomTracker.lastYRange stays unmodified
            return; //IMPORTANT, to not run following code
          }
          //FOLLOWING CODE executes on actual full unzoom:
          //FOLLOWING CODE executes for (this.zoomTracker.unzoomedFromDblclick || this.zoomTracker.lastYRange === null)
          this.showInfo = false; //unload immediatly (useful if unzoom happened while info was still displayed)
          this.isFreshZoomIn = true; //prepare for later zoomins
          this.zoomTracker.lastYRange = null; //store this official unzoom event
          this.dygraph.updateOptions({ valueRange: null }) //making unzoom explicit as dygraph doesn't update this
          this.zoomedVertically = false; this.showSelector = 'hide'; this.showVerticalSides = 'hide';
          this.showLeftSide = 'hide';
          this.showRightSide = 'hide';

        }
        // this.ref.detectChanges()
      }
    })
  }
  onVerticalRangeInput(lower, upper) {
    this.verticalInputSubject.next([+lower, +upper])
    this._updateSelectors(['step'])
  }

  private _subscribeToVerticalInputSubject() { //called once on init
    this.verticalInputSubject = new Subject<any>()

    let sub = this.verticalInputSubject
      .pipe(throttle(() => timer(50)))
      .subscribe(v => {
        //update zoom every x seconds, not sure if necessary
        this.dygraph.updateOptions({
          valueRange: v
        })
      })
  }

  private _updateSelectors(what: Array<string>) { // 'value' / 'step'
    let yAxisRange = this.dygraph.yAxisRange()
    let currentRange = Math.abs(yAxisRange[0] - yAxisRange[1])
    let step: number, roundingCoeficient: number;
    [step, roundingCoeficient] = this.utils.calculateStepAndPrecision(currentRange, this.ZOOM_RATE)
    //patch value is here for the case where user zooms in with mouse drag
    let newYAxisRange = [+yAxisRange[0].toFixed(roundingCoeficient), +yAxisRange[1].toFixed(roundingCoeficient)]
    if (what.includes('value')) {
      this.lowerBound = newYAxisRange[0]
      this.upperBound = newYAxisRange[1]
    }
    if (what.includes('step')) { // called on input change
      this.verticalSelectorStep = +step;
    }
  }

  @HostListener('dblclick')
  onUnzoomFromDblclick() {
    this.zoomTracker.unzoomedFromDblclick = true;
    this.dygraph.resetZoom();
  }

  onUnzoomFromVerticalRefreshButton() {
    this.zoomTracker.lastYRange = null
    this.dygraph.updateOptions({ valueRange: null });
    this.zoomedVertically = false; this.showSelector = 'hide'; this.showVerticalSides = 'hide';
    if (!this.dygraph.isZoomed('x')) { //its a total unzoom, so update necessary variables
      this.showInfo = false; //unload immediatly (useful if unzoom happened while info was still displayed)
      this.isFreshZoomIn = true;
    }
  }

  private _subscribeToParentUpdates() {
    this.updateDygraphSubject.subscribe(options => {
      let opt: DygraphOptions = {};
      if (options.withCheck) { //check to be implemnted if needed
        opt = { ...options.withCheck }
      }
      if (options.withoutCheck) {
        opt = { ...opt, ...options.withoutCheck }
      }
      // preserve whatever range is set (zoomed or automatic) - fixing bugged behaviour:
      // this code is important for 'file' or any other dygraph option update
      if (this.dygraph.isZoomed('y')) {
        opt['valueRange'] = this.dygraph.yAxisRange()
      } else {
        opt['valueRange'] = null; //auto
      }
      if (this.dygraph.isZoomed('x') && opt.hasOwnProperty('file') && !options.dontMoveZoomWindow) {
        opt['dateWindow'] = this._calculateNewZoomWindowPosition(opt['file'])
      } else {
        //no need to implement, dygraph does it automatically
      }
      //empty dataset
      if (opt.hasOwnProperty('file') && Array.isArray(opt['file']) && opt['file'].length === 0) {
        opt['file'] = [];
      }
      this.dygraph.updateOptions(opt)
      //fixing bug where dygraph won't resize with container resizing by user
      if (options.resize) {
        this._resizeGraphToContainer()
      }
      if (options.unzoomHorizontally) {
        this._resetHorizontalZoom()
      }
    })
  }
  private _resetHorizontalZoom() {
    this.dygraph.resetZoom()
  }

  private _resizeGraphToContainer() {
    let w = this.chart.nativeElement.parentElement.offsetWidth
    let h = this.chart.nativeElement.parentElement.offsetHeight
    this.dygraph.resize(w, h)
  }
  private _calculateNewZoomWindowPosition(cache: TelemetryCachePoint[]) {
    if (cache.length < 2) { return null }; //not enough data
    let lastTwoTimestamps = cache.slice(cache.length - 2).map(datum => (datum[0] as Date).getTime())
    let deltaTimeOfMostRecentUpdate = Math.abs(lastTwoTimestamps[0] - lastTwoTimestamps[1])
    return this.dygraph.xAxisRange().map(extreme => extreme + deltaTimeOfMostRecentUpdate)
  }
}