import { Component, EventEmitter, Output } from '@angular/core';
import { CategoriaService } from 'src/app/core/services/categoria.service';

@Component({
  selector: 'app-registrar-categoria-dialog',
  templateUrl: './registrar-categoria-dialog.component.html',
  styleUrls: ['./registrar-categoria-dialog.component.scss']
})
export class RegistrarCategoriaDialogComponent {
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<any>();

  nome: string = '';
  descricao: string = '';
  carregando: boolean = false;
  erroValidacao: string | null = null;

  constructor(private categoriaService: CategoriaService) {}

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;
    if (!this.nome.trim()) {
      this.erroValidacao = 'O nome da categoria é obrigatório.';
      return;
    }

    this.carregando = true;
    this.categoriaService.cadastrar({ nome: this.nome.trim(), descricao: this.descricao.trim() || undefined }).subscribe({
      next: (novaCategoria) => {
        this.carregando = false;
        this.salvo.emit(novaCategoria);
        this.fechar.emit();
      },
      error: () => {
        this.carregando = false;
        this.erroValidacao = 'Não foi possível cadastrar a categoria.';
      }
    });
  }
}
