import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TipoAtividadeService {
  private apiUrl = `${environment.apiUrl}/tipos-atividade`; 

  constructor(private http: HttpClient) {}

  listarPorSitio(sitioId: number): Observable<any[]> {
    const params = new HttpParams().set('sitioId', sitioId.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  cadastrar(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}