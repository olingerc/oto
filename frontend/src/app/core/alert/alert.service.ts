import { Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';

@Injectable({
  "providedIn": "root"
})
export class AlertService {

  private life = 3000;
  private defaultOptions:any = {
    timeOut: 4000,
    animate: "fromRight"
  }

  private detectJson(message: any) {
    // if object try to stringify it
    if (typeof message === "object") {
      let err;
      try {
        err = JSON.stringify(message);
      } catch(e) {
        err = message;
      }
      return err;
    } else {
      return message;
    }
  }

  constructor(private messageService: MessageService) {}

  /**
  * If user gives id, we turn off auto remove for non error messages
  */
  info(message: string, summary = 'Info', key = null) {
    message = this.detectJson(message);
    this.messageService.add({severity:'info', summary, detail: message});
  }

  warn(message: string, summary = 'Warning', key = null) {
    message = this.detectJson(message);
    this.messageService.add({severity:'warn', summary, detail:message});
    //this.notif.warn(summary, message, overrides);
  }

  success(message: string, summary = 'Success', key = null) {
    message = this.detectJson(message);
    this.messageService.add({severity:'success', summary, detail:message});
    //this.notif.success(summary, message, overrides);
  }

  error(message: string, summary = 'Error', key = null) {
    message = this.detectJson(message);
    this.messageService.add({severity:'error', summary, detail:message, sticky: true});
    //this.notif.error(summary, message, overrides);
  }

  remove(key) {
    this.messageService.clear(key);
  }
}
