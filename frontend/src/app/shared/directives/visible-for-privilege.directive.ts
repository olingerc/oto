/**
 * If null, the directive will make the host visible
 */

import { Directive, Input, OnInit, HostBinding } from '@angular/core';

import { AuthenticationService } from '../../core/authentication/authentication.service';

@Directive({
    selector: '[myVisibleForPrivilege]',
    standalone: true
})
export class VisibleForPrivilegeDirective implements OnInit {

  @Input() myVisibleForPrivilege: any;

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
    if (this.myVisibleForPrivilege && !this.authenticationService.authorize(this.myVisibleForPrivilege)) {
      this.isHidden = true;
    } else {
      this.isHidden = false;
    }
  }
}
