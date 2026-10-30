import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarSetorDialogComponent } from './cadastrar-setor-dialog.component';

describe('CadastrarSetorDialogComponent', () => {
  let component: CadastrarSetorDialogComponent;
  let fixture: ComponentFixture<CadastrarSetorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastrarSetorDialogComponent]
    });
    fixture = TestBed.createComponent(CadastrarSetorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
