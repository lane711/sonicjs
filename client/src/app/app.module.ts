import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";
import { ContentTypesComponent } from "./components/content-types/content-types.component";
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { ContentComponent } from "./components/content/content.component";
import { AdminSideMenuComponent } from "./components/admin-side-menu/admin-side-menu.component";
import { HomeComponent } from "./components/home/home.component";
import { FieldTypesComponent } from "./components/field-types/field-types.component";
import { SafePipe } from './pipes/safe.pipe';
import { ContentTypeEditComponent } from './components/content-type-edit/content-type-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    ContentTypesComponent,
    ContentComponent,
    AdminSideMenuComponent,
    HomeComponent,
    FieldTypesComponent,
    SafePipe,
    ContentTypeEditComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
