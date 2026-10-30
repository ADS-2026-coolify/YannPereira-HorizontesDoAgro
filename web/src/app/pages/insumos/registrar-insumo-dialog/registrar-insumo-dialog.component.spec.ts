import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarInsumoDialogComponent } from './registrar-insumo-dialog.component';

describe('RegistrarInsumoDialogComponent', () => {
  let component: RegistrarInsumoDialogComponent;
  let fixture: ComponentFixture<RegistrarInsumoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarInsumoDialogComponent]
    });
    fixture = TestBed.createComponent(RegistrarInsumoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
