import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { map, shareReplay, skipWhile, switchMap, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  userId?: string;
  accountId?: string;
  transactionId?: string;
  connectedTransaction?: {
    accountId?: string;
    transactionId?: string;
  };
  transactionDate: Date;
  postingDate: Date;
  type: string;
  amount: number;
  description: string;
  currency?: string;
  balance?: number;
  created?: Date;
  updated?: Date;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
  hasMore: boolean;
  nextStartAt: firebase.firestore.DocumentSnapshot<Transaction> | null;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  transactionCollectionRef$: Observable<AngularFirestoreCollection<Transaction>>;

  constructor(private readonly afs: AngularFirestore, private readonly auth: AngularFireAuth) {
    // firebase.setLogLevel('debug');
    this.transactionCollectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user): AngularFirestoreCollection<Transaction> => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        return this.afs.collection('transaction', (ref) => ref.where('userId', '==', user.uid));
      }),
      shareReplay(1)
    );
  }

  public createTransaction(transaction: Transaction): Observable<Transaction | undefined> {
    var transactionId = transaction.transactionId || uuidv4();

    return combineLatest([this.transactionCollectionRef$, this.auth.user]).pipe(
      switchMap(([ref, user]) => {
        var now = new Date();
        return ref.doc(transactionId).set({
          // TODO: add other fields in here
          accountId: transaction.accountId,
          userId: user!.uid,
          transactionDate: transaction.transactionDate,
          postingDate: transaction.postingDate || transaction.transactionDate,
          type: transaction.type || '',
          amount: transaction.amount || 0,
          description: transaction.description || '',
          currency: transaction.currency || '',
          created: now,
          updated: now,
        });
      }),
      switchMap(() => this.getTransaction(transactionId))
    );
  }

  private getTransactionSnapshot(transactionId: string): Observable<firebase.firestore.DocumentSnapshot<Transaction>> {
    return this.transactionCollectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Transaction>) =>
        collection.doc<Transaction>(transactionId).get()
      )
    );
  }

  public getTransaction(transactionId: string): Observable<Transaction | undefined> {
    return this.transactionCollectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Transaction>) =>
        collection.doc<Transaction>(transactionId).get()
      ),
      map((snapshot) => (snapshot.exists ? snapshot.data() : undefined)),
      map((transaction) => (transaction ? { ...transaction, transactionId: transactionId } : undefined))
    );
  }

  public listTransactionsByAccount(
    accountId: string,
    pageSize: number,
    nextStartAt: firebase.firestore.DocumentSnapshot<Transaction> | undefined
  ): Observable<ListTransactionsResponse> {
    const transactions$ = this.transactionCollectionRef$.pipe(
      map(
        (ref): AngularFirestoreCollection<Transaction> =>
          this.afs.collection(ref.ref, (r) => {
            const q = r
              .where('accountId', '==', accountId)
              .orderBy('postingDate', 'desc')
              .limit(pageSize + 1); // query one more record to determine if there's another page
            return nextStartAt ? q.startAt(nextStartAt) : q;
          })
      ),
      switchMap((ref) => ref.valueChanges({ idField: 'transactionId' })),
      shareReplay(1)
    );

    const nextStartAt$: Observable<firebase.firestore.DocumentSnapshot<Transaction> | null> = transactions$.pipe(
      switchMap((transactions) =>
        transactions.length > pageSize ? this.getTransactionSnapshot(transactions[pageSize].transactionId) : of(null)
      )
    );

    return zip(transactions$, nextStartAt$).pipe(
      map(([transactions, next]) => ({
        transactions: transactions.slice(0, pageSize),
        hasMore: transactions.length > pageSize,
        nextStartAt: next,
      })),
    );
  }
}
