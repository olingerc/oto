import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';

import { User } from '../../core/user.model';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';

import { UserDialogComponent } from './user-dialog.component';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    standalone: true,
    imports: [FlexModule, MatCardModule, TableModule, PrimeTemplate, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, DatePipe]
})
export class UsersComponent {
  // User list
  public loading = false;
  public tableLoading = false;
  public users: User[] = [];
  public labTableLoading = false;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadAllUsers();
  }

  private loadAllUsers() {
    this.tableLoading = true;
    this.userService.getAll()
      .subscribe(
        users => {
          this.users = users;
          this.tableLoading = false;
        },
        error => {
          this.alertService.error('Check console for detailed error message', 'Failed reaching server');
          console.error(error);
          this.tableLoading = false;
        }
      );
  }

  startUserAdd() {
    let dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      autoFocus: false,
      data: { action: 'add' }
    });

    dialogRef.beforeClosed().subscribe(() => {
      this.loadAllUsers();
    });
  }

  startUserUpdate(user) {
    let dialogRef = this.dialog.open(UserDialogComponent, {
      width: '1280px',
      autoFocus: false,
      data: { action: 'update', user: user}
    });

    dialogRef.beforeClosed().subscribe(() => {
      this.loadAllUsers();
    });
  }

}
