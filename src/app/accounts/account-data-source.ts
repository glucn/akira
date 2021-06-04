import { DataSource } from '@angular/cdk/collections';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { Account, AccountService } from '../shared/account.service';

@Injectable({
  providedIn: 'root',
})
export class AccountDataSource extends DataSource<Account> {

  constructor(private accountService: AccountService) {
    super();
  }

  connect(): Observable<Account[]> {
    return this.accountService.listAccounts();
  }

  disconnect() { }
}
