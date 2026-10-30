import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const dadosLogin = this.loginForm.value;

      this.authService.realizarLogin(dadosLogin).subscribe({
        next: () => {
          this.router.navigate(['/painel']);
        },
        error: (erroHttp) => {
          console.error('Erro detalhado:', erroHttp); 

          let mensagemErro = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

          if (erroHttp.status === 0) {
            mensagemErro = 'Servidor indisponível no momento. Verifique sua conexão ou tente mais tarde.';
          } 
          else if (erroHttp.status === 401 || erroHttp.status === 403 || erroHttp.status === 400) {
            
            if (erroHttp.error && (erroHttp.error.mensagem || erroHttp.error.message)) {
              mensagemErro = erroHttp.error.mensagem || erroHttp.error.message;
            } else if (typeof erroHttp.error === 'string' && erroHttp.error.trim() !== '') {
              mensagemErro = erroHttp.error;
            } else {
              mensagemErro = 'E-mail ou senha incorretos.';
            }
          }

          this.snackBar.open(mensagemErro, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}