import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { skipWhile, switchMap } from 'rxjs/operators';
import { Account, AccountService } from '../shared/account.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { AccountDataSource } from './account-data-source';
import {
  AccountDialogResult,
  CreateUpdateAccountDialogComponent
} from './create-update-account-dialog/create-update-account-dialog.component';

@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  @ViewChild('table') table!: MatTable<Account>;

  displayedColumns: string[] = ['reorder', 'name', 'balance', 'currency', 'type', 'action'];

  constructor(
    private accountService: AccountService,
    public accountDataSource: AccountDataSource,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.accountService.listAccounts().subscribe((res) => console.log(res));
  }

  createAccount(): void {
    const dialogRef = this.dialog.open(CreateUpdateAccountDialogComponent, {
      width: '400px',
      data: {
        account: {},
        isCreate: true,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: AccountDialogResult) => !result || !result.account),
        switchMap((result: AccountDialogResult) => this.accountService.createAccount(result.account))
      )
      .subscribe(
        (next) => console.log('account created', next),
        (err) => console.log(err)
      );
  }

  updateAccount(account: Account): void {
    const dialogRef = this.dialog.open(CreateUpdateAccountDialogComponent, {
      width: '400px',
      data: {
        account: account,
        isCreate: false,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: AccountDialogResult) => !result || !result.account),
        switchMap((result: AccountDialogResult) => this.accountService.updateAccount(result.account))
      )
      .subscribe(
        (next) => console.log('account updated', next),
        (err) => console.log(err)
      );
  }

  deleteAccount(account: Account): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm deleting account',
        body: `Are you sure you want to delete ${account.name}?`,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: AccountDialogResult) => !result),
        switchMap(() => this.accountService.deleteAccount(account.accountId!))
      )
      .subscribe(
        () => console.log('account deleted'),
        (err) => console.log(err)
      );
  }

  dropTable(event: CdkDragDrop<AccountDataSource>): void {
    this.accountService.moveAccountOrdering(event.previousIndex, event.currentIndex).subscribe(
      () => console.log('account moved'),
      (err) => console.log(err)
    );
  }
}
