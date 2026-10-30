import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TipoAtividadeService } from 'src/app/core/services/tipo-atividade.service';
import { ContextoService } from 'src/app/core/services/contexto.service';

@Component({
  selector: 'app-registrar-tipo-dialog',
  templateUrl: './registrar-tipo-dialog.component.html', 
  styleUrls: ['./registrar-tipo-dialog.component.scss']
})
export class RegistrarTipoDialogComponent implements OnInit {
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<any>(); 

  nome: string = '';
  carregando: boolean = false;
  erroValidacao: string | null = null;
  idSitioAtual: number | null = null;

  constructor(
    private tipoAtividadeService: TipoAtividadeService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();
  }

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;
    if (!this.idSitioAtual) {
      this.erroValidacao = 'Selecione uma propriedade ativa na barra superior.';
      return;
    }
    if (!this.nome.trim()) {
      this.erroValidacao = 'O nome do tipo de atividade é obrigatório.';
      return;
    }

    this.carregando = true;
    this.tipoAtividadeService.cadastrar({ sitioId: this.idSitioAtual, nome: this.nome.trim() }).subscribe({
      next: (novoTipo) => {
        this.carregando = false;
        this.salvo.emit(novoTipo);
        this.fechar.emit();
      },
      error: (err) => {
        this.carregando = false;
        this.erroValidacao = 'Não foi possível cadastrar o tipo de atividade.';
      }
    });
  }
}