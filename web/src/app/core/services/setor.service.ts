import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SetorRequest {
  sitioId: number;
  nome: string;
  hectares: number;
  plantio?: string;
  observacoes?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SetorService {
  
  private apiUrl = `${environment.apiUrl}/setores`;

  constructor(private http: HttpClient) {}

  cadastrar(setor: SetorRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, setor);
  }

  listarPorSitio(sitioId: number): Observable<any[]> {
    const params = new HttpParams().set('sitioId', sitioId.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  atualizar(id: number, setor: SetorRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, setor);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}