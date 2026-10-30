import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InsumoService } from '../../../core/services/insumo.service';
import { ContextoService } from '../../../core/services/contexto.service';

@Component({
  selector: 'app-registrar-insumo-dialog',
  templateUrl: './registrar-insumo-dialog.component.html',
  styleUrls: ['./registrar-insumo-dialog.component.scss']
})
export class RegistrarInsumoDialogComponent implements OnInit {
  @Input() insumoEdicao: any = null; 
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  carregando: boolean = false;
  erroValidacao: string | null = null;
  idSitioAtual: number | null = null;
  isEdicao: boolean = false;

  dadosInsumo: any = {
    nome: '',
    descricao: '',
    quantidadeEstoque: 0,
    categoria: 'FERTILIZANTE', 
    unidadeMedida: 'UNIDADE', 
    fornecedor: ''
  };

  constructor(
    private insumoService: InsumoService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();
    if (this.insumoEdicao) {
      this.isEdicao = true;
      this.dadosInsumo = { ...this.insumoEdicao }; 
    }
  }

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;
    if (!this.idSitioAtual) {
      this.erroValidacao = 'Alerta: Nenhuma propriedade está selecionada.';
      return;
    }
    if (!this.dadosInsumo.nome || this.dadosInsumo.quantidadeEstoque === null) {
      this.erroValidacao = 'Preencha todos os campos obrigatórios (*).';
      return;
    }

    const payload = { ...this.dadosInsumo, sitioId: this.idSitioAtual };
    this.carregando = true;

    if (this.isEdicao) {
      this.insumoService.atualizar(this.insumoEdicao.id, payload).subscribe({
        next: () => { this.salvo.emit(); this.fechar.emit(); },
        error: () => { this.carregando = false; this.erroValidacao = 'Erro ao atualizar dados.'; }
      });
    } else {
      this.insumoService.cadastrar(payload).subscribe({
        next: () => { this.salvo.emit(); this.fechar.emit(); },
        error: () => { this.carregando = false; this.erroValidacao = 'Erro ao salvar insumo.'; }
      });
    }
  }
}