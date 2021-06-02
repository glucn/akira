import { ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface SidenavItem {
  displayName: string;
  disabled?: boolean;
  iconName: string;
  route?: string;
  children?: SidenavItem[];
}

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  public appDrawer: MatDrawer | undefined;
  public currentUrl = new BehaviorSubject<string>('');

  navItems: SidenavItem[] = [
    {
      displayName: 'Overview',
      iconName: 'dashboard',
      route: 'overview',
    },
    {
      displayName: 'Accounts',
      iconName: 'savings',
      route: 'accounts',
      children: [
        {
          displayName: 'Cash (CAD)',
          iconName: 'payments',
        },
        {
          displayName: 'Cash (CNY)',
          iconName: 'payments',
        },
        {
          displayName: 'BMO - Chequing Account',
          iconName: 'credit_card',
        },
        {
          displayName: 'BMO - Saving Account',
          iconName: 'credit_card',
        },
        {
          displayName: 'BMO - Credit Card',
          iconName: 'credit_card',
        },
      ],
    },
    {
      displayName: 'Reports',
      iconName: 'summarize',
      route: 'reports'
    },
  ];

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.next(event.urlAfterRedirects);
      }
    });
  }

  public closeNav() {
    this.appDrawer?.close();
  }

  public openNav() {
    this.appDrawer?.open();
  }
}
