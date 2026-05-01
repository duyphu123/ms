import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoleConfigComponent } from './role-config/role-config.component';
import { CardDrawComponent } from './card-draw/card-draw.component';

@NgModule({
  declarations: [AppComponent, RoleConfigComponent, CardDrawComponent],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
