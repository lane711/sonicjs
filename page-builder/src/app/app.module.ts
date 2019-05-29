import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppRoutingModule } from "src/app/app-routing.module";

import { PageBuilderComponent } from './page-builder/page-builder.component';

@NgModule({
  declarations: [PageBuilderComponent],
  imports: [BrowserModule, AppRoutingModule],
  entryComponents: [PageBuilderComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const customButton = createCustomElement(PageBuilderComponent, { injector });
    customElements.define('custom-button', customButton);
  }

  ngDoBootstrap() {}
}
