import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarEquipamentoDialogComponent } from './cadastrar-equipamento-dialog.component';

describe('CadastrarEquipamentoDialogComponent', () => {
  let component: CadastrarEquipamentoDialogComponent;
  let fixture: ComponentFixture<CadastrarEquipamentoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastrarEquipamentoDialogComponent]
    });
    fixture = TestBed.createComponent(CadastrarEquipamentoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
