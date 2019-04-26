import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from 'projects/sonic-core/src/lib/components/menu/menu.component';
import { HeaderComponent } from 'projects/sonic-core/src/lib/components/header/header.component';
import { FooterComponent } from 'projects/sonic-core/src/lib/components/footer/footer.component';
import { SectionComponent } from 'projects/sonic-core/src/lib/components/section/section.component';
import { PageComponent } from 'projects/sonic-core/src/lib/components/page/page.component';
import { WysiwygComponent } from 'projects/sonic-core/src/lib/components/wysiwyg/wysiwyg.component';
import { SafePipe } from "./pipes/safe.pipe";

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HeaderComponent,
    FooterComponent,
    SectionComponent,
    PageComponent,
    WysiwygComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
