import { TestBed } from '@angular/core/testing';

import { DocumentosComponent } from './cadastrar-documento-dialog.component';

describe('DocumentosComponent', () => {
  let component: DocumentosComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.inject(DocumentosComponent);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
