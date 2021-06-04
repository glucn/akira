import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from "@angular/fire/firestore";
import { combineLatest, Observable, of } from "rxjs";
import { map, skipWhile, switchMap } from 'rxjs/operators';

export interface Account {
  accountId: string;
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

  constructor(
    private store: AngularFirestore,
    public auth: AngularFireAuth,
    ) {
    this.collectionRef = this.store.collection('account');
    this.collectionRef$ = this.auth.user.pipe(
      skipWhile(user => !user || user == null),
      map(user => {
        if (!user) {
          throw "User is null or undefined"; // TODO: find a better way to handle null
        }
        var ref: AngularFirestoreCollection<Account> = this.store.collection('account', ref => ref.where('userId', '==', user.uid));
        return ref;
      })
    );
  }

  public listAccounts(): Observable<Account[]> {
    return this.collectionRef$.pipe(
      switchMap(ref => ref ? ref.valueChanges(): of([]))
    );
  }

  public getAccounts(accountId: string): Observable<Account> {
    return of();
  }

  public createAccounts(account: Account): Observable<Account|undefined> {
    var docRef$: Observable<DocumentReference<Account>> = combineLatest([this.collectionRef$, this.auth.user]).pipe(
      switchMap(([ref, user]) => {
        if (!user) {
          throw "User is null or undefined"; // TODO: find a better way to handle null
        }
        return ref.add({...account, userId: user.uid});
      })
    );

    return combineLatest([this.collectionRef$, docRef$]).pipe(
      switchMap(([collection, doc]) => collection.doc<Account>(doc.id).valueChanges())
    );
  }

  public updateAccounts(account: Account): void {
    return;
  }

  public deleteAccounts(accountId: string): void {
    return;
  }
}
