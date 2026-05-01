import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleConfigComponent } from './role-config/role-config.component';
import { CardDrawComponent } from './card-draw/card-draw.component';

const routes: Routes = [
  { path: 'cau-hinh', component: RoleConfigComponent },
  { path: 'chon-bai', component: CardDrawComponent },
  { path: '', redirectTo: 'cau-hinh', pathMatch: 'full' },
  { path: '**', redirectTo: 'cau-hinh' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
