
import { EMPTY, throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { AlertService } from '../core/alert/alert.service';


@Injectable({
  "providedIn": "root"
})
export class HttpHandler {

  constructor(
    private router: Router,
    private alert: AlertService,
    private dialog: MatDialog
  ) { }

  /**
   * The below function is from the angular 2 guide
   * Modified to accept error text in message property
   */
  handleError (response: any): Observable<any> {
    // TODO: In a real world app, we might use a remote logging infrastructure
    // NOTE: I accept errors as JSON with message or error property containing text
    let errMsg: string;
    if (response.error && (response.error.message || response.error.error)) {
      let err;
      try {
        err = JSON.parse(response.error.message || response.error.error);
      } catch(e) {
        err = response.error.message || response.error.error || JSON.stringify(response.error);
      }
      //errMsg = `${response.status} - ${response.statusText || ''} - ${err}`;
      errMsg = err;
    }

    if (errMsg === undefined && response.message) {
      // Happens for example during task API restart with status code 504
      if (response.status === 504) {
        console.log(response)
        errMsg = response.url + " is not reachable. If problem presists contact administrator.";
      } else {
        errMsg = response.message;
      }
    }

    if (response.status === 0) {
      return observableThrowError('Error reaching server!');
    } else {
      if (typeof(errMsg) === "string" && errMsg.indexOf("expired") > -1) {
        this.dialog.closeAll();
        // the AuthActivateGuard during swtich to / will do a logout and show error message
        this.router.navigate(['/']);
        return EMPTY;
      } else {
        return observableThrowError(errMsg);
      }
    }
  }

  handleBlobError(err: any): Observable<any> {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      //@ts-ignore
      const text = e.srcElement.result;
      this.alert.error(text.message || text);
    });
    return observableThrowError(reader.readAsText(err.error));
  }
}
