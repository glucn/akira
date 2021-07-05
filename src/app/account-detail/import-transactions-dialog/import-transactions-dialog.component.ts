import { DataSource } from '@angular/cdk/collections';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Account } from 'src/app/shared/account.service';
import { Entry } from 'src/app/shared/entry.service';
import { v4 as uuidv4 } from 'uuid';
import { FieldOption } from './file-header-mapper/file-header-mapper.component';

export interface ImportTransactionsDialogData {
  account: Account;
}

export interface ImportTransactionsDialogResult {
  transactions: Entry[];
}

@Component({
  selector: 'app-import-transactions-dialog',
  templateUrl: './import-transactions-dialog.component.html',
  styleUrls: ['./import-transactions-dialog.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class ImportTransactionsDialogComponent implements OnInit, OnDestroy {
  fileSelectionFormGroup: FormGroup;
  fileHeaderMappingFormGroup: FormGroup;

  private transactionsFile$: Observable<File>;
  private fileContent$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private fileHeader$$: BehaviorSubject<FieldOption[]> = new BehaviorSubject<FieldOption[]>([]);
  importTransactions: Entry[] = [];

  displayedColumns: string[] = ['transactionDate', 'postingDate', 'category', 'debit', 'credit', 'description'];
  importReviewDataSource: ImportTransactionsDataSource | undefined;

  private ngUnsubscribe = new Subject();

  constructor(
    private fireStorage: AngularFireStorage,
    @Inject(MAT_DIALOG_DATA) public data: ImportTransactionsDialogData
  ) {
    this.fileSelectionFormGroup = new FormGroup({
      transactionFile: new FormControl(null, [Validators.required]),
    });

    this.fileHeaderMappingFormGroup = new FormGroup({
      transactionDate: new FormControl('', Validators.required),
      postedDate: new FormControl(-1, Validators.required),
      category: new FormControl(-1, Validators.required),
      amount: new FormControl(-1, Validators.required),
      description: new FormControl(-1, Validators.required),
    });

    this.transactionsFile$ = this.fileSelectionFormGroup.get('transactionFile')!.valueChanges.pipe(
      tap((file) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          if (typeof fileReader.result === 'string') {
            this.fileContent$$.next(fileReader.result.split('\n'));
            this.fileHeader$$.next(this.parseFileHeader(fileReader.result));
          }
        };
        // TODO: handle errors

        fileReader.readAsText(file);
      }),
      takeUntil(this.ngUnsubscribe)
    );

    this.transactionsFile$.subscribe();
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  uploadFile(): void {
    const localFile = this.fileSelectionFormGroup.get('transactionFile')?.value;
    const serverFilePath = `import-transactions/${uuidv4()}.csv`;
    this.fireStorage
      .ref(serverFilePath)
      .put(localFile)
      .then((ref) => {
        console.log('uploaded', ref);
      });
  }

  private parseFileHeader(fileContent: string): FieldOption[] {
    const header = fileContent.split('\n')[0];
    return header
      ? header.split(',').map((field, idx) => ({ name: field.trim().replace(/^\"+|\"+$/g, ''), value: idx }))
      : [];
  }

  get fileHeader$(): Observable<FieldOption[]> {
    return this.fileHeader$$.asObservable();
  }

  confirmFieldsMapping(): void {
    const fieldMapping = this.fileHeaderMappingFormGroup.value;
    this.importTransactions = this.fileContent$$
      .getValue()
      .slice(1)
      .filter((line) => !!line)
      .map((line) => {
        const fields = line.split(',').map((f) => f.trim());
        // TODO: handle date formats that are not compatible with ISO
        // TODO: handle different timezones
        const transactionDate: Date = DateTime.fromISO(fields[fieldMapping.transactionDate]).toJSDate();
        return {
          accountId: this.data.account.accountId,
          transactionDate: transactionDate,
          postingDate:
            fieldMapping.postedDate === -1 ? transactionDate : DateTime.fromISO(fields[fieldMapping.postedDate]).toJSDate(),
          category: fieldMapping.type === -1 ? '' : fields[fieldMapping.category],
          amount: parseFloat(fields[fieldMapping.amount]) || 0.0,
          description: fieldMapping.description === -1 ? '' : fields[fieldMapping.description],
          currency: this.data.account.currency,
        };
      });

    console.log(this.importTransactions);
    this.importReviewDataSource = new ImportTransactionsDataSource(this.importTransactions);
  }
}

export class ImportTransactionsDataSource extends DataSource<Entry> {
  constructor(readonly transactions: Entry[]) {
    super();
  }

  connect(): Observable<readonly Entry[]> {
    return of(this.transactions);
  }

  disconnect(): void {}
}
