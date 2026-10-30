import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { InsumoService } from 'src/app/core/services/insumo.service';

@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.scss']
})
export class InsumosComponent implements OnInit, OnDestroy {
  carregando: boolean = false;
  termoBusca: string = '';
  
  insumosOriginais: any[] = [];
  insumosFiltrados: any[] = [];
  
  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  mostrarModal: boolean = false;
  insumoSelecionado: any = null;

  mostrarModalExclusao: boolean = false;
  idParaExcluir: number | null = null;
  carregandoExclusao: boolean = false;

  constructor(
    private insumoService: InsumoService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarInsumos();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) this.contextoSub.unsubscribe();
  }

  carregarInsumos(): void {
    if (!this.idSitioAtual) {
      this.insumosOriginais = [];
      this.aplicarFiltro();
      return;
    }
    this.carregando = true;
    
    this.insumoService.listarTodos(this.idSitioAtual).subscribe({
      next: (dados) => {
        this.insumosOriginais = dados;
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar insumos:', erro);
        this.carregando = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.termoBusca) {
      this.insumosFiltrados = [...this.insumosOriginais];
      return;
    }
    const termo = this.termoBusca.toLowerCase();
    this.insumosFiltrados = this.insumosOriginais.filter(i => 
      i.nome?.toLowerCase().includes(termo) ||
      i.descricao?.toLowerCase().includes(termo)
    );
  }

  abrirModalAdicionar(): void {
    this.insumoSelecionado = null; 
    this.mostrarModal = true;
  }

  abrirModalEdicao(insumo: any): void {
    this.insumoSelecionado = insumo; 
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.insumoSelecionado = null;
  }

  deletarInsumo(id: number): void {
    this.idParaExcluir = id;
    this.mostrarModalExclusao = true;
  }

  cancelarExclusao(): void {
    this.mostrarModalExclusao = false;
    this.idParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;
    this.carregandoExclusao = true;
    
    this.insumoService.deletar(this.idParaExcluir).subscribe({
      next: () => {
        this.carregandoExclusao = false;
        this.cancelarExclusao();
        this.carregarInsumos(); 
      },
      error: (erro) => {
        this.carregandoExclusao = false;
        console.error('Erro ao deletar', erro);
        alert('Não foi possível excluir o insumo.');
        this.cancelarExclusao();
      }
    });
  }
}