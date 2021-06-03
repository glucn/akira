import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from "@angular/fire/firestore";
import { Observable, of } from "rxjs";
import { filter, switchMap } from 'rxjs/operators';

export interface Account {
  accountId: string;
  userId: string;
  name: string;
  currency: string;
  type: string;
  balance?: number;
  displayInSideNav?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  collectionRef: AngularFirestoreCollection<Account>;

  constructor(
    private store: AngularFirestore,
    public auth: AngularFireAuth,
    ) {
    this.collectionRef = this.store.collection('account');
  }

  public listAccounts(): Observable<Account[]> {
    return this.auth.user.pipe(
      filter(user => !!user),
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        var collectionRef: AngularFirestoreCollection<Account> = this.store.collection('account', ref => ref.where('userId', '==', user.uid));
        return collectionRef.valueChanges({userId: user.uid})
      })
    )
  }

  public getAccounts(accountId: string): Observable<Account> {
    return of();
  }

  public createAccounts(account: Account): Observable<Account|undefined> {
    return this.auth.user.pipe(
      filter(user => !!user),
      switchMap(user => this.collectionRef.add({...account, userId: user?.uid || 'NON-USER'})),
      switchMap((ref: DocumentReference<Account>) => this.collectionRef.doc<Account>(ref.id).valueChanges())
    )
  }

  public updateAccounts(account: Account): void {
    return;
  }

  public deleteAccounts(accountId: string): void {
    return;
  }
}
