import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContextoService } from '../../core/services/contexto.service';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.scss']
})
export class FuncionariosComponent implements OnInit, OnDestroy {

  carregando: boolean = false;
  termoBusca: string = '';
  
  funcionariosOriginais: any[] = [];
  funcionariosFiltrados: any[] = [];
  
  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  constructor(
    private http: HttpClient,
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
    if (!this.idSitioAtual) return;
    
    this.carregando = true;
    
    this.http.get<any[]>(`${environment.apiUrl}/funcionarios`, {
      params: { sitioId: this.idSitioAtual.toString() }
    }).subscribe({
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
      func.telefone?.includes(termo)
    );
  }

  abrirModalAdicionar(): void {
    console.log('Abrir modal de cadastro');
  }

  verDetalhes(funcionario: any): void {
    console.log('Visualizar funcionário:', funcionario);
  }
}