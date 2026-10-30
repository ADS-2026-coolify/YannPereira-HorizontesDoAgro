import { Component, OnInit } from '@angular/core';
import { PropriedadesService, Propriedade } from 'src/app/core/services/propriedades.service';
import { ContextoService } from 'src/app/core/services/contexto.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-propriedades',
  templateUrl: './propriedades.component.html',
  styleUrls: ['./propriedades.component.scss']
  
})
export class PropriedadesComponent implements OnInit {

  exibirDialogDetalhes: boolean = false;
  propriedadeSelecionada!: Propriedade;
  exibirDialogRegistro: boolean = false;
  propriedades: Propriedade[] = [];
  termoBusca: string = '';
  exibirDialogExclusao: boolean = false;
  propriedadeParaExcluir: any = null;

  constructor(
    private propriedadesService: PropriedadesService,
    private snackBar: MatSnackBar,
    private contextoService: ContextoService
  ) {}

  private mostrarMensagem(mensagem: string, tipo: 'sucesso' | 'erro'): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 4000, 
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: tipo === 'sucesso' ? ['snackbar-sucesso'] : ['snackbar-erro']
    });
  }

  ngOnInit(): void {
    this.carregarDadosReais();
  }

  carregarDadosReais(): void {
    this.propriedadesService.listarPropriedades().subscribe({
      next: (dadosDoBackend) => {
        this.propriedades = dadosDoBackend;
      },
      error: (erro) => {
        console.error('Falha ao buscar propriedades', erro);
      }
    });
  }

  registrarPropriedade(): void {
    this.exibirDialogRegistro = true;
  } 

  salvarNovaPropriedade(dadosFormulario: any): void {
    this.propriedadesService.criarPropriedade(dadosFormulario).subscribe({
      next: () => {
        this.exibirDialogRegistro = false;
        this.carregarDadosReais();
        this.contextoService.notificarAlteracaoPropriedades();
        this.mostrarMensagem('Propriedade registrada com sucesso!', 'sucesso');
      },
      error: (erro) => {
        console.error('Falha ao registrar a propriedade', erro);
        
        const mensagemServidor = erro.error?.mensagem || erro.error?.message || 'Erro de validação ao salvar os dados no servidor.';
        
        this.mostrarMensagem(`Atenção: ${mensagemServidor}`, 'erro');
      }
    });
  }

  verDetalhes(prop: Propriedade): void {
    this.propriedadeSelecionada = prop;
    this.exibirDialogDetalhes = true;
  }

  salvarEdicaoPropriedade(dadosAtualizados: any): void {
    const id = dadosAtualizados.id;
    
    this.propriedadesService.atualizarPropriedade(id, dadosAtualizados).subscribe({
      next: () => {
        this.exibirDialogDetalhes = false;
        this.carregarDadosReais();
        this.contextoService.notificarAlteracaoPropriedades();
      },
      error: (erro) => {
        console.error('Falha ao atualizar', erro);
        alert('Erro ao salvar as alterações.');
      }
    });
  }

  iniciarExclusao(prop: any): void {
    this.propriedadeParaExcluir = prop;
    this.exibirDialogExclusao = true;
  }

  executarExclusao(): void {
    if (!this.propriedadeParaExcluir) return;

    this.propriedadesService.deletar(this.propriedadeParaExcluir.id).subscribe({
      next: () => {
        this.mostrarMensagem('Propriedade excluída com sucesso!', 'sucesso');
        this.exibirDialogExclusao = false;
        this.propriedadeParaExcluir = null;
        this.carregarDadosReais();
        this.contextoService.notificarAlteracaoPropriedades();
      },
      error: (err) => {
        console.error(err);
        const mensagemServidor = err.error?.mensagem || err.error?.message || 'Erro ao excluir a propriedade.';
        this.mostrarMensagem(`Erro: ${mensagemServidor}`, 'erro');
        this.exibirDialogExclusao = false;
      }
    });
  }
}