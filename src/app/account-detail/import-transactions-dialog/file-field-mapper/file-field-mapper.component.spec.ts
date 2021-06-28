import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFieldMapperComponent } from './file-field-mapper.component';

describe('FileFieldMapperComponent', () => {
  let component: FileFieldMapperComponent;
  let fixture: ComponentFixture<FileFieldMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileFieldMapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileFieldMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
