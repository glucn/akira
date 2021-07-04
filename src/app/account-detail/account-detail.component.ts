import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, shareReplay, skipWhile, switchMap, take, takeUntil } from 'rxjs/operators';
import { DEFAULT_ICON, getAccountTypes$ } from '../shared/account-type';
import { Account, AccountService } from '../shared/account.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { Entry, EntryService } from '../shared/entry.service';
import {
  CreateUpdateTransactionDialogComponent,
  TransactionDialogResult,
} from './create-update-transaction-dialog/create-update-transaction-dialog.component';
import { ImportTransactionsDialogComponent } from './import-transactions-dialog/import-transactions-dialog.component';
import { EntriesDataSource } from './entries-data-source';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  private accountId$: Observable<string>;

  public account$: Observable<Account>;
  public accountIcon$: Observable<string>;

  displayedColumns: string[] = [
    'transactionDate',
    'postingDate',
    'category',
    'debit',
    'credit',
    'description',
    'balance',
    'action',
  ];

  transactionDataSource$: Observable<EntriesDataSource>;
  transactionDataSource: EntriesDataSource | undefined;
  hasNextPage$: Observable<boolean>;
  hasPreviousPage$: Observable<boolean>;
  nextPage: EventEmitter<{}> = new EventEmitter();
  previousPage: EventEmitter<{}> = new EventEmitter();
  firstPage: EventEmitter<{}> = new EventEmitter();

  private ngUnsubscribe = new Subject();

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private entryService: EntryService,
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
        (accountId) =>
          new EntriesDataSource(
            this.entryService,
            accountId,
            this.firstPage,
            this.previousPage,
            this.nextPage
          )
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
          this.entryService.createEntry({ ...result.transaction, accountId: account.accountId })
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

  displayFirstPage(): void {
    this.firstPage.emit({});
  }

  updateTransaction(transaction: Entry): void {
    const dialogRef = this.dialog.open(CreateUpdateTransactionDialogComponent, {
      width: '400px',
      data: {
        transaction: { ...transaction },
        isCreate: false,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: TransactionDialogResult) => !result || !result.transaction),
        switchMap((result: TransactionDialogResult) => this.entryService.updateEntry(result.transaction)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        // TODO: remove debug subscription
        (next) => console.log('transaction updated', next),
        (err) => console.log(err)
      );
  }

  // TODO: there could be a bug when deleting cause the total page number reduces
  deleteTransaction(transaction: Entry): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm deleting transaction',
        body: `Are you sure you want to delete the transaction with amount
               ${this.formatTransactionCurrency(transaction)} happened at
               ${this.formatTransactionDate(transaction)}?
               `,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: TransactionDialogResult) => !result),
        switchMap(() => this.entryService.deleteTransaction(transaction.entryId!)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        // TODO: remove debug subscription
        () => console.log('transaction deleted'),
        (err) => console.log(err)
      );
  }

  private formatTransactionCurrency(transaction: Entry): string {
    const option = { style: 'currency', currency: transaction.currency, currencyDisplay: 'narrowSymbol' };

    return transaction.debit
      ? new Intl.NumberFormat(undefined, option).format(-1 * transaction.debit || 0)
      : new Intl.NumberFormat(undefined, option).format(transaction.credit || 0);
  }

  private formatTransactionDate(transaction: Entry): string {
    return new Intl.DateTimeFormat().format(transaction.transactionDate);
  }

  importTransactions(): void {
    this.account$
      .pipe(
        switchMap((account) =>
          this.dialog
            .open(ImportTransactionsDialogComponent, {
              width: '80vw',
              data: {
                account: account,
              },
            })
            .afterClosed()
        ),
        skipWhile((result) => !result),
        switchMap((result) => this.entryService.createTransactions(result.transactions)),
        take(1)
      )
      .subscribe(
        // TODO: remove debug subscription
        () => console.log('transactions imported'),
        (err) => console.log(err)
      );
  }
}
