import { Injectable } from '@angular/core';

export interface Transaction {
  accountId?: string;
  transactionId?: string;
  transactionDate: Date;
  postingDate: Date;
  type: string;
  amount: number;
  description: string;
  currency?: string;
  balance?: number;
  created?: Date;
  updated?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {}
