import { Component } from '@angular/core';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.scss']
})
export class PainelComponent {
  menuAberto: boolean = false; 

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }
}