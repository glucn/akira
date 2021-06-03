import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDrawer } from '@angular/material/sidenav';
import { SidenavService } from './sidenav/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('drawer') appDrawer!: MatDrawer;

  constructor(
    public auth: AngularFireAuth,
    private sidenavService: SidenavService,
    ) { }

  ngAfterViewInit() {
    this.sidenavService.appDrawer = this.appDrawer;
  }
}
