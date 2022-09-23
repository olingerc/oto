import { Component, ViewEncapsulation } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';

import { User } from '../../core/user.model';
import { Group } from '../../core/group.model';
import { Lab } from '../../core/lab.model';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';

import { GroupDialogComponent } from './group-dialog.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsComponent {
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
    this.loadAllGroups();
    this.loadAllLabs();
  }

  private loadAllGroups() {
    this.groupTableLoading = true;
    this.userService.getGroups()
      .subscribe(
        groups => {
          this.groups = groups;
          this.groupTableLoading = false;
        },
        error => {
          this.alertService.error('Check console for detailed error message', 'Failed reaching server');
          console.error(error);
          this.groupTableLoading = false;
        }
      );
  }

  private loadAllLabs() {
    this.groupTableLoading = true;
    this.userService.getLabs()
      .subscribe(
        labs => {
          this.labs = labs;
          this.groupTableLoading = false;
        },
        error => {
          this.alertService.error('Check console for detailed error message', 'Failed reaching server');
          console.error(error);
          this.groupTableLoading = false;
        }
      );
  }

  startGroupAdd() {
    let dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '500px',
      data: { action: 'add', labs: this.labs }
    });

    dialogRef.beforeClosed().subscribe(() => {
      this.loadAllGroups();
    });
  }

  startGroupUpdate(group) {
    let dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '500px',
      data: { action: 'update', group: group, labs: this.labs}
    });

    dialogRef.beforeClosed().subscribe(() => {
      this.loadAllGroups();
    });
  }

  deleteGroup(groupId) {
    this.loading = true;
    this.userService.deleteGroup(groupId)
      .subscribe(
        () => {
          this.loadAllGroups();
          this.loading = false;
        },
        error => {
          this.alertService.error(error, 'Error deleting group');
          this.loading = false;
        });
  }

}
