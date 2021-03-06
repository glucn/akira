import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { Subject } from 'rxjs';
import { skipWhile, switchMap, takeUntil } from 'rxjs/operators';
import { getAccountUrl } from '../shared/account-utils';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent implements OnInit, OnDestroy {
  @ViewChild('table') table!: MatTable<Account>;

  displayedColumns: string[] = ['reorder', 'name', 'balance', 'currency', 'type', 'action'];

  private ngUnsubscribe = new Subject();

  constructor(
    private accountService: AccountService,
    public accountDataSource: AccountDataSource,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
        switchMap((result: AccountDialogResult) => this.accountService.createAccount(result.account)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        // TODO: remove debug subscription
        (next) => console.log('account created', next),
        (err) => console.log(err)
      );
  }

  updateAccount(account: Account): void {
    const dialogRef = this.dialog.open(CreateUpdateAccountDialogComponent, {
      width: '400px',
      data: {
        account: {...account},
        isCreate: false,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        skipWhile((result: AccountDialogResult) => !result || !result.account),
        switchMap((result: AccountDialogResult) => this.accountService.updateAccount(result.account)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        // TODO: remove debug subscription
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
        switchMap(() => this.accountService.deleteAccount(account.accountId!)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        // TODO: remove debug subscription

        () => console.log('account deleted'),
        (err) => console.log(err)
      );
  }

  dropTable(event: CdkDragDrop<AccountDataSource>): void {
    this.accountService
      .moveAccountOrdering(event.previousIndex, event.currentIndex)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        // TODO: remove debug subscription

        () => console.log('account moved'),
        (err) => console.log(err)
      );
  }
}

@Pipe({
  name: 'accountLink',
})
export class AccountLinkPipe implements PipeTransform {
  transform(account: Account): string {
    return getAccountUrl(account);
  }
}
