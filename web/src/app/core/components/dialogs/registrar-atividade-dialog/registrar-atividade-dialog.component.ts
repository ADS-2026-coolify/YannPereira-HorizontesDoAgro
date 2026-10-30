import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AtividadeService, AtividadeRequest } from 'src/app/core/services/atividade.service';
import { ContextoService } from 'src/app/core/services/contexto.service';

@Component({
  selector: 'app-registrar-atividade-dialog',
  templateUrl: './registrar-atividade-dialog.component.html',
  styleUrls: ['./registrar-atividade-dialog.component.scss']
})
export class RegistrarAtividadeDialogComponent implements OnInit {

  @Input() atividadeParaEditar: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  isEdicao: boolean = false;
  carregando: boolean = false;
  erroValidacao: string | null = null;
  mostrarModalTipo: boolean = false;

  idSitioAtual: number | null = null;

  setores: any[] = [];
  tiposAtividade: any[] = [];
  funcionarios: any[] = [];
  equipamentos: any[] = [];

  dadosAtividade: any = {
    setorId: null,
    tipoAtividadeId: null,
    responsavelId: null,
    equipamentoId: null,
    dataAtividade: '',
    status: 'AGENDADA',
    descricao: ''
  };

  constructor(
    private atividadeService: AtividadeService,
    private contextoService: ContextoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();
    this.carregarFiltros();

    if (this.atividadeParaEditar) {
      this.isEdicao = true;
      this.dadosAtividade = {
        setorId: this.atividadeParaEditar.setorId || this.atividadeParaEditar.setor?.id || null,
        tipoAtividadeId: this.atividadeParaEditar.tipoAtividadeId || this.atividadeParaEditar.tipoAtividade?.id || null,
        responsavelId: this.atividadeParaEditar.responsavelId || this.atividadeParaEditar.responsavel?.id || null,
        equipamentoId: this.atividadeParaEditar.equipamentoId || this.atividadeParaEditar.equipamento?.id || null,
        dataAtividade: this.atividadeParaEditar.dataAtividade ? this.atividadeParaEditar.dataAtividade.substring(0, 16) : '',
        status: this.atividadeParaEditar.status || 'AGENDADA',
        descricao: this.atividadeParaEditar.descricao || ''
      };
    }
  }

  carregarFiltros(): void {
    if (!this.idSitioAtual) {
      console.warn('Alerta Arquitetural: Nenhuma propriedade está selecionada na Topbar.');
      return;
    }

    const urlSetores = environment.apiUrl.endsWith('/api')
      ? `${environment.apiUrl}/setores`
      : `${environment.apiUrl}/api/setores`;

    this.http.get<any[]>(urlSetores, { params: { sitioId: this.idSitioAtual.toString() } })
      .subscribe({ next: (res) => this.setores = res });

    this.http.get<any[]>(environment.apiTiposAtividade, { params: { sitioId: this.idSitioAtual.toString() } })
      .subscribe({ next: (res) => this.tiposAtividade = res });

    this.http.get<any[]>(environment.apiFuncionarios)
      .subscribe({ next: (res) => this.funcionarios = res });

    this.http.get<any[]>(environment.apiEquipamentos, { params: { sitioId: this.idSitioAtual.toString() } })
      .subscribe({ next: (res) => this.equipamentos = res });
  }

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.dadosAtividade.dataAtividade) {
      this.erroValidacao = 'Falha: O campo "Data e Hora" não foi capturado.';
      return;
    }
    if (!this.dadosAtividade.status) {
      this.erroValidacao = 'Falha: O campo "Status" não foi capturado.';
      return;
    }
    if (!this.dadosAtividade.tipoAtividadeId) {
      this.erroValidacao = 'Falha: O "Tipo de Atividade" não foi capturado.';
      return;
    }
    if (!this.dadosAtividade.setorId) {
      this.erroValidacao = 'Falha: O "Setor" não foi capturado.';
      return;
    }
    if (!this.dadosAtividade.responsavelId) {
      this.erroValidacao = 'Falha: O "Responsável" não foi capturado.';
      return;
    }
    if (!this.dadosAtividade.descricao || this.dadosAtividade.descricao.trim() === '') {
      this.erroValidacao = 'Falha: A "Descrição" está vazia ou não foi capturada.';
      return;
    }

    const payload: AtividadeRequest = {
      sitioId: this.idSitioAtual!,
      setorId: Number(this.dadosAtividade.setorId),
      tipoAtividadeId: Number(this.dadosAtividade.tipoAtividadeId),
      responsavelId: Number(this.dadosAtividade.responsavelId),
      equipamentoId: this.dadosAtividade.equipamentoId ? Number(this.dadosAtividade.equipamentoId) : null,
      dataAtividade: this.dadosAtividade.dataAtividade,
      status: this.dadosAtividade.status,
      descricao: this.dadosAtividade.descricao
    };

    this.carregando = true;

    if (this.isEdicao) {
      this.atividadeService.atualizar(this.atividadeParaEditar.id, payload).subscribe({
        next: () => this.concluirSalvamento(),
        error: (err) => this.tratarErro(err)
      });
    } else {
      this.atividadeService.cadastrar(payload).subscribe({
        next: () => this.concluirSalvamento(),
        error: (err) => this.tratarErro(err)
      });
    }
  }

  private concluirSalvamento(): void {
    this.carregando = false;
    this.salvo.emit();
    this.fechar.emit();
  }

  private tratarErro(erro: any): void {
    this.carregando = false;
    console.error(erro);
    this.erroValidacao = 'Erro ao processar a requisição. Verifique os dados.';
  }

  abrirModalNovoTipo(): void {
    this.mostrarModalTipo = true;
  }

  onTipoCriado(novoTipo: any): void {
    this.tiposAtividade.push(novoTipo);
    this.dadosAtividade.tipoAtividadeId = novoTipo.id;
  }
}