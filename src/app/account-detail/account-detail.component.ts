import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, shareReplay, skipWhile, switchMap, takeUntil } from 'rxjs/operators';
import { DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';
import { Account, AccountService } from '../shared/account.service';
import { TransactionService } from '../shared/transaction.service';
import {
  CreateUpdateTransactionDialogComponent,
  TransactionDialogResult
} from './create-update-transaction-dialog/create-update-transaction-dialog.component';
import { TransactionsDataSource } from './transactions-data-source';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  private accountId$: Observable<string>;

  public account$: Observable<Account>;
  public accountIcon$: Observable<string>;

  displayedColumns: string[] = ['transactionDate', 'postingDate', 'type', 'amount', 'description', 'balance', 'action'];

  transactionDataSource$: Observable<TransactionsDataSource>;
  transactionDataSource: TransactionsDataSource | undefined;
  hasNextPage$: Observable<boolean>;
  hasPreviousPage$: Observable<boolean>;
  nextPage: EventEmitter<{}> = new EventEmitter();
  previousPage: EventEmitter<{}> = new EventEmitter();

  private ngUnsubscribe = new Subject();

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
      }),
      skipWhile((account) => !account)
    );

    this.accountIcon$ = combineLatest([this.account$, getAccountTypes$()]).pipe(
      map(([account, types]) => types.find((type) => type.value === account.type)?.icon || DEFAULT_ICON)
    );

    this.transactionDataSource$ = this.accountId$.pipe(
      map(
        (accountId) => new TransactionsDataSource(this.transactionService, accountId, this.previousPage, this.nextPage)
      ),
      shareReplay(1)
    );

    this.hasNextPage$ = this.transactionDataSource$.pipe(switchMap((dataSource) => dataSource.hasNextPage$()));

    this.hasPreviousPage$ = this.transactionDataSource$.pipe(switchMap((dataSource) => dataSource.hasPreviousPage$()));
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  createTransaction(): void {
    const now = new Date();

    const dialogOutput$: Observable<TransactionDialogResult> = this.account$.pipe(
      map((account) =>
        this.dialog.open(CreateUpdateTransactionDialogComponent, {
          width: '400px',
          data: {
            transaction: {
              transactionDate: now,
              postingDate: now,
              currency: account.currency,
            },
            isCreate: true,
          },
        })
      ),
      switchMap((dialog) => dialog.afterClosed()),
      skipWhile((result: TransactionDialogResult) => !result || !result.transaction)
    );

    combineLatest([this.account$, dialogOutput$])
      .pipe(
        switchMap(([account, result]) =>
          this.transactionService.createTransaction({ ...result.transaction, accountId: account.accountId })
        ),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (next) => console.log('transaction created', next),
        (err) => console.log(err)
      );
  }

  displayPreviousPage(): void {
    this.previousPage.emit({});
  }

  displayNextPage(): void {
    this.nextPage.emit({});
  }
}
