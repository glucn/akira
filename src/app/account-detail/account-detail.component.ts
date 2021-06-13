import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';
import { Account, AccountService } from '../shared/account.service';
import { Transaction } from '../shared/transaction.service';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  // The MatPaginator inside of *ngIf cannot be picked up until DOM is rendered, this is the workaround
  // https://github.com/angular/components/issues/10205
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.transactionDataSource.paginator = paginator;
  }

  private accountId$: Observable<string>;

  public account$: Observable<Account>;
  public accountIcon$: Observable<string>;

  displayedColumns: string[] = ['transactionDate', 'postingDate', 'type', 'amount', 'description', 'balance', 'action'];

  transactionDataSource = new MatTableDataSource<Transaction>(getData());

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

function getData(): Transaction[] {
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
  return transactions;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionDataSource extends MatTableDataSource<Transaction> {
  constructor() {
    super();
  }

  connect(): BehaviorSubject<Transaction[]> {
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

    return new BehaviorSubject(transactions);
  }

  disconnect() {}
}
