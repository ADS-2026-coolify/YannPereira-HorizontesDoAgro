import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  
  expandido: boolean = true;

  @HostBinding('class.recolhido') get isRecolhido() {
    return !this.expandido;
  }

  alternarTamanho(): void {
    this.expandido = !this.expandido;
  }

  @Input() menuMobileAberto: boolean = false; 
  @Output() fecharMenuMobile = new EventEmitter<void>();

  @HostBinding('class.open') get isOpen() {
    return this.menuMobileAberto;
  }

  aoClicarNoLink(): void {
    this.fecharMenuMobile.emit();
  }
}