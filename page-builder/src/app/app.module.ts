import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppRoutingModule } from "src/app/app-routing.module";
import { HttpClientModule } from "@angular/common/http";

// import { SafePipe } from "node_modules/sonic-core/src/lib/pipes/safe.pipe";

import { PageBuilderComponent } from './page-builder/page-builder.component';

@NgModule({
  declarations: [PageBuilderComponent],
  imports: [BrowserModule, 
    AppRoutingModule,
    HttpClientModule
  ],
  entryComponents: [PageBuilderComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const customButton = createCustomElement(PageBuilderComponent, { injector });
    customElements.define('custom-button', customButton);
  }

  ngDoBootstrap() {}
}
