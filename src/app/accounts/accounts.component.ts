import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { skipWhile, switchMap, tap } from 'rxjs/operators';
import { AccountService } from '../shared/account.service';
import { AccountDataSource } from './account-data-source';
import { AccountDialogResult, CreateAccountDialogComponent } from './create-account-dialog/create-account-dialog.component';

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'balance',  'currency', 'type', 'action'];

  constructor(
    private accountService: AccountService,
    public accountDataSource: AccountDataSource,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.accountService.listAccounts().subscribe(res => console.log(res));
  }

  createAccount(): void {
    const dialogRef = this.dialog.open(CreateAccountDialogComponent, {
    width: '400px',
    data: {
      account: {},
    },
  });
  dialogRef
    .afterClosed()
    .pipe(
      tap(console.log),
      skipWhile((result: AccountDialogResult) => !result || !result.account),
      switchMap((result: AccountDialogResult) => this.accountService.createAccounts(result.account))
    )
    .subscribe(next => console.log('account created', next), err => console.log(err));
  }
}


