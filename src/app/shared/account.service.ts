import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
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
  collectionRef$: Observable<AngularFirestoreCollection<Account>>;

  constructor(private afs: AngularFirestore, public auth: AngularFireAuth) {
    this.collectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        var ref: AngularFirestoreCollection<Account> = this.afs.collection('account', (ref) =>
          ref.where('userId', '==', user.uid)
        );
        return ref;
      })
    );
  }

  public listAccounts(): Observable<Account[]> {
    return this.collectionRef$.pipe(switchMap((ref) => (ref ? ref.valueChanges({ idField: 'accountId' }) : of([]))));
  }

  public getAccount(accountId: string): Observable<Account | undefined> {
    return this.collectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Account>) => collection.doc<Account>(accountId).get()),
      map((snapshot) => (snapshot.exists ? snapshot.data() : undefined))
    );
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
      switchMap(() => this.getAccount(accountId)),
    );
  }

  public updateAccount(account: Account): Observable<Account | undefined> {
    return this.collectionRef$.pipe(
      switchMap((ref) => {
        var accountDoc = ref.doc(account.accountId);
        return firebase.firestore().runTransaction((t) => {
          return t.get(accountDoc.ref).then((accountDoc) => {
            t.update(accountDoc.ref, {
              name: account.name,
              currency: account.currency,
              type: account.type,
              updated: new Date(),
            });
          });
        });
      }),
      switchMap(() => this.getAccount(account.accountId!)),
    );
  }

  public deleteAccount(accountId: string): Observable<void> {
    return this.collectionRef$.pipe(switchMap((ref) => ref.doc(accountId).delete()));
  }
}
