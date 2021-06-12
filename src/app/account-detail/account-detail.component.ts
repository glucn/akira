import { DataSource } from '@angular/cdk/collections';
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Account, AccountService } from 'src/app/shared/account.service';
import { DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  private accountId$: Observable<string>;

  public account$: Observable<Account>;
  public accountIcon$: Observable<string>;

  displayedColumns: string[] = ['transactionDate', 'postingDate', 'type', 'amount', 'description', 'balance', 'action'];

  transactionDataSource = new TransactionDataSource();

  constructor(private route: ActivatedRoute, private accountService: AccountService) {
    this.accountId$ = this.route.params.pipe(map((params) => params.id));

    this.account$ = this.accountId$.pipe(
      switchMap((accountId) => this.accountService.getAccount(accountId)),
      map((account) => {
        if (!account) {
          throw 'Account does not exist'; // TODO: Show something in the UI
        }
        return account;
      })
    );

    this.accountIcon$ = combineLatest([this.account$, getAccountTypes$()]).pipe(
      map(([account, types]) => types.find((type) => type.value === account.type)?.icon || DEFAULT_ICON)
    );
  }

  ngOnInit(): void {}
}

export interface Transaction {
  transactionDate: Date;
  postingDate: Date;
  type: string;
  amount: number;
  description: string;
  balance: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionDataSource extends DataSource<Transaction> {
  constructor() {
    super();
  }

  connect(): Observable<Transaction[]> {
    var transactions: Transaction[] = [];
    for (var i = 0; i < 50; i++) {
      transactions.push({
        transactionDate: new Date(),
        postingDate: new Date(),
        type: 'TEST',
        amount: 100,
        description: 'TEST',
        balance: 100,
      });
    }

    return of(transactions);
  }

  disconnect() {}
}
