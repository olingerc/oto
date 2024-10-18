import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdminHttpService } from './admin-http.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, FlexModule, RouterLinkActive, RouterLink, RouterOutlet],
    providers: [AdminHttpService]
})
export class AdminComponent { }
