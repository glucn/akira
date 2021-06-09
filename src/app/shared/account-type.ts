import { Observable, of } from 'rxjs';

export interface AccountType {
  value: string;
  displayName: string;
  icon: string;
}

export const DEFAULT_ICON: string = 'payments';

export function getAccountTypes$(): Observable<AccountType[]> {
  // TODO: move these to DB
  return of([
    {
      value: 'Cash',
      displayName: 'Cash',
      icon: 'payments',
    },
    {
      value: 'Bank',
      displayName: 'Bank',
      icon: 'credit_card',
    },
    {
      value: 'Credit Card',
      displayName: 'Credit Card',
      icon: 'credit_card',
    },
  ]);
}
