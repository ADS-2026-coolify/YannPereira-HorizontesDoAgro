import { Component, OnInit, OnDestroy } from '@angular/core';
import { EquipamentoService } from '../../core/services/equipamento.service';
import { ContextoService } from '../../core/services/contexto.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipamentos',
  templateUrl: './equipamentos.component.html',
  styleUrls: ['./equipamentos.component.scss']
})
export class EquipamentosComponent implements OnInit, OnDestroy {

  carregando: boolean = false;
  mostrarModal: boolean = false;
  idEquipamentoExcluir: number | null = null;
  equipamentoSelecionado: any = null;

  termoBusca: string = '';
  equipamentosOriginais: any[] = []; 
  equipamentos: any[] = []; 

  idSitioAtual: number | null = null;
  private contextoSub!: Subscription;

  constructor(
    private equipamentoService: EquipamentoService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe(id => {
      this.idSitioAtual = id;
      this.carregarEquipamentos();
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) {
      this.contextoSub.unsubscribe();
    }
  }

  carregarEquipamentos(): void {
    if (!this.idSitioAtual) {
      this.equipamentosOriginais = [];
      this.equipamentos = [];
      return;
    }

    this.carregando = true;

    this.equipamentoService.listarTodos(this.idSitioAtual).subscribe({
      next: (dados) => {
        this.equipamentosOriginais = dados;
        this.equipamentos = [...this.equipamentosOriginais];
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar equipamentos', erro);
        this.carregando = false;
      }
    });
  }

  filtrarEquipamentos(): void {
    if (!this.termoBusca) {
      this.equipamentos = [...this.equipamentosOriginais];
      return;
    }
    
    const termo = this.termoBusca.toLowerCase();
    this.equipamentos = this.equipamentosOriginais.filter(eqp => 
      eqp.nome.toLowerCase().includes(termo) || 
      (eqp.marcaModelo && eqp.marcaModelo.toLowerCase().includes(termo)) ||
      (eqp.tipo && eqp.tipo.toLowerCase().includes(termo))
    );
  }

  abrirModal(): void {
    this.equipamentoSelecionado = null;
    this.mostrarModal = true;
  }

  abrirModalEdicao(equipamento: any): void {
    this.equipamentoSelecionado = equipamento;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.equipamentoSelecionado = null;
  }

  deletarEquipamento(id: number): void {
    this.idEquipamentoExcluir = id;
  }

  aoConfirmarExclusao(confirmado: boolean): void {
    if (confirmado && this.idEquipamentoExcluir !== null) {
      this.equipamentoService.deletar(this.idEquipamentoExcluir).subscribe({
        next: () => {
          this.carregarEquipamentos();
          this.idEquipamentoExcluir = null;
        },
        error: (erro) => {
          console.error('Erro ao excluir equipamento', erro);
          alert('Não foi possível excluir o equipamento.');
          this.idEquipamentoExcluir = null;
        }
      });
    } else {
      this.idEquipamentoExcluir = null;
    }
  }
}