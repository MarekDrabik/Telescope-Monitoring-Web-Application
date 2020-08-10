import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { bufferTime, distinctUntilChanged, map } from 'rxjs/operators';

@Directive({
  selector: '[appFadeVerticalSelectors]'
})
export class FadeVerticalSelectorsDirective implements OnInit, OnDestroy {
//provides smart fade out behaviour of vertical range selectors (zoomed graph):

  @Input('appFadeVerticalSelectors') importedElements;
  @Input() topSide;
  @Input() bottomSide;
  @Input('zoomedVertically') chartIsZoomedVertically;
  @Output() showVerticalSelectors = new EventEmitter();

  coreObservable: Observable<string>;
  coreSubscription: Subscription;

  constructor(private ren: Renderer2) { }

  ngOnInit() {
    this.coreObservable = this._createCoreObservable()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartIsZoomedVertically && !changes.chartIsZoomedVertically.firstChange) {
      if (changes.chartIsZoomedVertically.currentValue === true) {
        this._observeAndAct()
      } else {
        if (this.coreSubscription && this.coreSubscription.closed) {
          console.error('coreSubscription shouldnt be closed!')
        }
        this.coreSubscription.unsubscribe()
      }
    }
  }

  private _observeAndAct() {
    //show selectors if any of the three events happens
    let state = {
      mouseMoving: false,
      mouseOverChart: false,
      mouseOverTop: false,
      mouseOverBottom: false,
      topSelectorFocused: false,
      bottomSelectorFocused: false
    };
    let currentBlurTimeout;

    if (this.coreSubscription && !this.coreSubscription.closed) {
      console.error('coreSubscription shouldnt be subscribed!')
    }
    this.coreSubscription = this.coreObservable.subscribe(event => {
      if (event === 'mouseStartedMoving') { state.mouseMoving = true }
      if (event === 'mouseStoppedMoving') { state.mouseMoving = false }
      if (event === 'mouseOverChart') { state.mouseOverChart = true }
      if (event === 'mouseOutChart') { state.mouseOverChart = false }
      if (event === 'mouseOverTop') { state.mouseOverTop = true }
      if (event === 'mouseOutTop') { state.mouseOverTop = false }
      if (event === 'mouseOverBottom') { state.mouseOverBottom = true }
      if (event === 'mouseOutBottom') { state.mouseOverBottom = false }
      if (event === 'topSelectorFocused') { state.topSelectorFocused = true }
      if (event === 'topSelectorBlured') { state.topSelectorFocused = false }
      if (event === 'bottomSelectorFocused') { state.bottomSelectorFocused = true }
      if (event === 'bottomSelectorBlured') { state.bottomSelectorFocused = false }

      if (Object.values(state).some(x => x)) { //if any of the states is true show selectors
        if (currentBlurTimeout) { //clearing pending blur if any
          clearTimeout(currentBlurTimeout)
          currentBlurTimeout = null;
        };
        this.showVerticalSelectors.emit('show')
      } else { // one of the blur events happend
        currentBlurTimeout = setTimeout(() => { // blur only after some time and doublecheck before blurring
          if (!Object.values(state).some(x => x)) {
            this.showVerticalSelectors.emit('hide')
          }
        }, 500)
      }
    })
  }

  private _createCoreObservable(): Observable<string> {
    let mousemoving = fromEvent(this.importedElements.chart, 'mousemove')
      .pipe(map(scrollEvent => 0)) //to not propagate whole event object
      .pipe(bufferTime(100)) //emits arrays of gathered values during each x milliseconds
      //bufferTime emits all the time, not just on mousemove event !!
      .pipe(map(val => { // simplify to movement / no movement emits
        if (val.length === 0) {
          return 0;
        } else {
          return 1;
        }
      }))
      .pipe(distinctUntilChanged()) //this emits only when 0 changes to 1 or 1 changes to 0
      .pipe(map(val => {
        if (val === 0) { return 'mouseStoppedMoving' }
        else { return 'mouseStartedMoving' }
      }))

    let mouseOverChart = fromEvent(this.importedElements.chart, 'mouseover')
      .pipe(map(event => 'mouseOverChart'))
    let mouseOutChart = fromEvent(this.importedElements.chart, 'mouseout')
      .pipe(map(event => 'mouseOutChart'))

    let mouseOverTopSide = fromEvent(this.importedElements.selectors[0], 'mouseover')
      .pipe(map(event => 'mouseOverTop'))
    let mouseOutTopSide = fromEvent(this.importedElements.selectors[0], 'mouseout')
      .pipe(map(event => 'mouseOutTop'))

    let mouseOverBottomSide = fromEvent(this.importedElements.selectors[1], 'mouseover')
      .pipe(map(event => 'mouseOverBottom'))
    let mouseOutBottomSide = fromEvent(this.importedElements.selectors[1], 'mouseout')
      .pipe(map(event => 'mouseOutBottom'))

    let topSelectorFocused = fromEvent(this.importedElements.inputs[0], 'focus')
      .pipe(map(event => 'topSelectorFocused'))
    let topSelectorBlured = fromEvent(this.importedElements.inputs[0], 'blur')
      .pipe(map(event => 'topSelectorBlured'))

    let bottomSelectorFocused = fromEvent(this.importedElements.inputs[1], 'focus')
      .pipe(map(event => 'bottomSelectorFocused'))
    let bottomSelectorBlured = fromEvent(this.importedElements.inputs[1], 'blur')
      .pipe(map(event => 'bottomSelectorBlured'))

    return merge( //observable that emits whenever any of its inner observables emits
      mousemoving,
      // mouseOverChart,
      // mouseOutChart, 
      mouseOverTopSide,
      mouseOutTopSide,
      mouseOverBottomSide,
      mouseOutBottomSide,
      topSelectorFocused,
      topSelectorBlured,
      bottomSelectorFocused,
      bottomSelectorBlured
    )
  }

  ngOnDestroy(): void {
    if (this.coreSubscription) this.coreSubscription.unsubscribe()
  }
}
