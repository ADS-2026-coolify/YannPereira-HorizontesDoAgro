import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EquipamentoService, EquipamentoRequest } from 'src/app/core/services/equipamento.service';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cadastrar-equipamento-dialog',
  templateUrl: './cadastrar-equipamento-dialog.component.html',
  styleUrls: ['./cadastrar-equipamento-dialog.component.scss']
})
export class CadastrarEquipamentoDialogComponent implements OnInit {

  @Input() equipamentoParaEditar: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  propriedades: any[] = []; 
  isEdicao: boolean = false;
  carregando: boolean = false;
  erroValidacao: string | null = null;

  dadosEquipamento: any = {
    sitioId: null,
    nome: '',
    tipo: '',
    marcaModelo: '',
    ano: null,
    status: 'ATIVO',
    dataAquisicao: '',
    dataVenda: null,
    descricao: ''
  };

  constructor(
    private equipamentoService: EquipamentoService,
    private http: HttpClient,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.carregarPropriedades();

    if (!this.equipamentoParaEditar) {
      this.dadosEquipamento.sitioId = this.contextoService.getPropriedadeAtual();
    }

    if (this.equipamentoParaEditar) {
      this.isEdicao = true;
      this.dadosEquipamento = {
        sitioId: this.equipamentoParaEditar.sitio?.id || this.encontrarIdPorNome(this.equipamentoParaEditar.nomePropriedade),
        nome: this.equipamentoParaEditar.nome,
        tipo: this.equipamentoParaEditar.tipo,
        marcaModelo: this.equipamentoParaEditar.marcaModelo,
        ano: this.equipamentoParaEditar.ano,
        status: this.equipamentoParaEditar.status, 
        dataAquisicao: this.equipamentoParaEditar.dataAquisicao,
        dataVenda: this.equipamentoParaEditar.dataVenda,
        descricao: this.equipamentoParaEditar.descricao
      };
    }
  }

  encontrarIdPorNome(nomePropriedade: string): number | null {
    const prop = this.propriedades.find(p => p.nome === nomePropriedade);
    return prop ? prop.id : null;
  }

  carregarPropriedades(): void {
    this.http.get<any[]>(environment.apiPropriedades).subscribe({
      next: (res) => {
        this.propriedades = res;
        if (this.isEdicao && !this.dadosEquipamento.sitioId && this.equipamentoParaEditar?.nomePropriedade) {
          this.dadosEquipamento.sitioId = this.encontrarIdPorNome(this.equipamentoParaEditar.nomePropriedade);
        }
      },
      error: (err) => console.error('Erro ao carregar propriedades', err)
    });
  }

  cancelar(): void {
    this.fechar.emit();
  }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.dadosEquipamento.nome || !this.dadosEquipamento.sitioId || !this.dadosEquipamento.tipo || !this.dadosEquipamento.dataAquisicao) {
      this.erroValidacao = 'Os campos Nome, Propriedade, Tipo e Data de Aquisição são obrigatórios.';
      return;
    }

    if (this.dadosEquipamento.status === 'VENDIDO' && !this.dadosEquipamento.dataVenda) {
      this.erroValidacao = 'Para equipamentos vendidos, a Data de Venda é obrigatória.';
      return;
    }

    const payload: EquipamentoRequest = {
      sitioId: Number(this.dadosEquipamento.sitioId),
      nome: this.dadosEquipamento.nome,
      tipo: this.dadosEquipamento.tipo,
      marcaModelo: this.dadosEquipamento.marcaModelo,
      ano: this.dadosEquipamento.ano ? Number(this.dadosEquipamento.ano) : undefined,
      status: this.dadosEquipamento.status,
      dataAquisicao: this.dadosEquipamento.dataAquisicao,
      dataVenda: this.dadosEquipamento.status === 'VENDIDO' ? this.dadosEquipamento.dataVenda : null,
      descricao: this.dadosEquipamento.descricao
    };

    this.carregando = true;

    if (this.isEdicao) {
      this.equipamentoService.atualizar(this.equipamentoParaEditar.id, payload).subscribe({
        next: () => {
          this.carregando = false;
          this.salvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error(erro);
          this.erroValidacao = 'Erro ao atualizar equipamento. Verifique os dados.';
        }
      });
    } else {
      this.equipamentoService.cadastrar(payload).subscribe({
        next: () => {
          this.carregando = false;
          this.salvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error(erro);
          this.erroValidacao = 'Erro ao cadastrar equipamento. Verifique os dados.';
        }
      });
    }
  }
}