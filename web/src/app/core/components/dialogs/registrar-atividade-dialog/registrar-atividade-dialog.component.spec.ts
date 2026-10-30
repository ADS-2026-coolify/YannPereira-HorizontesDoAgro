import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAtividadeDialogComponent } from './registrar-atividade-dialog.component';

describe('RegistrarAtividadeDialogComponent', () => {
  let component: RegistrarAtividadeDialogComponent;
  let fixture: ComponentFixture<RegistrarAtividadeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarAtividadeDialogComponent]
    });
    fixture = TestBed.createComponent(RegistrarAtividadeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
