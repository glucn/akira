import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, skipWhile, switchMap } from 'rxjs/operators';
import { DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';
import { Account, AccountService } from '../shared/account.service';
import { Transaction, TransactionService } from '../shared/transaction.service';
import {
  CreateUpdateTransactionDialogComponent,
  TransactionDialogResult,
} from './create-update-transaction-dialog/create-update-transaction-dialog.component';

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

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private dialog: MatDialog
  ) {
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

  createTransaction(): void {
    const now = new Date();
    const dialogRef = this.dialog.open(CreateUpdateTransactionDialogComponent, {
      width: '400px',
      data: {
        transaction: {
          transactionDate: now,
          postingDate: now,
        },
        isCreate: true,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: TransactionDialogResult) => !result || !result.transaction),
        switchMap((result: TransactionDialogResult) => this.transactionService.createTransaction(result.transaction))
      )
      .subscribe(
        (next) => console.log('transaction created', next),
        (err) => console.log(err)
      );
  }
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
