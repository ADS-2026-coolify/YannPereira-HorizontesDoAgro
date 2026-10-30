import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../login/services/auth.service';

export const senhasIguaisValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const senha = control.get('senha')?.value;
  const confirmarSenha = control.get('confirmarSenha')?.value;

  return senha && confirmarSenha && senha !== confirmarSenha ? { senhasDiferentes: true } : null;
};

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.scss']
})
export class RegistrarComponent {
  registroForm: FormGroup;
  hideSenha = true;
  hideConfirmarSenha = true; 
  carregando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registroForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      nomeUsuario:  ['', [Validators.required, Validators.minLength(3)]],
      cpf:          ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      email:        ['', [Validators.required, Validators.email]],
      senha:        ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: senhasIguaisValidator }); 
  }

  onSubmit(): void {
    if (this.registroForm.invalid) return;

    this.carregando = true;

    const { confirmarSenha, ...dadosParaEnvio } = this.registroForm.value;
    
    this.authService.registrarUsuario(dadosParaEnvio).subscribe({
      next: () => {
        this.snackBar.open('Conta criada com sucesso! Faça seu login.', 'Fechar', { duration: 4000 });
        this.router.navigate(['/login']); 
      },
      error: (erroHttp) => {
        this.carregando = false;
        let mensagem = 'Erro ao processar o cadastro. Tente novamente.';

        if (erroHttp.error?.mensagem || erroHttp.error?.message) {
          mensagem = erroHttp.error.mensagem || erroHttp.error.message;
        }

        this.snackBar.open(mensagem, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}