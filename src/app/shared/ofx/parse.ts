import { DateTime } from 'luxon';
import { parse } from 'ofx';
import { OfxTransaction } from './models';

export function parseOfx(xml: string): OfxTransaction[] {
  const ofxBody = parse(xml);

  return getTransactionsFromOfxBody(ofxBody);
}

function getTransactionsFromOfxBody(ofxBody: any): OfxTransaction[] {
  if (ofxBody?.OFX?.BANKMSGSRSV1) {
    return ofxBody.OFX.BANKMSGSRSV1.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN?.map((transaction: any) =>
      parseTransaction(transaction)
    );
  }
  if (ofxBody?.OFX?.CREDITCARDMSGSRSV1) {
    return ofxBody.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN?.map((transaction: any) =>
      parseTransaction(transaction)
    );
  }
  return [];
}

function parseTransaction(transaction: any): OfxTransaction {
  return {
    fitId: transaction.FITID,
    transactionType: transaction.TRNTYPE,
    datePosted: DateTime.fromFormat(transaction.DTPOSTED, 'yyyyMMddHHmmss.SSS').toJSDate(), // TODO: make it work with other possible formats
    dateUser: DateTime.fromFormat(transaction.DTUSER, 'yyyyMMddHHmmss.SSS').toJSDate(), // TODO
    amount: transaction.TRNAMT,
    name: transaction.NAME,
    memo: transaction.MEMO,
    checkNum: transaction.CHECKNUM,
    refNum: transaction.REFNUM,
  };
}
