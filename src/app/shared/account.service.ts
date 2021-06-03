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

  public listAccounts(userId: string): Observable<Account[]> {
    return of([]);
  }

  public getAccounts(userId: string, accountId: string): Observable<Account> {
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

  public deleteAccounts(userId: string, accountId: string): void {
    return;
  }
}
