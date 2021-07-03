import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface FieldOption {
  name: string;
  value: number;
}

@Component({
  selector: 'file-header-mapper',
  templateUrl: './file-header-mapper.component.html',
  styleUrls: ['./file-header-mapper.component.scss'],
})
export class FileHeaderMapperComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() fileHeader: FieldOption[] | null = [];

  constructor() {}
}
