import { Component, EventEmitter, Output } from '@angular/core';
import { DocumentoUtils } from 'src/app/core/utils/documento.util';

@Component({
  selector: 'app-registro-propriedade-dialog',
  templateUrl: './registro-propriedade-dialog.component.html',
  styleUrls: ['./registro-propriedade-dialog.component.scss']
})
export class RegistroPropriedadeDialogComponent {

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();

  erroValidacao: string | null = null;

  novaPropriedade = {
    nome: '',
    cnpj: '',
    cep: '',
    endereco: '',
    municipio: '',
    uf: ''
  };

  cancelar(): void {
    this.fechar.emit();
  }

  onCepChange(valor: string): void {
    this.novaPropriedade.cep = DocumentoUtils.formatarCep(valor);
  }

  onDocumentoChange(valor: string): void {
    this.novaPropriedade.cnpj = DocumentoUtils.formatarDocumento(valor);
  }

  confirmar(): void {
    this.erroValidacao = null;

    if (!this.novaPropriedade.nome || !this.novaPropriedade.municipio || !this.novaPropriedade.uf) {
      this.erroValidacao = 'Preencha os campos obrigatórios (Nome, Município e UF)!';
      return;
    }

    if (this.novaPropriedade.cnpj && !DocumentoUtils.isDocumentoValido(this.novaPropriedade.cnpj)) {
      this.erroValidacao = 'O CPF ou CNPJ informado é inválido. Verifique os números digitados.';
      return;
    }

    if (this.novaPropriedade.cep) {
      const cepLimpo = this.novaPropriedade.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8 || /^(\d)\1+$/.test(cepLimpo)) {
        this.erroValidacao = 'Formato de CEP inválido ou incompleto.';
        return;
      }
    }

    this.salvar.emit(this.novaPropriedade);
  }
}