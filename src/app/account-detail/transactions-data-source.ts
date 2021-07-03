import { DataSource } from '@angular/cdk/collections';
import { EventEmitter } from '@angular/core';
import firebase from 'firebase/app';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Transaction, TransactionService } from '../shared/transaction.service';

export class TransactionsDataSource extends DataSource<Transaction> {
  private PAGE_SIZE = 5;

  private currentPageIndex: number = 0;
  private pageStartAtMarkers: firebase.firestore.DocumentSnapshot<Transaction>[] = [];
  private hasNextPage$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private hasPreviousPage$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private currentPage$$: BehaviorSubject<firebase.firestore.DocumentSnapshot<Transaction> | undefined> =
    new BehaviorSubject<firebase.firestore.DocumentSnapshot<Transaction> | undefined>(undefined);

  private ngUnsubscribe = new Subject();

  constructor(
    private transactionService: TransactionService,
    private accountId: string,
    private firstPageEvent: EventEmitter<{}>,
    private previousPageEvent: EventEmitter<{}>,
    private nextPageEvent: EventEmitter<{}>
  ) {
    super();

    this.firstPageEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.listFirstPage());
    this.previousPageEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.listPreviousPage());
    this.nextPageEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.listNextPage());
  }

  connect(): Observable<readonly Transaction[]> {
    return this.currentPage$$.pipe(
      switchMap((currentPage) =>
        this.transactionService.listTransactionsByAccount(this.accountId, this.PAGE_SIZE, currentPage)
      ),
      tap((listTransactionResponse) => {
        this.hasNextPage$$.next(listTransactionResponse.hasMore);
        if (listTransactionResponse.hasMore) {
          this.pageStartAtMarkers.push(listTransactionResponse.nextStartAt!);
        }
      }),
      map((listTransactionResponse) =>
        listTransactionResponse.transactions.map((transaction: any) => ({
          transactionId: transaction.transactionId,
          accountId: transaction.accountId,
          transactionDate: transaction.transactionDate.toDate(),
          postingDate: transaction.postingDate.toDate(),
          type: transaction.type,
          debit: transaction.debit,
          credit: transaction.credit,
          description: transaction.description,
          currency: transaction.currency,
        }))
      )
    );
  }

  disconnect() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  hasPreviousPage$(): Observable<boolean> {
    return this.hasPreviousPage$$.asObservable();
  }

  hasNextPage$(): Observable<boolean> {
    return this.hasNextPage$$.asObservable();
  }

  listFirstPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex = 0;
      this.pageStartAtMarkers = [];
      this.currentPage$$.next(undefined);
      this.hasPreviousPage$$.next(false);
    }
  }

  listPreviousPage() {
    this.pageStartAtMarkers.pop();

    if (this.currentPageIndex === 1) {
      this.currentPageIndex--;
      this.pageStartAtMarkers = [];
      this.currentPage$$.next(undefined);
      this.hasPreviousPage$$.next(false);
    } else if (this.currentPageIndex > 1) {
      this.currentPageIndex--;
      this.pageStartAtMarkers = this.pageStartAtMarkers.slice(0, this.currentPageIndex);
      this.currentPage$$.next(this.pageStartAtMarkers[this.currentPageIndex - 1]);
      this.hasPreviousPage$$.next(true);
    }
  }

  listNextPage() {
    if (this.pageStartAtMarkers.length > 0) {
      this.currentPageIndex++;
      this.currentPage$$.next(this.pageStartAtMarkers[this.pageStartAtMarkers.length - 1]);
      this.hasPreviousPage$$.next(true);
    }
  }
}
