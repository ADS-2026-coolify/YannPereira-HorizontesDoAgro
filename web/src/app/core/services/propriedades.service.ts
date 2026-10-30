import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Setor {
  id: number;
  nome: string;
  hectares: number;
}

export interface Propriedade {
  id: number;
  nome: string;
  cnpj?: string;
  cep: string;
  endereco: string;
  municipio: string;
  uf: string;
  setores: Setor[]; 
  
  hectaresTotais?: number;
  quantidadeSetores?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropriedadesService {

  private readonly API_URL = environment.apiPropriedades;

  constructor(private http: HttpClient) { }

  listarPropriedades(): Observable<Propriedade[]> {
    return this.http.get<Propriedade[]>(this.API_URL);
  }

  criarPropriedade(propriedade: any): Observable<Propriedade> {
    return this.http.post<Propriedade>(this.API_URL, propriedade);
  }

  atualizarPropriedade(id: number, propriedade: any): Observable<Propriedade> {
    return this.http.put<Propriedade>(`${this.API_URL}/${id}`, propriedade);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}