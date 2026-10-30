import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { authGuard } from './core/guards/auth.guard';
import { PainelComponent } from './pages/painel/painel.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PropriedadesComponent } from './pages/propriedades/propriedades.component'; 
import { SetoresComponent } from './pages/setores/setores.component'; 
import { EquipamentosComponent } from './pages/equipamentos/equipamentos.component';
import { AtividadesComponent } from './pages/atividades/atividades.component';
import { FuncionariosComponent } from './pages/funcionarios/funcionarios.component';
import { InsumosComponent } from './pages/insumos/insumos.component';
import { ClimaComponent } from './pages/clima/clima.component';
import { DocumentosComponent } from './pages/documentos/documentos.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarComponent },
  { 
    path: 'painel', 
    component: PainelComponent, 
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'propriedades',
        component: PropriedadesComponent 
      },
      {
        path: 'setores',
        component: SetoresComponent
      },
      { 
        path: 'equipamentos', 
        component: EquipamentosComponent 
      },
      { 
        path: 'atividades', 
        component: AtividadesComponent 
      },
      { 
        path: 'funcionarios', 
        component: FuncionariosComponent
      },
      { 
        path: 'insumos', 
        component: InsumosComponent 
      },
      {
        path: 'clima',
        component: ClimaComponent
      },
      {
        path: 'documentos',
        component: DocumentosComponent
      },
    ]
  },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }