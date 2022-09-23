/**
 * If null, the directive will make the host visible
 */

import { Directive, Input, OnInit, HostBinding } from '@angular/core';

import _ from "lodash";

import { AuthenticationService } from '../../core/authentication/authentication.service';

@Directive({
  selector: '[myVisibleForPrivileges]'
})
export class VisibleForPrivilegesDirective implements OnInit {

  @Input() myVisibleForPrivileges: any;

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
    let hidden = true;
    if (this.myVisibleForPrivileges && this.myVisibleForPrivileges.length > 0) {
      _.each(this.myVisibleForPrivileges, (priv) => {
        if (this.authenticationService.authorize(priv)) {
          hidden = false;
        }
      });
    }

    this.isHidden = hidden;
  }
}
