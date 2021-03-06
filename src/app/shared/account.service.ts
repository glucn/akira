import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, skipWhile, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Account {
  accountId?: string;
  userId?: string;
  name: string;
  currency: string;
  type: string;
  balance?: number;
  displayInSideNav?: boolean;
  created?: Date;
  updated?: Date;
}

// userId is the document id
export interface AccountsOrdering {
  accountIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  accountCollectionRef$: Observable<AngularFirestoreCollection<Account>>;
  accountsOrderingCollectionRef$: Observable<AngularFirestoreCollection<AccountsOrdering>>;

  constructor(private readonly afs: AngularFirestore, private auth: AngularFireAuth) {
    // firebase.setLogLevel('debug');
    this.accountCollectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user): AngularFirestoreCollection<Account> => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        return this.afs.collection('account', (ref) => ref.where('userId', '==', user.uid));
      }),
      shareReplay(1)
    );

    this.accountsOrderingCollectionRef$ = this.auth.user.pipe(
      skipWhile((user) => !user || user == null),
      map((user): AngularFirestoreCollection<AccountsOrdering> => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        return this.afs.collection('accountOrdering');
      }),
      shareReplay(1)
    );
  }

  public listAccounts(): Observable<Account[]> {
    var accounts$ = this.accountCollectionRef$.pipe(
      switchMap((ref) => (ref ? ref.valueChanges({ idField: 'accountId' }) : of([])))
    );

    var ordering$: Observable<string[]> = combineLatest([this.accountsOrderingCollectionRef$, this.auth.user]).pipe(
      switchMap(([ordering, user]) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }

        return ordering.doc(user.uid).valueChanges();
      }),
      skipWhile((ordering) => !ordering),
      map((ordering) => ordering!.accountIds)
    );

    return combineLatest([accounts$, ordering$]).pipe(
      map(([accounts, ordering]) =>
        accounts.sort((a, b) => ordering.indexOf(a.accountId) - ordering.indexOf(b.accountId))
      )
    );
  }

  public getAccount(accountId: string): Observable<Account | undefined> {
    return this.accountCollectionRef$.pipe(
      switchMap((collection: AngularFirestoreCollection<Account>) => collection.doc<Account>(accountId).get()),
      map((snapshot) => (snapshot.exists ? snapshot.data() : undefined)),
      map((account) => (account ? { ...account, accountId: accountId } : undefined))
    );
  }

  public createAccount(account: Account): Observable<Account | undefined> {
    var accountId: string = account.accountId || uuidv4();

    return combineLatest([this.accountCollectionRef$, this.accountsOrderingCollectionRef$, this.auth.user]).pipe(
      switchMap(([ref, orderingRef, user]) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }
        var accountDoc = ref.doc(accountId);
        var accountsOrderingDoc = orderingRef.doc(user.uid);

        return firebase.firestore().runTransaction((t) => {
          var accountPromise = t.get(accountDoc.ref);
          var accountsOrderingPromise = t.get(accountsOrderingDoc.ref);

          return Promise.all([accountPromise, accountsOrderingPromise]).then(([acc, ordering]) => {
            if (acc.exists) {
              throw `Account ${accountId} already exists`;
            }
            t.set(accountDoc.ref, {
              name: account.name,
              currency: account.currency,
              type: account.type,
              created: new Date(),
              updated: new Date(),
              userId: user.uid,
            });

            if (ordering.exists) {
              t.update(accountsOrderingDoc.ref, {
                accountIds: firebase.firestore.FieldValue.arrayUnion(accountId),
              });
            } else {
              t.set(accountsOrderingDoc.ref, {
                accountIds: [accountId],
              });
            }
          });
        });
      }),
      switchMap(() => this.getAccount(accountId))
    );
  }

  public updateAccount(account: Account): Observable<Account | undefined> {
    return this.accountCollectionRef$.pipe(
      switchMap((ref) => {
        var accountDoc = ref.doc(account.accountId);
        return firebase.firestore().runTransaction((t) => {
          return t.get(accountDoc.ref).then((acc) => {
            if (!acc.exists) {
              throw `Account ${account.accountId} does not exist`;
            }
            t.update(accountDoc.ref, {
              name: account.name,
              currency: account.currency,
              type: account.type,
              updated: new Date(),
            });
          });
        });
      }),
      switchMap(() => this.getAccount(account.accountId!))
    );
  }

  public deleteAccount(accountId: string): Observable<void> {
    return combineLatest([this.accountCollectionRef$, this.accountsOrderingCollectionRef$, this.auth.user]).pipe(
      switchMap(([ref, orderingRef, user]) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }

        var accountDoc = ref.doc(accountId);
        var accountsOrderingDoc = orderingRef.doc(user.uid);

        return firebase.firestore().runTransaction((t) => {
          var accountPromise = t.get(accountDoc.ref);
          var accountsOrderingPromise = t.get(accountsOrderingDoc.ref);

          return Promise.all([accountPromise, accountsOrderingPromise]).then(([acc, ordering]) => {
            if (!acc.exists) {
              throw `Account ${accountId} does not exist`;
            }
            t.delete(accountDoc.ref);

            if (ordering.exists) {
              t.update(accountsOrderingDoc.ref, {
                accountIds: firebase.firestore.FieldValue.arrayRemove(accountId),
              });
            }
          });
        });
      })
    );
  }

  // This function is not safe for concurrent operation
  public moveAccountOrdering(fromIndex: number, toIndex: number): Observable<void> {
    return combineLatest([this.accountsOrderingCollectionRef$, this.auth.user]).pipe(
      switchMap(([orderingRef, user]) => {
        if (!user) {
          throw 'User is null or undefined'; // TODO: find a better way to handle null
        }

        var accountsOrderingDoc = orderingRef.doc(user.uid);

        return firebase.firestore().runTransaction((t) => {
          return t.get(accountsOrderingDoc.ref).then((ordering) => {
            if (ordering.exists) {
              var newOrdering: string[] = [...ordering.data()!.accountIds]; // copy the array
              // TODO: validate fromIndex and toIndex
              var accountToMove: string = newOrdering[fromIndex];
              newOrdering.splice(fromIndex, 1);
              newOrdering.splice(toIndex, 0, accountToMove);

              t.set(accountsOrderingDoc.ref, {
                accountIds: newOrdering,
              });
            }
          });
        });
      })
    );
  }
}
