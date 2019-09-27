import { Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { timer, fromEvent } from 'rxjs';
import { debounceTime, buffer, map, filter} from 'rxjs/operators';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements AfterViewInit {

  private dial: string = '00:00:00';
  private running: number = 0;
  private timeoutHandler: any;
  private seconds: number = 0;
  private minutes: number = 0;
  private hours: number = 0;

  @ViewChild('startButton', {static: false}) startButton: ElementRef;

  @ViewChild('resetButton', {static: false}) resetButton: ElementRef;

  @ViewChild('waitButton', {static: false}) waitButton: ElementRef;


  private timerEventsSubscription() {
    fromEvent(this.startButton.nativeElement, 'click')
    .subscribe(() => this.start());

    fromEvent(this.resetButton.nativeElement, 'click')
    .subscribe(() => this.reset());

    fromEvent(this.waitButton.nativeElement, 'click');
    const wait$ = fromEvent(this.waitButton.nativeElement, 'click').pipe(
      debounceTime(300),
    );

    const click$ = fromEvent(this.waitButton.nativeElement, 'click').pipe(
      buffer(wait$),
      map(list => {
        return list.length;
      }),
      filter(x => x === 2),
    );

    click$.subscribe(() => {
      console.log('timer wait');
      if (this.running === 1) {
        this.running = 0;
        clearTimeout(this.timeoutHandler);
      }
    });
  }

  private start() {
    if (this.running === 0) {
      this.running = 1;
      this.myCount();
      console.log('timer start');
    } else {
      this.running = 0;
      this.timeoutHandler.unsubscribe();
      console.log('timer stoped');
    }
  }

  private reset() {
    this.running = 0;
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.dial = '00:00:00';
    console.log('timer reset');
  }

  private myCount() {
    if (this.running === 1) {
      this.timeoutHandler = timer(1000).subscribe( () => {
        if (this.seconds === 0 && this.minutes === 0 && this.hours === 0) {
            this.dial = '00:00:00';
        } else if (this.seconds < 10 && this.minutes < 10) {
          this.dial = '0' + this.hours.toString() + ':0' + this.minutes.toString() + ':0' + this.seconds.toString();
        } else if (this.minutes > 10 && this.seconds < 10) {
          this.dial = '0' + this.hours.toString() + ':' + this.minutes.toString() + ':0' + this.seconds.toString();
        } else if (this.minutes < 10) {
          this.dial = '0' + this.hours.toString() + ':0' + this.minutes.toString() + ':' + this.seconds.toString();
        } else if (this.hours < 10) {
          this.dial = '0' + this.hours.toString() + ':' + this.minutes.toString() + ':' + this.seconds.toString();
        }
        this.seconds++;
        if (this.seconds > 59) {
          this.seconds = 0;
          this.minutes++;
          if (this.minutes > 59) {
            this.minutes = 0;
            this.hours++;
          }
        }
        this.myCount();
      });
    }
  }

  ngAfterViewInit(): void {
    this.timerEventsSubscription();
  }
}
