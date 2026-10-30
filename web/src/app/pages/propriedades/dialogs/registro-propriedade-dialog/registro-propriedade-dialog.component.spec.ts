import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPropriedadeDialogComponent } from './registro-propriedade-dialog.component';

describe('RegistroPropriedadeDialogComponent', () => {
  let component: RegistroPropriedadeDialogComponent;
  let fixture: ComponentFixture<RegistroPropriedadeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistroPropriedadeDialogComponent]
    });
    fixture = TestBed.createComponent(RegistroPropriedadeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
