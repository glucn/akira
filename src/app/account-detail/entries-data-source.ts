import { DataSource } from '@angular/cdk/collections';
import { EventEmitter } from '@angular/core';
import firebase from 'firebase/app';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Entry, EntryService } from '../shared/entry.service';

export class EntriesDataSource extends DataSource<Entry> {
  private PAGE_SIZE = 10;

  private currentPageIndex: number = 0;
  private pageStartAtMarkers: firebase.firestore.DocumentSnapshot<Entry>[] = [];
  private hasNextPage$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private hasPreviousPage$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private currentPage$$: BehaviorSubject<firebase.firestore.DocumentSnapshot<Entry> | undefined> =
    new BehaviorSubject<firebase.firestore.DocumentSnapshot<Entry> | undefined>(undefined);

  private ngUnsubscribe = new Subject();

  constructor(
    private entryService: EntryService,
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

  connect(): Observable<readonly Entry[]> {
    return this.currentPage$$.pipe(
      switchMap((currentPage) =>
        this.entryService.listEntriesByAccount(this.accountId, this.PAGE_SIZE, currentPage)
      ),
      tap((listEntriesResponse) => {
        this.hasNextPage$$.next(listEntriesResponse.hasMore);
        if (listEntriesResponse.hasMore) {
          this.pageStartAtMarkers.push(listEntriesResponse.nextStartAt!);
        }
      }),
      map((listEntriesResponse) =>
        listEntriesResponse.entries.map((entry: any) => ({
          entryId: entry.entryId,
          accountId: entry.accountId,
          connectedTransactionId: entry.connectedTransactionId,
          transactionDate: entry.transactionDate.toDate(),
          postingDate: entry.postingDate.toDate(),
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          currency: entry.currency,
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
