import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

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
export class ImportTransactionsDialogComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private fireStorage: AngularFireStorage) {
    this.firstFormGroup = new FormGroup({
      transactionFile: new FormControl(null, [Validators.required]),
    });

    this.secondFormGroup = this.formBuilder.group({ fileName: '' });
  }

  ngOnInit(): void {}

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
}
