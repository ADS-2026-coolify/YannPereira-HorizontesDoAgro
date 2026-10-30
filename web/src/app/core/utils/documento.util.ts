export class DocumentoUtils {
  
  static formatarCep(valor: string): string {
    if (!valor || valor.trim() === '') return '';
    let cep = valor.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.substring(0, 8);
    if (cep.length > 5) cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
    return cep;
  }

  static formatarDocumento(valor: string): string {
    if (!valor || valor.trim() === '') return '';
    let doc = valor.replace(/\D/g, '');
    if (doc.length > 14) doc = doc.substring(0, 14);

    if (doc.length <= 11) {
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      doc = doc.replace(/^(\d{2})(\d)/, '$1.$2');
      doc = doc.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      doc = doc.replace(/\.(\d{3})(\d)/, '.$1/$2');
      doc = doc.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return doc;
  }

  static isDocumentoValido(doc: string): boolean {
    if (!doc) return true; 
    const numeros = doc.replace(/\D/g, ''); 
    if (numeros.length === 11) return this.isCpfValido(numeros);
    if (numeros.length === 14) return this.isCnpjValido(numeros);
    return false; 
  }

  private static isCpfValido(numeros: string): boolean {
    if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(numeros.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(numeros.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(numeros.substring(10, 11));
  }

  private static isCnpjValido(numeros: string): boolean {
    if (numeros.length !== 14 || /^(\d)\1+$/.test(numeros)) return false;
    let tamanho = numeros.length - 2;
    let num = numeros.substring(0, tamanho);
    let digitos = numeros.substring(tamanho);
    let soma = 0, pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(num.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    num = numeros.substring(0, tamanho);
    soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(num.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
  }
}