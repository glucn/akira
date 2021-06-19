import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Transaction, TransactionService } from '../shared/transaction.service';

export class TransactionsDataSource extends DataSource<Transaction> {
  private accountId: string;

  get paginator(): MatPaginator | null {
    return this._paginator;
  }
  set paginator(paginator: MatPaginator | null) {
    this._paginator = paginator;
  }
  private _paginator: MatPaginator | null = null;

  constructor(private transactionService: TransactionService, private id: string) {
    super();
    this.accountId = id;
  }

  connect(): Observable<Transaction[]> {
    const response$ = this.transactionService.listTransactionsByAccount(this.accountId, 5, null);

    return response$.pipe(
      tap(console.log),
      map((response) => response.transactions)
    );
  }

  disconnect() {}
}
