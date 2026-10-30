import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarTipoDialogComponent } from './registrar-tipo-dialog.component';

describe('RegistrarTipoDialogComponent', () => {
  let component: RegistrarTipoDialogComponent;
  let fixture: ComponentFixture<RegistrarTipoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarTipoDialogComponent]
    });
    fixture = TestBed.createComponent(RegistrarTipoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
