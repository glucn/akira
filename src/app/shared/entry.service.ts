import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { map, shareReplay, skipWhile, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Entry {
  entryId?: string;
  userId?: string;
  accountId?: string;
  connectedTransactionId?: string; // for double entry accounting
  transactionDate: Date; // denormalized - should be the same with the date in the transaction
  postingDate: Date;
  category: string;
  amount: number;
  description: string;
  currency?: string;
  balance?: number;
  created?: Date;
  updated?: Date;
}

export interface ListEntriesResponse {
  entries: Entry[];
  hasMore: boolean;
  nextStartAt: firebase.firestore.DocumentSnapshot<Entry> | null;
}

@Injectable({
  providedIn: 'root',
})
export class EntryService {
  entryCollectionRef$: Observable<AngularFirestoreCollection<Entry>>;

  constructor(private readonly afs: AngularFirestore, private readonly auth: AngularFireAuth) {
    this.entryCollectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user): AngularFirestoreCollection<Entry> => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        return this.afs.collection('entry', (ref) => ref.where('userId', '==', user.uid));
      }),
      shareReplay(1)
    );
  }

  public createEntry(entry: Entry): Observable<Entry | undefined> {
    var entryId = entry.entryId || uuidv4();

    return combineLatest([this.entryCollectionRef$, this.auth.user]).pipe(
      switchMap(([ref, user]) => {
        const now = new Date();
        return ref.doc(entryId).set({
          // TODO: add other fields in here
          accountId: entry.accountId,
          userId: user!.uid,
          connectedTransactionId: entry.connectedTransactionId || '',
          transactionDate: entry.transactionDate,
          postingDate: entry.postingDate || entry.transactionDate,
          category: entry.category || '',
          amount: entry.amount || 0,
          description: entry.description || '',
          currency: entry.currency || '',
          created: now,
          updated: now,
        });
      }),
      switchMap(() => this.getEntry(entryId))
    );
  }

  public createTransactions(entries: Entry[]): Observable<void> {
    return combineLatest([this.entryCollectionRef$, this.auth.user]).pipe(
      switchMap(([ref, user]) => {
        const now = new Date();
        const writeBatch: firebase.firestore.WriteBatch = firebase.firestore().batch();

        entries.forEach((entry) => {
          const entryId = entry.entryId || uuidv4();
          // TODO: detect existing entry with the same ID and avoid overwriting
          writeBatch.set(ref.doc(entryId).ref, {
            // TODO: add other fields in here
            accountId: entry.accountId,
            userId: user!.uid,
            connectedTransactionId: entry.connectedTransactionId || '',
            transactionDate: entry.transactionDate,
            postingDate: entry.postingDate || entry.transactionDate,
            category: entry.category || '',
            amount: entry.amount || 0,
            description: entry.description || '',
            currency: entry.currency || '',
            created: now,
            updated: now,
          });
        });
        return writeBatch.commit();
      })
    );
  }

  private getEntrySnapshot(entryId: string): Observable<firebase.firestore.DocumentSnapshot<Entry>> {
    return this.entryCollectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Entry>) => collection.doc<Entry>(entryId).get())
    );
  }

  public getEntry(entryId: string): Observable<Entry | undefined> {
    return this.entryCollectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Entry>) => collection.doc<Entry>(entryId).get()),
      map((snapshot) => (snapshot.exists ? snapshot.data() : undefined)),
      map((entry) => (entry ? { ...entry, entryId: entryId } : undefined))
    );
  }

  public listEntriesByAccount(
    accountId: string,
    pageSize: number,
    nextStartAt: firebase.firestore.DocumentSnapshot<Entry> | undefined
  ): Observable<ListEntriesResponse> {
    const entries$ = this.entryCollectionRef$.pipe(
      map(
        (ref): AngularFirestoreCollection<Entry> =>
          this.afs.collection(ref.ref, (r) => {
            const q = r
              .where('accountId', '==', accountId)
              .orderBy('postingDate', 'desc')
              .limit(pageSize + 1); // query one more record to determine if there's another page
            return nextStartAt ? q.startAt(nextStartAt) : q;
          })
      ),
      switchMap((ref) => ref.valueChanges({ idField: 'entryId' })),
      shareReplay(1)
    );

    const nextStartAt$: Observable<firebase.firestore.DocumentSnapshot<Entry> | null> = entries$.pipe(
      switchMap((entries) => (entries.length > pageSize ? this.getEntrySnapshot(entries[pageSize].entryId) : of(null)))
    );

    return zip(entries$, nextStartAt$).pipe(
      map(([entries, next]) => ({
        entries: entries.slice(0, pageSize),
        hasMore: entries.length > pageSize,
        nextStartAt: next,
      }))
    );
  }

  public updateEntry(entry: Entry): Observable<Entry | undefined> {
    var now = new Date();
    return this.entryCollectionRef$.pipe(
      switchMap((ref) =>
        ref.doc(entry.entryId).update({
          // TODO: add other fields in here
          accountId: entry.accountId,
          transactionDate: entry.transactionDate,
          postingDate: entry.postingDate || entry.transactionDate,
          category: entry.category || '',
          amount: entry.amount || 0,
          description: entry.description || '',
          currency: entry.currency || '',
          updated: now,
        })
      ),
      switchMap(() => this.getEntry(entry.entryId!))
    );
  }

  public deleteTransaction(entryId: string): Observable<void> {
    return this.entryCollectionRef$.pipe(switchMap((collection) => collection.doc<Entry>(entryId).delete()));
  }
}
