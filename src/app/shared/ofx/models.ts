// Reference: https://www.ofx.net/downloads/OFX%202.2.pdf

// <STMTTRN>
// A <STMTTRN> aggregate describes a single transaction
// Transaction amounts are signed from the perspective of the customer. For example, a credit card payment
// is positive while a credit card purchase is negative.
export interface OfxTransaction {
  fitId?: string; // <FITID> Transaction ID issued by financial institution, used to detect duplicate download.
  transactionType?: string; // <TRNTYPE> Transaction type. TODO: use ENUM instead of string?
  datePosted?: Date; // <DTPOSTED> Date transaction was posted to account
  dateUser?: Date; // <DTUSER> Date user initiated transaction, if known
  amount?: number; // <TRNAMT> Amount of transaction.
  name?: string; // <NAME> Name of payee or description of transaction
  memo?: string; // <MEMO> Extra information (not in <NAME>)
  checkNum?: string; // <CHECKNUM> Check (or other reference) number
  refNum?: string; // <REFNUM> Reference number that uniquely identifies the transaction. Can be used in addition to or instead of a <CHECKNUM>

  // TODO: add more fields from the standard
}

// <STMTTRNP>
// A <STMTTRNP> aggregate describes a single pending transaction
// TODO: define the interface following the standard
export interface PendingTransaction {}

// <BANKTRANLIST>
// Statement-transaction-data aggregate
export interface BankTransactionList {
  startDate?: Date; // <DTSTART> Start date for transaction data
  endDate?: Date; // <DTEND> Value that client should send in next <DTSTART> request to ensure that it does not miss any transactions
  transactions?: OfxTransaction[]; // <STMTTRN>...</STMTTRN>
}

// <CCSTMTRS>
// Credit Card Statement Download Response
export interface CreditCardStatementResponse {
  defaultCurrency?: string; // <CURDEF> Default currency for the statement
  transactionList?: BankTransactionList; // <BANKTRANLIST>...</BANKTRANLIST>
}

// <CCSTMTTRNRS>
// Credit Card Statement Transaction Response Wrapper
export interface CreditCardStatementResponseWrapper {
  creditCardStatementResponse?: CreditCardStatementResponse; // <CCSTMTRS>...</CCSTMTRS>
}

// <CREDITCARDMSGSRSV1>
export interface CreditCardMessageSetResponseMessage {
  creditCardStatementResponse?: CreditCardStatementResponseWrapper; // <CCSTMTTRNRS>...</CCSTMTTRNRS>
}

// <STMTRS>
// Bank Statement Download Response
export interface BankStatementResponse {
  defaultCurrency?: string; // <CURDEF> Default currency for the statement
  transactionList?: BankTransactionList; // <BANKTRANLIST>...</BANKTRANLIST>
}
