/**
 * If null, the directive will make the host visible
 */

import { Directive, Input, OnInit, HostBinding } from '@angular/core';

import _ from "lodash";

import { AuthenticationService } from '../../core/authentication/authentication.service';

@Directive({
  selector: '[myNotVisibleForPrivileges]'
})
export class NotVisibleForPrivilegesDirective implements OnInit {

  @Input() myNotVisibleForPrivileges: any;

  @HostBinding('hidden') isHidden;

  constructor(private authenticationService: AuthenticationService) {
    // subscribe to authentication login changes to reevaluate visibility
    this.authenticationService.getCurrentUserChange().subscribe(
      () => {
        this.determineIfVisible();
      });
  }

  ngOnInit() {
    this.determineIfVisible();
  }

  determineIfVisible() {
    let hidden = false;
    if (this.myNotVisibleForPrivileges && this.myNotVisibleForPrivileges.length > 0) {
      _.each(this.myNotVisibleForPrivileges, (priv) => {
        if (this.authenticationService.authorize(priv)) {
          hidden = true;
        }
      });
    }

    this.isHidden = hidden;
  }
}
