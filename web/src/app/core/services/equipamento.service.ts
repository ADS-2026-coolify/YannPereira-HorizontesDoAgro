import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EquipamentoRequest {
  sitioId: number;
  nome: string;
  tipo: string;
  marcaModelo?: string;
  ano?: number;
  status: string;
  dataAquisicao: string; 
  dataVenda?: string | null;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {

  private apiUrl = environment.apiEquipamentos; 

  constructor(private http: HttpClient) {}

  listarTodos(sitioId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (sitioId) {
      params = params.set('sitioId', sitioId.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  cadastrar(payload: EquipamentoRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  atualizar(id: number, payload: EquipamentoRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}