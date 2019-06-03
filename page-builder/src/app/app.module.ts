import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppRoutingModule } from "src/app/app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { SafePipe } from "../app/pipes/safe.pipe";

import { PageBuilderComponent } from './page-builder/page-builder.component';

@NgModule({
  declarations: [PageBuilderComponent,
  SafePipe
],
  imports: [BrowserModule, 
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    AngularFontAwesomeModule
  ],
  entryComponents: [PageBuilderComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const pageBuilder = createCustomElement(PageBuilderComponent, { injector });
    customElements.define('page-builder', pageBuilder);
  }

  ngDoBootstrap() {}
}
