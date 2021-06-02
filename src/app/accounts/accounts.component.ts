import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Account } from '../shared/account.service';

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

  constructor() { }

  ngOnInit(): void {
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
