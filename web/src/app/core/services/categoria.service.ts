import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CategoriaRequest {
  nome: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = environment.apiCategorias;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  cadastrar(payload: CategoriaRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: CategoriaRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
