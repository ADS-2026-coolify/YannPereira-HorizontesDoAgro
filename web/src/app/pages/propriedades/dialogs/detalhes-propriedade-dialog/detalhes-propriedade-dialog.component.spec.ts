import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesPropriedadeDialogComponent } from './detalhes-propriedade-dialog.component';

describe('DetalhesPropriedadeDialogComponent', () => {
  let component: DetalhesPropriedadeDialogComponent;
  let fixture: ComponentFixture<DetalhesPropriedadeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetalhesPropriedadeDialogComponent]
    });
    fixture = TestBed.createComponent(DetalhesPropriedadeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
