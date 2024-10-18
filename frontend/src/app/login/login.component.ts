import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationService } from '../core/authentication/authentication.service';
import { AlertService } from '../core/alert/alert.service';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'my-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [MatCardModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule, MatButtonModule]
})
export class LoginComponent implements AfterViewInit {

  public loading = false;

  // formControl necessary to trigger mat-error
  public usernameFormControl = new FormControl('', [

  ]);
  public passwordFormControl = new FormControl('', [
    
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
          if (error.indexOf && error.indexOf('incorrect') > -1) {
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
