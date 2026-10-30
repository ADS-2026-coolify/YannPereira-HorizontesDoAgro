import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { CategoriaService } from 'src/app/core/services/categoria.service';
import { DocumentoService, DocumentoRequest } from 'src/app/core/services/documento.service';
import { SetorService } from 'src/app/core/services/setor.service';
import { EquipamentoService } from 'src/app/core/services/equipamento.service';
import { InsumoService } from 'src/app/core/services/insumo.service';
import { FuncionarioService } from 'src/app/core/services/funcionario.service';
import { AtividadeService } from 'src/app/core/services/atividade.service';

const TAMANHO_MAXIMO_ARQUIVO_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-cadastrar-documento-dialog',
  templateUrl: './cadastrar-documento-dialog.component.html',
  styleUrls: ['./cadastrar-documento-dialog.component.scss']
})
export class CadastrarDocumentoDialogComponent implements OnInit {

  @Input() documentoParaEditar: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  isEdicao: boolean = false;
  carregando: boolean = false;
  erroValidacao: string | null = null;
  mostrarModalCategoria: boolean = false;

  idSitioAtual: number | null = null;

  categorias: any[] = [];
  setores: any[] = [];
  equipamentos: any[] = [];
  insumos: any[] = [];
  funcionarios: any[] = [];
  atividades: any[] = [];

  nomeArquivoAtual: string | null = null;
  private arquivoBase64: string | null = null;
  private novoTipoArquivo: string | null = null;
  private novoNomeArquivo: string | null = null;

  dadosDocumento: any = {
    categoriaId: null,
    tipoVinculo: '',
    vinculoId: null,
    nome: '',
    descricao: '',
    dataAdicionado: '',
    receitaDespesa: false,
    valor: null
  };

  constructor(
    private contextoService: ContextoService,
    private categoriaService: CategoriaService,
    private documentoService: DocumentoService,
    private setorService: SetorService,
    private equipamentoService: EquipamentoService,
    private insumoService: InsumoService,
    private funcionarioService: FuncionarioService,
    private atividadeService: AtividadeService
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();
    this.carregarListas();

    if (this.documentoParaEditar) {
      this.isEdicao = true;
      const d = this.documentoParaEditar;
      this.dadosDocumento = {
        categoriaId: d.categoriaId ?? null,
        tipoVinculo: d.tipoVinculo || '',
        vinculoId: d.vinculoId ?? null,
        nome: d.nome || '',
        descricao: d.descricao || '',
        dataAdicionado: d.dataAdicionado || '',
        receitaDespesa: !!d.receitaDespesa,
        valor: d.valor ?? null
      };
      this.nomeArquivoAtual = d.nomeArquivo || null;
    } else {
      this.dadosDocumento.dataAdicionado = new Date().toISOString().substring(0, 10);
    }
  }

  carregarListas(): void {
    this.categoriaService.listarTodos().subscribe({ next: (res) => this.categorias = res });

    if (!this.idSitioAtual) {
      console.warn('Alerta Arquitetural: Nenhuma propriedade está selecionada na Topbar.');
      return;
    }

    this.setorService.listarPorSitio(this.idSitioAtual).subscribe({ next: (res) => this.setores = res });
    this.equipamentoService.listarTodos(this.idSitioAtual).subscribe({ next: (res) => this.equipamentos = res });
    this.insumoService.listarTodos(this.idSitioAtual).subscribe({ next: (res) => this.insumos = res });
    this.funcionarioService.listarTodos(this.idSitioAtual).subscribe({ next: (res) => this.funcionarios = res });
    this.atividadeService.listarTodos(this.idSitioAtual).subscribe({ next: (res) => this.atividades = res });
  }

  get opcoesVinculo(): any[] {
    switch (this.dadosDocumento.tipoVinculo) {
      case 'SETOR': return this.setores;
      case 'EQUIPAMENTO': return this.equipamentos;
      case 'INSUMO': return this.insumos;
      case 'FUNCIONARIO': return this.funcionarios;
      case 'ATIVIDADE': return this.atividades;
      default: return [];
    }
  }

