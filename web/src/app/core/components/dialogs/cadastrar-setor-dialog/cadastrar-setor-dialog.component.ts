import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SetorService, SetorRequest } from 'src/app/core/services/setor.service';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cadastrar-setor-dialog',
  templateUrl: './cadastrar-setor-dialog.component.html',
  styleUrls: ['./cadastrar-setor-dialog.component.scss']
})
export class CadastrarSetorDialogComponent implements OnInit {

  @Input() setorParaEditar: any = null; 
  @Output() fechar = new EventEmitter<void>();
  @Output() setorSalvo = new EventEmitter<void>(); 

  propriedades: any[] = []; 

  dadosSetor: {
    sitioId: number | null;
    nome: string;
    hectares: number | null;
    plantio: string;
    observacoes: string;
    status: string;
  } = {
    sitioId: null,
    nome: '',
    hectares: null,
    plantio: '',
    observacoes: '',
    status: 'EM_PREPARO'
  };

  erroValidacao: string | null = null;
  carregando: boolean = false;
  isEdicao: boolean = false;

  constructor(
    private setorService: SetorService,
    private http: HttpClient,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.carregarPropriedades();

    if (!this.setorParaEditar) {
      this.dadosSetor.sitioId = this.contextoService.getPropriedadeAtual();
    }

    if (this.setorParaEditar) {
      this.isEdicao = true;
      this.dadosSetor = {
        sitioId: this.setorParaEditar.sitioId || this.encontrarIdPorNome(this.setorParaEditar.nomePropriedade),
        nome: this.setorParaEditar.nome,
        hectares: this.setorParaEditar.hectares,
        plantio: this.setorParaEditar.plantio || '',
        observacoes: this.setorParaEditar.observacoes || '',
        status: this.setorParaEditar.status || 'EM_PREPARO'
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
        if (this.isEdicao && !this.dadosSetor.sitioId && this.setorParaEditar?.nomePropriedade) {
          this.dadosSetor.sitioId = this.encontrarIdPorNome(this.setorParaEditar.nomePropriedade);
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

    if (!this.dadosSetor.nome || !this.dadosSetor.hectares || !this.dadosSetor.sitioId) {
      this.erroValidacao = 'Propriedade, Nome e Área (hectares) são obrigatórios.';
      return;
    }

    const payload: SetorRequest = {
      sitioId: Number(this.dadosSetor.sitioId),
      nome: this.dadosSetor.nome,
      hectares: Number(this.dadosSetor.hectares),
      plantio: this.dadosSetor.plantio,
      observacoes: this.dadosSetor.observacoes,
      status: this.dadosSetor.status 
    };

    this.carregando = true;

    if (this.isEdicao) {
      this.setorService.atualizar(this.setorParaEditar.id, payload).subscribe({
        next: () => {
          this.carregando = false;
          this.setorSalvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error(erro);
          this.erroValidacao = 'Erro ao atualizar setor. Verifique os dados.';
        }
      });
    } else {
      this.setorService.cadastrar(payload).subscribe({
        next: () => {
          this.carregando = false;
          this.setorSalvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error(erro);
          this.erroValidacao = 'Erro ao cadastrar setor. Verifique os dados.';
        }
      });
    }
  }
}