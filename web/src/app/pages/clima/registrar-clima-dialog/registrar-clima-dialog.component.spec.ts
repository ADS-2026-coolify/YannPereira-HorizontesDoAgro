import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarClimaDialogComponent } from './registrar-clima-dialog.component';

describe('RegistrarClimaDialogComponent', () => {
  let component: RegistrarClimaDialogComponent;
  let fixture: ComponentFixture<RegistrarClimaDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarClimaDialogComponent]
    });
    fixture = TestBed.createComponent(RegistrarClimaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
