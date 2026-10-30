import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private readonly apiUrl = `${environment.apiUsuario}`;

  constructor(private http: HttpClient) {}

  obterPerfilAtual(): Observable<any> {
    return this.http.get(`${this.apiUrl}/informacao`);
  }

  atualizarPerfil(dados: any) {
    return this.http.put(`${this.apiUrl}/perfil`, dados);
  }
}