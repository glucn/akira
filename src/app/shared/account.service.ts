import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from "@angular/fire/firestore";
import { from, Observable, of } from "rxjs";
import { map, switchMap } from 'rxjs/operators';

export interface Account {
  userId: string;
  accountId: string;
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

  constructor(private store: AngularFirestore) {
    this.collectionRef = this.store.collection('accounts');
  }

  public listAccounts(userId: string): Observable<Account[]> {
    return of([]);
  }

  public getAccounts(userId: string, accountId: string): Observable<Account> {
    return of();
  }

  public createAccounts(account: Account): Observable<Account|undefined> {
    return from(this.collectionRef.add(account)).pipe(
      switchMap((ref: DocumentReference<Account>) => this.collectionRef.doc<Account>(ref.id).valueChanges())
    );
  }

  public updateAccounts(account: Account): void {
    return;
  }

  public deleteAccounts(userId: string, accountId: string): void {
    return;
  }
}
