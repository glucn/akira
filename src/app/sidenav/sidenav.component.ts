import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { SidenavItem, SidenavService } from './sidenav.service';

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  public sideNavItems$: Observable<SidenavItem[]>;

  constructor(public auth: AngularFireAuth, private sidenavService: SidenavService) {
    this.sideNavItems$ = this.sidenavService.getSideNavItems$();
  }

  ngOnInit(): void {}

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.signOut();
  }
}
