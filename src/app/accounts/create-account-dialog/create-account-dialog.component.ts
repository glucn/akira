import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Account } from '../../shared/account.service';

export interface AccountDialogData {
  account: Partial<Account>;
  enableDelete?: boolean;
}

export interface AccountDialogResult {
  account: Account;
  delete?: boolean;
}

@Component({
  selector: 'create-account-dialog',
  templateUrl: './create-account-dialog.component.html',
  styleUrls: ['./create-account-dialog.component.scss']
})
export class CreateAccountDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreateAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountDialogData) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
