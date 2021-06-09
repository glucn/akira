import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { SidenavService } from './sidenav/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('drawer') appDrawer!: MatDrawer;

  constructor(private sidenavService: SidenavService) {}

  ngAfterViewInit() {
    this.sidenavService.appDrawer = this.appDrawer;
  }
}
