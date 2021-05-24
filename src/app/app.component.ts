import { AfterViewInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDrawer } from '@angular/material/sidenav';
import firebase from 'firebase/app';
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

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.signOut();
  }
}
