import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AtividadeRequest {
  sitioId: number; 
  setorId: number;
  tipoAtividadeId: number;
  responsavelId: number;
  equipamentoId: number | null; 
  dataAtividade: string;
  status: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  private apiUrl = environment.apiAtividades;

  constructor(private http: HttpClient) {}

  listarTodos(sitioId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (sitioId) {
      params = params.set('sitioId', sitioId.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  cadastrar(payload: AtividadeRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: AtividadeRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}