import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { DocumentoService } from 'src/app/core/services/documento.service';
import { CategoriaService } from 'src/app/core/services/categoria.service';

const ROTULOS_VINCULO: { [key: string]: string } = {
  SETOR: 'Setor',
  EQUIPAMENTO: 'Equipamento',
  INSUMO: 'Insumo',
  FUNCIONARIO: 'Funcionário',
  ATIVIDADE: 'Atividade'
};

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss']
})
export class DocumentosComponent implements OnInit, OnDestroy {

  carregando: boolean = false;
  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  documentosOriginais: any[] = [];
  documentosFiltrados: any[] = [];
  categorias: any[] = [];

  filtros = {
    busca: '',
    categoriaId: null as number | null,
    tipoVinculo: '',
    receitaDespesa: ''
  };

  resumo = { totalReceitas: 0, totalDespesas: 0, saldo: 0 };

  mostrarModal: boolean = false;
  documentoSelecionadoParaEdicao: any = null;
  idDocumentoParaExcluir: number | null = null;

  constructor(
    private contextoService: ContextoService,
    private documentoService: DocumentoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.categoriaService.listarTodos().subscribe({ next: (res) => this.categorias = res });

    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarDocumentos();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) this.contextoSub.unsubscribe();
  }

  carregarDocumentos(): void {
    if (!this.idSitioAtual) {
      this.documentosOriginais = [];
      this.aplicarFiltros();
      return;
    }

    this.carregando = true;
    this.documentoService.listarPorSitio(this.idSitioAtual).subscribe({
      next: (dados) => {
        this.documentosOriginais = dados;
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar documentos:', erro);
        this.carregando = false;
      }
    });
  }

  aplicarFiltros(): void {
    const busca = this.filtros.busca.trim().toLowerCase();

    this.documentosFiltrados = this.documentosOriginais.filter(doc => {
      const passaBusca = !busca || doc.nome.toLowerCase().includes(busca);
      const passaCategoria = !this.filtros.categoriaId || doc.categoriaId === this.filtros.categoriaId;
      const passaVinculo = !this.filtros.tipoVinculo || doc.tipoVinculo === this.filtros.tipoVinculo;
      const passaTipo = !this.filtros.receitaDespesa ||
        (this.filtros.receitaDespesa === 'RECEITA' && doc.receitaDespesa) ||
        (this.filtros.receitaDespesa === 'DESPESA' && !doc.receitaDespesa);

      return passaBusca && passaCategoria && passaVinculo && passaTipo;
    });

    this.calcularResumo();
  }

  private calcularResumo(): void {
    let receitas = 0;
    let despesas = 0;

    this.documentosFiltrados.forEach(doc => {
      if (doc.receitaDespesa) {
        receitas += (doc.valor || 0);
      } else {
        despesas += (doc.valor || 0);
      }
    });

    this.resumo = {
      totalReceitas: parseFloat(receitas.toFixed(2)),
      totalDespesas: parseFloat(despesas.toFixed(2)),
      saldo: parseFloat((receitas - despesas).toFixed(2))
    };
  }

  rotuloVinculo(doc: any): string {
    if (!doc.tipoVinculo) return 'Geral da propriedade';
    const rotulo = ROTULOS_VINCULO[doc.tipoVinculo] || doc.tipoVinculo;
    return `${rotulo}: ${doc.vinculoNome || '-'}`;
  }

  iconeArquivo(tipoArquivo: string | null): string {
    if (!tipoArquivo) return 'ph-file';
    if (tipoArquivo.includes('pdf')) return 'ph-file-pdf';
    if (tipoArquivo.startsWith('image/')) return 'ph-file-image';
    return 'ph-file';
  }

  abrirModal(): void {
    this.documentoSelecionadoParaEdicao = null;
    this.mostrarModal = true;
  }

  abrirModalEdicao(documento: any): void {
    this.documentoSelecionadoParaEdicao = documento;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.documentoSelecionadoParaEdicao = null;
  }

  atualizarLista(): void {
    this.carregarDocumentos();
  }

  baixarArquivo(documento: any): void {
    this.documentoService.baixarArquivo(documento.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.nomeArquivo || documento.nome;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (erro) => {
        console.error('Erro ao baixar arquivo:', erro);
        alert('Não foi possível baixar o arquivo.');
      }
    });
  }

  deletarDocumento(id: number): void {
    this.idDocumentoParaExcluir = id;
  }

  aoResponderExclusao(confirmado: boolean): void {
    if (confirmado && this.idDocumentoParaExcluir !== null) {
      this.documentoService.deletar(this.idDocumentoParaExcluir).subscribe({
        next: () => {
          this.carregarDocumentos();
          this.idDocumentoParaExcluir = null;
        },
        error: (erro) => {
          console.error('Erro ao excluir documento:', erro);
          alert('Não foi possível excluir o documento.');
          this.idDocumentoParaExcluir = null;
        }
      });
    } else {
      this.idDocumentoParaExcluir = null;
    }
  }
}
