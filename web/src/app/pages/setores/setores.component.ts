import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SetorService } from '../../core/services/setor.service';
import { ContextoService } from '../../core/services/contexto.service';

@Component({
  selector: 'app-setores',
  templateUrl: './setores.component.html',
  styleUrls: ['./setores.component.scss']
})
export class SetoresComponent implements OnInit, OnDestroy {

  idSetorParaExcluir: number | null = null;
  mostrarModal: boolean = false;
  listaSetores: any[] = [];
  carregandoTabela: boolean = false;
  idSitioAtual: number | null = null;

  setorSelecionadoParaEdicao: any = null;

  private contextoSub!: Subscription;

  constructor(
    private setorService: SetorService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.contextoSub = this.contextoService.propriedadeAtual$.subscribe((idContexto: any) => {
      this.idSitioAtual = idContexto;
      this.carregarSetores(idContexto);
    });
  }

  ngOnDestroy(): void {
    if (this.contextoSub) this.contextoSub.unsubscribe();
  }

  abrirModal(): void {
    this.setorSelecionadoParaEdicao = null;
    this.mostrarModal = true;
  }

  abrirModalEdicao(setor: any): void {
    this.setorSelecionadoParaEdicao = setor;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.setorSelecionadoParaEdicao = null;
  }

  atualizarLista(): void {
    this.carregarSetores(this.idSitioAtual);
  }

  deletarSetor(id: number): void {
    this.idSetorParaExcluir = id;
  }

  aoResponderExclusao(confirmado: boolean): void {
    if (confirmado && this.idSetorParaExcluir !== null) {
      this.setorService.deletar(this.idSetorParaExcluir).subscribe({
        next: () => {
          this.carregarSetores(this.idSitioAtual);
          this.idSetorParaExcluir = null;
        },
        error: (erro: any) => {
          console.error('Erro ao excluir setor:', erro);
          alert('Não foi possível excluir o setor.');
          this.idSetorParaExcluir = null;
        }
      });
    } else {
      this.idSetorParaExcluir = null;
    }
  }

  carregarSetores(sitioId: number | null): void {
    if (!sitioId) {
      this.listaSetores = [];
      return;
    }

    this.carregandoTabela = true;

    this.setorService.listarPorSitio(sitioId).subscribe({
      next: (dados: any) => {
        this.listaSetores = dados;
        this.carregandoTabela = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar setores', erro);
        this.carregandoTabela = false;
      }
    });
  }
}
