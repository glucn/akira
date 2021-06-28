import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploaderComponent,
      multi: true,
    },
  ],
})
export class FileUploaderComponent implements OnInit, ControlValueAccessor {
  onChange: Function | undefined;
  private file: File | null = null;
  fileName: string | undefined;

  constructor(private host: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {}

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    if (this.onChange) {
      this.onChange(file);
    }
    this.file = file;
    this.fileName = file?.name;
  }

  writeValue(value: null): void {
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
    this.fileName = undefined;
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {}
}
