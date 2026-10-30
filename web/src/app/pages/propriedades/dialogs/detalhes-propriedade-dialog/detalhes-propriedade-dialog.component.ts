import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Propriedade } from 'src/app/core/services/propriedades.service';
import { DocumentoUtils } from 'src/app/core/utils/documento.util';

@Component({
  selector: 'app-detalhes-propriedade-dialog',
  templateUrl: './detalhes-propriedade-dialog.component.html',
  styleUrls: ['./detalhes-propriedade-dialog.component.scss']
})
export class DetalhesPropriedadeDialogComponent implements OnInit {

  @Input() propriedade!: Propriedade;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();

  dadosEdicao: any = {};
  erroValidacao: string | null = null;

  ngOnInit(): void {
    this.dadosEdicao = { ...this.propriedade };

    if (this.dadosEdicao.cep) {
      this.dadosEdicao.cep = DocumentoUtils.formatarCep(this.dadosEdicao.cep);
    }

    if (this.dadosEdicao.cnpj) {
      this.dadosEdicao.cnpj = DocumentoUtils.formatarDocumento(this.dadosEdicao.cnpj);
    }
  }

  cancelar(): void {
    this.fechar.emit();
  }

  onCepChange(valor: string): void {
    this.dadosEdicao.cep = DocumentoUtils.formatarCep(valor);
  }

  onDocumentoChange(valor: string): void {
    this.dadosEdicao.cnpj = DocumentoUtils.formatarDocumento(valor);
  }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.dadosEdicao.nome || !this.dadosEdicao.municipio || !this.dadosEdicao.uf) {
      this.erroValidacao = 'Preencha os campos obrigatórios (Nome, Município e UF)!';
      return;
    }

    if (this.dadosEdicao.cnpj && !DocumentoUtils.isDocumentoValido(this.dadosEdicao.cnpj)) {
      this.erroValidacao = 'O CPF ou CNPJ informado é inválido. Verifique os números digitados.';
      return;
    }

    if (this.dadosEdicao.cep) {
      const cepLimpo = this.dadosEdicao.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8 || /^(\d)\1+$/.test(cepLimpo)) {
        this.erroValidacao = 'Formato de CEP inválido ou incompleto.';
        return;
      }
    }

    this.salvar.emit(this.dadosEdicao);
  }
}