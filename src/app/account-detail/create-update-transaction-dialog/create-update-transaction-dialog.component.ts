import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Transaction } from 'src/app/shared/transaction.service';

export interface TransactionDialogData {
  transaction: Partial<Transaction>;
  isCreate?: boolean;
}

export interface TransactionDialogResult {
  transaction: Transaction;
}

@Component({
  templateUrl: './create-update-transaction-dialog.component.html',
  styleUrls: ['./create-update-transaction-dialog.component.scss'],
})
export class CreateUpdateTransactionDialogComponent implements OnInit {
  // TODO: refactor to a reactive forms, since [ngModel] does not scale well

  constructor(
    public dialogRef: MatDialogRef<CreateUpdateTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransactionDialogData
  ) {}

  ngOnInit(): void {}

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
