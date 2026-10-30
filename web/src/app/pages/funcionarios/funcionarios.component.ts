import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { FuncionarioService } from 'src/app/core/services/funcionario.service';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.scss']
})
export class FuncionariosComponent implements OnInit, OnDestroy {

  mostrarModalExclusao: boolean = false;
  idParaExcluir: number | null = null;
  carregandoExclusao: boolean = false;
  funcionarioSelecionado: any = null;
  carregando: boolean = false;
  termoBusca: string = '';
  mostrarModal: boolean = false;
  
  funcionariosOriginais: any[] = [];
  funcionariosFiltrados: any[] = [];
  
  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  constructor(
    private funcionarioService: FuncionarioService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarFuncionarios();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) {
      this.contextoSub.unsubscribe();
    }
  }

  carregarFuncionarios(): void {
    if (!this.idSitioAtual) {
      this.funcionariosOriginais = [];
      this.aplicarFiltro();
      return;
    }

    this.carregando = true;
    
    this.funcionarioService.listarTodos(this.idSitioAtual).subscribe({
      next: (dados) => {
        this.funcionariosOriginais = dados;
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
        this.carregando = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.termoBusca) {
      this.funcionariosFiltrados = [...this.funcionariosOriginais];
      return;
    }

    const termo = this.termoBusca.toLowerCase();
    this.funcionariosFiltrados = this.funcionariosOriginais.filter(func => 
      func.nomeCompleto?.toLowerCase().includes(termo) ||
      func.email?.toLowerCase().includes(termo) ||
      func.telefone?.includes(termo) ||
      func.cargo?.toLowerCase().includes(termo)
    );
  }

  abrirModalAdicionar(): void {
    this.funcionarioSelecionado = null; 
    this.mostrarModal = true;
  }

  abrirModalEdicao(funcionario: any): void {
    this.funcionarioSelecionado = funcionario; 
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.funcionarioSelecionado = null;
  }

  deletarFuncionario(id: number): void {
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
    
    this.funcionarioService.deletar(this.idParaExcluir).subscribe({
      next: () => {
        this.carregandoExclusao = false;
        this.cancelarExclusao();
        this.carregarFuncionarios(); 
      },
      error: (erro) => {
        this.carregandoExclusao = false;
        console.error('Erro ao deletar', erro);
        alert('Não foi possível excluir o funcionário. Ele já possui vínculos no sistema.');
        this.cancelarExclusao();
      }
    });
  }
}