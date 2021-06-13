import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AccountType, DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';
import { getAccountUrl } from '../shared/account-utils';
import { Account, AccountService } from '../shared/account.service';

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

  constructor(private router: Router, private accountService: AccountService) {
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

  public getSideNavItems$(): Observable<SidenavItem[]> {
    return this.getAccountNavItems$().pipe(
      distinctUntilChanged(),
      map((accountItems) => [
        {
          displayName: 'Overview',
          iconName: 'dashboard',
          route: 'overview',
        },
        {
          displayName: 'Accounts',
          iconName: 'savings',
          route: 'accounts',
          children: accountItems,
        },
        {
          displayName: 'Reports',
          iconName: 'summarize',
          route: 'reports',
        },
      ])
    );
  }

  private getAccountNavItems$(): Observable<SidenavItem[]> {
    return combineLatest([this.accountService.listAccounts(), getAccountTypes$()]).pipe(
      map(([accounts, types]: [Account[], AccountType[]]) => {
        return accounts.map((account) => {
          var accountType = types.find((type) => type.value === account.type);
          return {
            displayName: account.name,
            iconName: accountType ? accountType.icon : DEFAULT_ICON,
            route: getAccountUrl(account),
          };
        });
      })
    );
  }
}
