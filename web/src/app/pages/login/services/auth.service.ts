import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ContextoService } from 'src/app/core/services/contexto.service';

export interface RespostaLogin {
  token: string;
  nome?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'sifeo_token';

  constructor(
    private http: HttpClient,
    private router: Router,
    private contextoService: ContextoService
  ) {}
  
  realizarLogin(credenciais: any): Observable<RespostaLogin> {
    return this.http.post<RespostaLogin>(`${this.baseUrl}/login`, credenciais).pipe(
      tap((resposta: RespostaLogin) => {
        if (resposta && resposta.token) {
          this.armazenarToken(resposta.token);
          if (resposta.nome) {
            localStorage.setItem('sifeo_nome', resposta.nome);
          }
        }
      })
    );
  }

  registrarUsuario(dadosRegistro: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/registrar`, dadosRegistro);
  }

  tokenExpirado(): boolean {
    const token = this.obterToken();
    if (!token) return true;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecodificado = JSON.parse(atob(payloadBase64));
      
      const tempoExpiracao = payloadDecodificado.exp * 1000;
      return Date.now() > tempoExpiracao;
    } catch (e) {
      return true; 
    }
  }

  armazenarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token); 
  }

  obterToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  deslogar(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('sifeo_nome');
    this.contextoService.resetar();
    this.router.navigate(['/login']);
  }
}