import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextoService {
  private static readonly CHAVE_STORAGE = 'sifeo_propriedade_atual';

  private propriedadeSelecionadaSource = new BehaviorSubject<number | null>(this.carregarDoStorage());
  propriedadeAtual$ = this.propriedadeSelecionadaSource.asObservable();

  private propriedadesAlteradasSource = new Subject<void>();
  propriedadesAlteradas$ = this.propriedadesAlteradasSource.asObservable();

  constructor() { }

  private carregarDoStorage(): number | null {
    const valor = localStorage.getItem(ContextoService.CHAVE_STORAGE);
    return valor ? Number(valor) : null;
  }

  mudarPropriedade(id: number | null): void {
    const valorFinal = id === null ? null : Number(id);

    if (valorFinal === null) {
      localStorage.removeItem(ContextoService.CHAVE_STORAGE);
    } else {
      localStorage.setItem(ContextoService.CHAVE_STORAGE, String(valorFinal));
    }

    this.propriedadeSelecionadaSource.next(valorFinal);
  }

  getPropriedadeAtual(): number | null {
    return this.propriedadeSelecionadaSource.getValue();
  }

  notificarAlteracaoPropriedades(): void {
    this.propriedadesAlteradasSource.next();
  }

  resetar(): void {
    localStorage.removeItem(ContextoService.CHAVE_STORAGE);
    this.propriedadeSelecionadaSource.next(null);
  }
}
