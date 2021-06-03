import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Account, AccountService } from '../shared/account.service';
import { AccountDialogResult, CreateAccountDialogComponent } from './create-account-dialog/create-account-dialog.component';

const ACCOUNTS_MOCK: Account[] = [
  {userId: 'u01', accountId: '01', name: 'Cash (CAD)', balance: 100, currency: 'CAD', type: 'Cash'},
  {userId: 'u01', accountId: '02', name: 'Cash (CNY)', balance: 200, currency: 'CNY', type: 'Cash'},
  {userId: 'u01', accountId: '03', name: 'BMO - Chequing Account', balance: 100, currency: 'CAD', type: 'Bank'},
  {userId: 'u01', accountId: '04', name: 'BMO - Saving Account', balance: 50, currency: 'CAD', type: 'Bank'},
  {userId: 'u01', accountId: '05', name: 'BMO - Credit Card', balance: -100, currency: 'CAD', type: 'CreditCard'},
];

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'balance',  'currency', 'type', 'action'];
  dataSource = new MockDataSource();

  constructor(private accountService: AccountService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.accountService.listAccounts().subscribe(res => console.log(res));
  }

  createAccount(): void {
    const dialogRef = this.dialog.open(CreateAccountDialogComponent, {
    width: '400px',
    data: {
      account: {},
    },
  });
  dialogRef
    .afterClosed()
    .pipe(
      tap(console.log),
      switchMap((result: AccountDialogResult) => this.accountService.createAccounts(result.account))
    )
    .subscribe(() => console.log('account created'));
  }
}

class MockDataSource extends DataSource<Account> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<Account[]>(ACCOUNTS_MOCK);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Account[]> {
    return this.data;
  }

  disconnect() {}
}
