import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() titulo: string = 'Confirmar Exclusão';
  @Input() mensagem: string = 'Tem certeza que deseja excluir este registro? Esta ação não poderá ser desfeita.';
  
  @Output() resposta = new EventEmitter<boolean>();

  confirmar(): void {
    this.resposta.emit(true);
  }

  cancelar(): void {
    this.resposta.emit(false);
  }
}