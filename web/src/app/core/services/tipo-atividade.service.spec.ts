import { TestBed } from '@angular/core/testing';

import { TipoAtividadeService } from './tipo-atividade.service';

describe('TipoAtividadeService', () => {
  let service: TipoAtividadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoAtividadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
