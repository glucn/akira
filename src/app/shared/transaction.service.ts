import { Injectable } from '@angular/core';
import { Entry } from './entry.service';

export interface Transaction {
  transactionId?: string;
  userId?: string;
  transactionDate: Date;
  entries: Entry[];
}

export function isTransactionBalanced(transaction: Transaction): boolean {
  const sumAmount: number = transaction.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  return sumAmount === 0;
}

@Injectable({
  providedIn: 'root',
})
export class TransanctionService {}
