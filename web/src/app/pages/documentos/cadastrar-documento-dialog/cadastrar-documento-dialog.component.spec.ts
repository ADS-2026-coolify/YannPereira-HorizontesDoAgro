import { TestBed } from '@angular/core/testing';

import { CadastrarDocumentoDialogComponent } from './cadastrar-documento-dialog.component';

describe('CadastrarDocumentoDialogComponent', () => {
  let component: CadastrarDocumentoDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.inject(CadastrarDocumentoDialogComponent);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
