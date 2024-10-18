/**
 * Graciously copied from pivnet.net
 * put focus on element as soon as it becomes visible.
 * NOTE: use [config]="{focus: false}" for modals, since they steal focus
 */
import { Directive, AfterViewInit, ElementRef, DoCheck } from '@angular/core';

@Directive({
    selector: '[myAutofocus]',
    standalone: true
})
export class AutofocusDirective implements AfterViewInit, DoCheck {
  private lastVisible = false;
  private initialised = false;
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.initialised = true;
    this.ngDoCheck();
  }

  ngDoCheck() {
    if (!this.initialised) {
      return;
    }
    const visible = !!this.el.nativeElement.offsetParent;
    if (visible && !this.lastVisible) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 1);
    }
    this.lastVisible = visible;
  }
}
