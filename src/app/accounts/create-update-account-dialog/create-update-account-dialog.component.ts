import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '../../shared/account.service';

export interface AccountDialogData {
  account: Partial<Account>;
  isCreate?: boolean;
}

export interface AccountDialogResult {
  account: Account;
}

@Component({
  templateUrl: './create-update-account-dialog.component.html',
  styleUrls: ['./create-update-account-dialog.component.scss'],
})
export class CreateUpdateAccountDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreateUpdateAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountDialogData
  ) {}

  ngOnInit(): void {}

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
