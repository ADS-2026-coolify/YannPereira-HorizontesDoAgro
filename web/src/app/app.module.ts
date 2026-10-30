import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { JwtInterceptor } from './core/interceptors/jwt.interceptor'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar'; 

import { LoginComponent } from './pages/login/login.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { PainelComponent } from './pages/painel/painel.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { TopbarComponent } from './core/components/topbar/topbar.component';
import { PropriedadesComponent } from './pages/propriedades/propriedades.component';
import { RegistroPropriedadeDialogComponent } from './pages/propriedades/dialogs/registro-propriedade-dialog/registro-propriedade-dialog.component';
import { DetalhesPropriedadeDialogComponent } from './pages/propriedades/dialogs/detalhes-propriedade-dialog/detalhes-propriedade-dialog.component';
import { ConfirmarExclusaoDialogComponent } from './pages/propriedades/dialogs/confirmar-exclusao-dialog/confirmar-exclusao-dialog.component';
import { EditarPerfilDialogComponent } from './core/components/topbar/dialogs/editar-perfil-dialog/editar-perfil-dialog.component';
import { SetoresComponent } from './pages/setores/setores.component';
import { CadastrarSetorDialogComponent } from './core/components/dialogs/cadastrar-setor-dialog/cadastrar-setor-dialog.component';
import { ConfirmDialogComponent } from './core/components/dialogs/confirm-dialog/confirm-dialog.component';
import { EquipamentosComponent } from './pages/equipamentos/equipamentos.component';
import { CadastrarEquipamentoDialogComponent } from './core/components/dialogs/cadastrar-equipamento-dialog/cadastrar-equipamento-dialog.component';
import { AtividadesComponent } from './pages/atividades/atividades.component';
import { RegistrarAtividadeDialogComponent } from './core/components/dialogs/registrar-atividade-dialog/registrar-atividade-dialog.component';
import { FuncionariosComponent } from './pages/funcionarios/funcionarios.component';
import { RegistrarFuncionarioDialogComponent } from './pages/funcionarios/registrar-funcionario-dialog/registrar-funcionario-dialog.component';
import { InsumosComponent } from './pages/insumos/insumos.component';
import { RegistrarInsumoDialogComponent } from './pages/insumos/registrar-insumo-dialog/registrar-insumo-dialog.component';
import { ClimaComponent } from './pages/clima/clima.component';
import { RegistrarClimaDialogComponent } from './pages/clima/registrar-clima-dialog/registrar-clima-dialog.component';
import { RegistrarTipoDialogComponent } from './pages/atividades/registrar-tipo-dialog/registrar-tipo-dialog.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DocumentosComponent } from './pages/documentos/documentos.component';
import { CadastrarDocumentoDialogComponent } from './pages/documentos/cadastrar-documento-dialog/cadastrar-documento-dialog.component';
import { RegistrarCategoriaDialogComponent } from './pages/documentos/registrar-categoria-dialog/registrar-categoria-dialog.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrarComponent,
    PainelComponent,
    SidebarComponent,
    TopbarComponent,
    PropriedadesComponent,
    RegistroPropriedadeDialogComponent,
    DetalhesPropriedadeDialogComponent,
    ConfirmarExclusaoDialogComponent,
    EditarPerfilDialogComponent,
    SetoresComponent,
    CadastrarSetorDialogComponent,
    ConfirmDialogComponent,
    EquipamentosComponent,
    CadastrarEquipamentoDialogComponent,
    AtividadesComponent,
    RegistrarAtividadeDialogComponent,
    FuncionariosComponent,
    RegistrarFuncionarioDialogComponent,
    InsumosComponent,
    RegistrarInsumoDialogComponent,
    ClimaComponent,
    RegistrarClimaDialogComponent,
    RegistrarTipoDialogComponent,
    DashboardComponent,
    DocumentosComponent,
    CadastrarDocumentoDialogComponent,
    RegistrarCategoriaDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    HttpClientModule,
    MatSnackBarModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    FormsModule
  ],
  providers: [
  provideEnvironmentNgxMask(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }