import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'file-field-mapper',
  templateUrl: './file-field-mapper.component.html',
  styleUrls: ['./file-field-mapper.component.scss'],
})
export class FileFieldMapperComponent implements OnInit, OnChanges {
  private fileReader = new FileReader();

  private _file: File | undefined;
  @Input() set file(file: File | undefined) {
    this._file = file;

    if (file) {
      this.loading$$.next(true);

      this.fileReader.onload = (e) => {
        this.fileContent$$.next(this.fileReader.result);

        if (typeof this.fileReader.result === 'string') {
          this.fileFileds$$.next(this.parseFileFields(this.fileReader.result));
        }
        this.loading$$.next(false);
      };
      // TODO: handle errors

      this.fileReader.readAsText(this._file!);
    }
  }

  get file(): File | undefined {
    return this._file;
  }

  private fileContent$$: BehaviorSubject<string | ArrayBuffer | null> = new BehaviorSubject<
    string | ArrayBuffer | null
  >('');
  private fileFileds$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private loading$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('FileFieldMapperComponent::ngOnChanges', changes, this.file);
  }

  get fileContent$(): Observable<string | ArrayBuffer | null> {
    return this.fileContent$$.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loading$$.asObservable();
  }

  get fileFields$(): Observable<string[]> {
    return this.fileFileds$$.asObservable();
  }

  private parseFileFields(fileContent: string): string[] {
    const header = fileContent.split('\n')[0];
    return header ? header.split(',').map((f) => f.trim().replace(/^\"+|\"+$/g, '')) : [];
  }
}
