import { Account } from "./account.service";

export function getAccountUrl(account: Account): string {
  return `/account/${account.accountId}`;
}
