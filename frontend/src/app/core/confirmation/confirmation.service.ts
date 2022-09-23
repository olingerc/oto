import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { ConfirmationConfig } from './confirmation-config.model';

@Injectable({
  "providedIn": "root"
})
export class ConfirmationService {

  private confirmationAsked$: Subject<ConfirmationConfig> = new Subject();

  confirmationAsked(): Observable<any> {
    return this.confirmationAsked$.asObservable();
  }

  confirm(config: ConfirmationConfig) {
    this.confirmationAsked$.next(config);
  }

}
