import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DocumentoRequest {
  sitioId: number;
  categoriaId: number;
  tipoVinculo?: string | null;
  vinculoId?: number | null;
  nome: string;
  descricao?: string;
  dataAdicionado: string;
  receitaDespesa: boolean;
  valor: number;
  arquivoBase64?: string;
  nomeArquivo?: string;
  tipoArquivo?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private apiUrl = environment.apiDocumentos;

  constructor(private http: HttpClient) {}

  listarPorSitio(sitioId: number): Observable<any[]> {
    const params = new HttpParams().set('sitioId', sitioId.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  cadastrar(payload: DocumentoRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: DocumentoRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  baixarArquivo(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/arquivo`, { responseType: 'blob' });
  }
}
