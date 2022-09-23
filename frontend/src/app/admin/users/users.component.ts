import { Component, ViewEncapsulation } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';

import { User } from '../../core/user.model';
import { Group } from '../../core/group.model';
import { Lab } from '../../core/lab.model';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';

import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent {
  // User list
  public loading = false;
  public tableLoading = false;
  public users: User[] = [];
  public groups: Group[] = [];
  public groupTableLoading = false;
  public labs: Lab[] = [];
  public labTableLoading = false;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadAllUsers();
    this.loadAllGroups();
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

  private loadAllGroups() {
    this.userService.getGroups()
      .subscribe(
        groups => {
          this.groups = groups;
        },
        error => {
          this.alertService.error(error);
          this.groups = [];
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
      data: { action: 'update', user: user, groups: this.groups}
    });

    dialogRef.beforeClosed().subscribe(() => {
      this.loadAllUsers();
    });
  }

}
