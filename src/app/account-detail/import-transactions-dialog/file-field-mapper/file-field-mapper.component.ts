import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface FieldOption {
  name: string;
  value: number;
}

@Component({
  selector: 'file-field-mapper',
  templateUrl: './file-field-mapper.component.html',
  styleUrls: ['./file-field-mapper.component.scss'],
})
export class FileFieldMapperComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() fileFields: FieldOption[] | null = [];

  constructor() {}
}
