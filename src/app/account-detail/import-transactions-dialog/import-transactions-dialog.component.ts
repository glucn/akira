import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { FieldOption } from './file-field-mapper/file-field-mapper.component';

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
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  private transactionsFile$: Observable<File>;
  private fileHeader$$: BehaviorSubject<FieldOption[]> = new BehaviorSubject<FieldOption[]>([]);

  private ngUnsubscribe = new Subject();

  constructor(private fireStorage: AngularFireStorage) {
    this.firstFormGroup = new FormGroup({
      transactionFile: new FormControl(null, [Validators.required]),
    });

    this.secondFormGroup = new FormGroup({
      transactionDate: new FormControl('', Validators.required),
      postedDate: new FormControl(-1, Validators.required),
      type: new FormControl(-1, Validators.required),
      amount: new FormControl('', Validators.required),
      description: new FormControl(-1, Validators.required),
    });

    this.transactionsFile$ = this.firstFormGroup.get('transactionFile')!.valueChanges.pipe(
      tap((file) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          if (typeof fileReader.result === 'string') {
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

  importTransactions(): void {}

  uploadFile(): void {
    const localFile = this.firstFormGroup.get('transactionFile')?.value;
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

  test(): void {
    console.log(this.secondFormGroup.value);
  }
}
