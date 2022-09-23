import { Component, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

import { AuthenticationService } from '../core/authentication/authentication.service';
import { AlertService } from '../core/alert/alert.service';

@Component({
  selector: 'my-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements AfterViewInit {

  public loading = false;

  // formControl necessary to trigger mat-error
  public usernameFormControl = new FormControl('', [

  ]);
  public passwordFormControl = new FormControl('', [
    Validators.required
  ]);

  @ViewChild('usernameElement', { static: true } as any) public usernameElement: any;
  @ViewChild('passwordElement', { static: true } as any) public passwordElement: any;

  constructor(
    private router: Router,
    public authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngAfterViewInit() {
    // Give the user time to actually see the focussing
    setTimeout(
      () => {this.usernameElement.nativeElement.focus();},
      150
    );
  }

  login() {
    this.loading = true;
    this.authenticationService.login(
      this.usernameFormControl.value, this.passwordFormControl.value
    )
      .subscribe(
        data => {
          this.router.navigate(['/home']);
          this.loading = false;
        },
        error => {
          if (error && error.endsWith('incorrect')) {
            this.passwordFormControl.setValue('');
            this.passwordElement.nativeElement.focus();
            this.usernameFormControl.setErrors({invalid: true});
            this.passwordFormControl.setErrors({invalid: true});
          } else {
            this.alertService.error(error, 'Error during login');
          }
          this.loading = false;
        });
  }
}
