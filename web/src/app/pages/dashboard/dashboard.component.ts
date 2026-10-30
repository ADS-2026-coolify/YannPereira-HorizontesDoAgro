import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { PropriedadesService, Propriedade } from 'src/app/core/services/propriedades.service';
import { SetorService } from 'src/app/core/services/setor.service';
import { EquipamentoService } from 'src/app/core/services/equipamento.service';
import { FuncionarioService } from 'src/app/core/services/funcionario.service';
import { ClimaService } from 'src/app/core/services/clima.service';

interface ResumoDashboard {
  chuvaMesAtualMm: number;
  setoresAtivos: number;
  setoresTotal: number;
  equipamentosAtivos: number;
  equipamentosTotal: number;
  funcionariosAtivos: number;
  funcionariosTotal: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  carregando: boolean = true;
  idSitioAtual: number | null = null;
  propriedadeAtual: Propriedade | null = null;
  existemPropriedades: boolean = true;
  nomeMesAtual: string = '';

  resumo: ResumoDashboard = {
    chuvaMesAtualMm: 0,
    setoresAtivos: 0,
    setoresTotal: 0,
    equipamentosAtivos: 0,
    equipamentosTotal: 0,
    funcionariosAtivos: 0,
    funcionariosTotal: 0
  };

  private contextoSub!: Subscription;

  constructor(
    private contextoService: ContextoService,
    private propriedadesService: PropriedadesService,
    private setorService: SetorService,
    private equipamentoService: EquipamentoService,
    private funcionarioService: FuncionarioService,
    private climaService: ClimaService
  ) {}

  ngOnInit(): void {
    this.nomeMesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarDados();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) this.contextoSub.unsubscribe();
  }

  private carregarDados(): void {
    if (!this.idSitioAtual) {
      this.propriedadesService.listarPropriedades().subscribe({
        next: (lista) => {
          this.existemPropriedades = lista.length > 0;
          this.carregando = false;
        },
        error: () => { this.carregando = false; }
      });
      return;
    }

    this.carregando = true;
    this.existemPropriedades = true;

    forkJoin({
      propriedades: this.propriedadesService.listarPropriedades(),
      setores: this.setorService.listarPorSitio(this.idSitioAtual),
      equipamentos: this.equipamentoService.listarTodos(this.idSitioAtual),
      funcionarios: this.funcionarioService.listarTodos(this.idSitioAtual),
      clima: this.climaService.listarTodos(this.idSitioAtual)
    }).subscribe({
      next: ({ propriedades, setores, equipamentos, funcionarios, clima }) => {
        this.propriedadeAtual = propriedades.find(p => p.id === this.idSitioAtual) || null;

        this.resumo = {
          chuvaMesAtualMm: this.calcularChuvaDoMes(clima),
          setoresAtivos: setores.filter((s: any) => s.status === 'ATIVO').length,
          setoresTotal: setores.length,
          equipamentosAtivos: equipamentos.filter((e: any) => e.status === 'ATIVO').length,
          equipamentosTotal: equipamentos.length,
          funcionariosAtivos: funcionarios.filter((f: any) => (f.status || '').toUpperCase() === 'ATIVO').length,
          funcionariosTotal: funcionarios.length
        };

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar dados do painel geral:', erro);
        this.carregando = false;
      }
    });
  }

  private calcularChuvaDoMes(registrosClima: any[]): number {
    const agora = new Date();
    const anoMesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

    const total = registrosClima
      .filter(r => typeof r.dataHora === 'string' && r.dataHora.startsWith(anoMesAtual))
      .reduce((acc, r) => acc + (r.milimetros || 0), 0);

    return parseFloat(total.toFixed(1));
  }
}