  rotuloOpcaoVinculo(item: any): string {
    switch (this.dadosDocumento.tipoVinculo) {
      case 'FUNCIONARIO': return item.nomeCompleto;
      case 'ATIVIDADE': return item.descricao;
      default: return item.nome;
    }
  }

  aoTrocarTipoVinculo(): void {
    this.dadosDocumento.vinculoId = null;
  }

  abrirModalNovaCategoria(): void {
    this.mostrarModalCategoria = true;
  }

  onCategoriaCriada(novaCategoria: any): void {
    this.categorias.push(novaCategoria);
    this.dadosDocumento.categoriaId = novaCategoria.id;
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!arquivo) return;

    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
      this.erroValidacao = 'O arquivo excede o tamanho máximo permitido de 8MB.';
      input.value = '';
      return;
    }

    this.erroValidacao = null;
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = leitor.result as string;
      this.arquivoBase64 = resultado.substring(resultado.indexOf(',') + 1);
      this.novoNomeArquivo = arquivo.name;
      this.novoTipoArquivo = arquivo.type || 'application/octet-stream';
    };
    leitor.readAsDataURL(arquivo);
  }

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.idSitioAtual) {
      this.erroValidacao = 'Selecione uma propriedade ativa na barra superior.';
      return;
    }
    if (!this.dadosDocumento.nome.trim()) {
      this.erroValidacao = 'O nome do documento é obrigatório.';
      return;
    }
    if (!this.dadosDocumento.categoriaId) {
      this.erroValidacao = 'Selecione uma categoria.';
      return;
    }
    if (this.dadosDocumento.tipoVinculo && !this.dadosDocumento.vinculoId) {
      this.erroValidacao = 'Selecione o registro a ser vinculado.';
      return;
    }
    if (!this.dadosDocumento.dataAdicionado) {
      this.erroValidacao = 'A data do documento é obrigatória.';
      return;
    }
    if (this.dadosDocumento.valor === null || this.dadosDocumento.valor === '' || Number(this.dadosDocumento.valor) < 0) {
      this.erroValidacao = 'Informe um valor válido.';
      return;
    }
    if (!this.isEdicao && !this.arquivoBase64) {
      this.erroValidacao = 'Anexe um arquivo ao documento.';
      return;
    }

    const payload: DocumentoRequest = {
      sitioId: this.idSitioAtual,
      categoriaId: Number(this.dadosDocumento.categoriaId),
      tipoVinculo: this.dadosDocumento.tipoVinculo || null,
      vinculoId: this.dadosDocumento.tipoVinculo ? Number(this.dadosDocumento.vinculoId) : null,
      nome: this.dadosDocumento.nome.trim(),
      descricao: this.dadosDocumento.descricao?.trim() || undefined,
      dataAdicionado: this.dadosDocumento.dataAdicionado,
      receitaDespesa: this.dadosDocumento.receitaDespesa,
      valor: Number(this.dadosDocumento.valor)
    };

    if (this.arquivoBase64) {
      payload.arquivoBase64 = this.arquivoBase64;
      payload.nomeArquivo = this.novoNomeArquivo ?? undefined;
      payload.tipoArquivo = this.novoTipoArquivo ?? undefined;
    }

    this.carregando = true;

    const requisicao = this.isEdicao
      ? this.documentoService.atualizar(this.documentoParaEditar.id, payload)
      : this.documentoService.cadastrar(payload);

    requisicao.subscribe({
      next: () => {
        this.carregando = false;
        this.salvo.emit();
        this.fechar.emit();
      },
      error: (erro) => {
        this.carregando = false;
        console.error(erro);
        this.erroValidacao = erro?.error?.mensagem || erro?.error?.message || 'Erro ao salvar o documento. Verifique os dados.';
      }
    });
  }
}
