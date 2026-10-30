import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClimaService } from '../../../core/services/clima.service';
import { ContextoService } from '../../../core/services/contexto.service';

@Component({
  selector: 'app-registrar-clima-dialog',
  templateUrl: './registrar-clima-dialog.component.html',
  styleUrls: ['./registrar-clima-dialog.component.scss']
})
export class RegistrarClimaDialogComponent implements OnInit {
  @Input() climaEdicao: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() salvo = new EventEmitter<void>();

  carregando: boolean = false;
  erroValidacao: string | null = null;
  idSitioAtual: number | null = null;
  isEdicao: boolean = false;

  dadosClima: any = {
    dataHora: '',
    tempo: 'ENSOLARADO',
    milimetros: 0,
    descricao: ''
  };

  constructor(
    private climaService: ClimaService,
    private contextoService: ContextoService
  ) {}

  ngOnInit(): void {
    this.idSitioAtual = this.contextoService.getPropriedadeAtual();
    
    if (this.climaEdicao) {
      this.isEdicao = true;
      this.dadosClima = { ...this.climaEdicao };
      
      if (this.dadosClima.dataHora) {
        this.dadosClima.dataHora = this.dadosClima.dataHora.substring(0, 16);
      }
    } else {
      const agora = new Date();
      agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
      this.dadosClima.dataHora = agora.toISOString().substring(0, 16);
    }
  }

  cancelar(): void { this.fechar.emit(); }

  confirmar(): void {
    this.erroValidacao = null;
    if (!this.idSitioAtual) {
      this.erroValidacao = 'Alerta: Nenhuma propriedade está selecionada.';
      return;
    }
    if (!this.dadosClima.dataHora || !this.dadosClima.tempo) {
      this.erroValidacao = 'Preencha todos os campos obrigatórios (*).';
      return;
    }

    const payload = { ...this.dadosClima, sitioId: this.idSitioAtual };
    this.carregando = true;

    if (this.isEdicao) {
      this.climaService.atualizar(this.climaEdicao.id, payload).subscribe({
        next: () => { this.salvo.emit(); this.fechar.emit(); },
        error: () => { this.carregando = false; this.erroValidacao = 'Erro ao atualizar clima.'; }
      });
    } else {
      this.climaService.cadastrar(payload).subscribe({
        next: () => { this.salvo.emit(); this.fechar.emit(); },
        error: () => { this.carregando = false; this.erroValidacao = 'Erro ao salvar clima.'; }
      });
    }
  }
}