import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { ClimaService } from 'src/app/core/services/clima.service';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.scss']
})
export class ClimaComponent implements OnInit, OnDestroy {
  carregando: boolean = false;
  
  registrosOriginais: any[] = [];
  registrosFiltrados: any[] = [];
  
  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  filtroData: string = '';
  filtroTempo: string = '';
  dataInicio: string = '';
  dataFim: string = '';

  resumo = { totalMm: 0, diasChuva: 0, diasEnsolarados: 0, diasNublados: 0 };

  mostrarModal: boolean = false;
  registroSelecionado: any = null;
  mostrarModalExclusao: boolean = false;
  idParaExcluir: number | null = null;
  carregandoExclusao: boolean = false;

  constructor(
    private climaService: ClimaService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarRegistros();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) this.contextoSub.unsubscribe();
  }

  carregarRegistros(): void {
    if (!this.idSitioAtual) {
      this.registrosOriginais = [];
      this.aplicarFiltros();
      return;
    }
    this.carregando = true;
    
    this.climaService.listarTodos(this.idSitioAtual).subscribe({
      next: (dados) => {
        this.registrosOriginais = dados.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar clima:', erro);
        this.carregando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.registrosFiltrados = this.registrosOriginais.filter(registro => {
      let passaData = true;
      let passaTempo = true;

      const dataRegistro = registro.dataHora.split('T')[0]; 

      if (this.dataInicio) {
        passaData = passaData && (dataRegistro >= this.dataInicio);
      }

      if (this.dataFim) {
        passaData = passaData && (dataRegistro <= this.dataFim);
      }

      if (this.filtroTempo) {
        passaTempo = registro.tempo === this.filtroTempo;
      }

      return passaData && passaTempo;
    });

    this.calcularResumo();
  }

  calcularResumo(): void {
    let totalMm = 0;
    let chuva = 0;
    let sol = 0;
    let nublado = 0;

    this.registrosFiltrados.forEach(reg => {
      totalMm += (reg.milimetros || 0);
      if (reg.tempo === 'CHUVOSO' || reg.tempo === 'TEMPESTADE') chuva++;
      if (reg.tempo === 'ENSOLARADO') sol++;
      if (reg.tempo === 'NUBLADO') nublado++;
    });

    this.resumo = { 
      totalMm: parseFloat(totalMm.toFixed(2)), 
      diasChuva: chuva, 
      diasEnsolarados: sol, 
      diasNublados: nublado 
    };
  }

  abrirModalAdicionar(): void { this.registroSelecionado = null; this.mostrarModal = true; }
  abrirModalEdicao(registro: any): void { this.registroSelecionado = registro; this.mostrarModal = true; }
  fecharModal(): void { this.mostrarModal = false; this.registroSelecionado = null; }
  
  deletarRegistro(id: number): void { this.idParaExcluir = id; this.mostrarModalExclusao = true; }
  cancelarExclusao(): void { this.mostrarModalExclusao = false; this.idParaExcluir = null; }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;
    this.carregandoExclusao = true;
    this.climaService.deletar(this.idParaExcluir).subscribe({
      next: () => {
        this.carregandoExclusao = false;
        this.cancelarExclusao();
        this.carregarRegistros(); 
      },
      error: (erro) => {
        this.carregandoExclusao = false;
        alert('Erro ao excluir registro de clima.');
        this.cancelarExclusao();
      }
    });
  }
}