import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarFuncionarioDialogComponent } from './registrar-funcionario-dialog.component';

describe('RegistrarFuncionarioDialogComponent', () => {
  let component: RegistrarFuncionarioDialogComponent;
  let fixture: ComponentFixture<RegistrarFuncionarioDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarFuncionarioDialogComponent]
    });
    fixture = TestBed.createComponent(RegistrarFuncionarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
