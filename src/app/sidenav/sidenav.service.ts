import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AccountType, DEFAULT_ICON, getAccountTypes$ } from 'src/app/shared/account-type';
import { Account, AccountService } from 'src/app/shared/account.service';

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
      route: 'reports',
    },
  ];

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
          };
        });
      })
    );
  }
}
