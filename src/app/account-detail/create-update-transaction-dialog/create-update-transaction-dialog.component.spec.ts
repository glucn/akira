import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateTransactionDialogComponent } from './create-update-transaction-dialog.component';

describe('CreateUpdateTransactionDialogComponent', () => {
  let component: CreateUpdateTransactionDialogComponent;
  let fixture: ComponentFixture<CreateUpdateTransactionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateTransactionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateTransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
