import { TestBed } from '@angular/core/testing';

import { RegistrarCategoriaDialogComponent } from './cadastrar-documento-dialog.component';

describe('RegistrarCategoriaDialogComponent', () => {
  let component: RegistrarCategoriaDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.inject(RegistrarCategoriaDialogComponent);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
