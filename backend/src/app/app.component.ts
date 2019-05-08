import { Component, Injector } from '@angular/core';
import { UiService } from "./services/ui.service";
import { PageBuilderService } from "./services/page-builder.service";

import { createCustomElement } from '@angular/elements';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';

  constructor(
    private uiService: UiService,
    private injector: Injector,
    private pageBuilderService: PageBuilderService 
    // private menuComponent: MenuComponent
  ) { }

  ngOnInit() {
    // const elem = createCustomElement(MenuComponent, {injector: this.injector});
    // customElements.define('app-menu', elem); 
  }
}