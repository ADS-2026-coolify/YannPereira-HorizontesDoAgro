import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { ContextoService } from '../../../core/services/contexto.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-registrar-funcionario-dialog',
  templateUrl: './registrar-funcionario-dialog.component.html',
  styleUrls: ['./registrar-funcionario-dialog.component.scss']
})
export class RegistrarFuncionarioDialogComponent implements OnInit {

  @Input() funcionarioEdicao: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  carregando: boolean = false;
  erroValidacao: string | null = null;
  idSitioAtual: number | null = null;
  isEdicao: boolean = false;

  dadosFuncionario: any = {
    nomeCompleto: '', cpf: '', telefone: '', email: '',
    cargo: '', dataAdmissao: '', dataNascimento: '', status: 'ATIVO'
  };

  constructor(
    private funcionarioService: FuncionarioService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();

    if (this.funcionarioEdicao) {
      this.isEdicao = true;
      this.dadosFuncionario = { ...this.funcionarioEdicao };
    }
  }

  cancelar(): void {
    this.fechar.emit();
  }

  emailValido(): boolean {
    return EMAIL_REGEX.test(this.dadosFuncionario.email);
  }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.idSitioAtual) {
      this.erroValidacao = 'Alerta: Nenhuma propriedade está selecionada na navegação superior.';
      return;
    }

    if (!this.dadosFuncionario.nomeCompleto || !this.dadosFuncionario.cargo || !this.dadosFuncionario.dataAdmissao) {
      this.erroValidacao = 'Preencha todos os campos obrigatórios (*).';
      return;
    }

    if (this.dadosFuncionario.email && !this.emailValido()) {
      this.erroValidacao = 'Informe um e-mail válido.';
      return;
    }

    const payload = { ...this.dadosFuncionario, sitioId: this.idSitioAtual };
    this.carregando = true;

    if (this.isEdicao) {
      this.funcionarioService.atualizar(this.funcionarioEdicao.id, payload).subscribe({
        next: () => {
          this.carregando = false;
          this.salvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error('Erro ao editar:', erro);
          this.erroValidacao = erro?.error?.mensagem || erro?.error?.message || 'Erro ao atualizar os dados.';
        }
      });
    } else {
      this.funcionarioService.cadastrar(payload).subscribe({
        next: () => {
          this.carregando = false;
          this.salvo.emit();
          this.fechar.emit();
        },
        error: (erro: any) => {
          this.carregando = false;
          console.error('Erro ao cadastrar:', erro);
          this.erroValidacao = erro?.error?.mensagem || erro?.error?.message || 'Erro ao salvar o funcionário.';
        }
      });
    }
  }
}
