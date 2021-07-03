import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileHeaderMapperComponent } from './file-header-mapper.component';

describe('FileHeaderMapperComponent', () => {
  let component: FileHeaderMapperComponent;
  let fixture: ComponentFixture<FileHeaderMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileHeaderMapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileHeaderMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
