import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateAccountDialogComponent } from './create-update-account-dialog.component';

describe('CreateUpdateAccountDialogComponent', () => {
  let component: CreateUpdateAccountDialogComponent;
  let fixture: ComponentFixture<CreateUpdateAccountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateUpdateAccountDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateAccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
