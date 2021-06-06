import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { map, skipWhile, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Account {
  accountId?: string;
  userId: string;
  name: string;
  currency: string;
  type: string;
  balance?: number;
  displayInSideNav?: boolean;
  created?: Date;
  updated?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  collectionRef: AngularFirestoreCollection<Account>; // TODO: delete it?
  collectionRef$: Observable<AngularFirestoreCollection<Account>>;

  constructor(private store: AngularFirestore, public auth: AngularFireAuth) {
    this.collectionRef = this.store.collection('account');
    this.collectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        var ref: AngularFirestoreCollection<Account> = this.store.collection('account', (ref) =>
          ref.where('userId', '==', user.uid)
        );
        return ref;
      })
    );
  }

  public listAccounts(): Observable<Account[]> {
    return this.collectionRef$.pipe(switchMap((ref) => (ref ? ref.valueChanges({ idField: 'accountId' }) : of([]))));
  }

  public getAccount(accountId: string): Observable<Account> {
    return of();
  }

  public createAccount(account: Account): Observable<Account | undefined> {
    var accountId: string = account.accountId || uuidv4();

    return combineLatest([this.collectionRef$, this.auth.user]).pipe(
      switchMap(([ref, user]) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        return ref.doc(accountId).set({
          name: account.name,
          currency: account.currency,
          type: account.type,
          created: new Date(),
          updated: new Date(),
          userId: user.uid,
        });
      }),
      switchMap(() => this.collectionRef$),
      switchMap((collection: AngularFirestoreCollection<Account>) => collection.doc<Account>(accountId).valueChanges())
    );
  }

  public updateAccount(account: Account): void {
    return;
  }

  public deleteAccount(accountId: string): Observable<void> {
    return this.collectionRef$.pipe(switchMap((ref) => ref.doc(accountId).delete()));
  }
}
