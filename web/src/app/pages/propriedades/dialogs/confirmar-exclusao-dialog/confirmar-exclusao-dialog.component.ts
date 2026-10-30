import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmar-exclusao-dialog',
  templateUrl: './confirmar-exclusao-dialog.component.html',
  styleUrls: ['./confirmar-exclusao-dialog.component.scss']
})
export class ConfirmarExclusaoDialogComponent {
  @Input() nomePropriedade: string = '';
  @Output() fechar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  textoDigitado: string = '';

  onCancelar(): void {
    this.fechar.emit();
  }

  onConfirmar(): void {
    if (this.textoDigitado === this.nomePropriedade) {
      this.confirmar.emit();
    }
  }
}