import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropriedadesComponent } from './propriedades.component';

describe('PropriedadesComponent', () => {
  let component: PropriedadesComponent;
  let fixture: ComponentFixture<PropriedadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropriedadesComponent]
    });
    fixture = TestBed.createComponent(PropriedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
