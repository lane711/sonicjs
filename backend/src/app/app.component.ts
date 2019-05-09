import { Component, Injector } from '@angular/core';
import { UiService } from "./services/ui.service";
import { PageBuilderService } from "./services/page-builder.service";
import { ActivatedRoute } from "@angular/router";

import { createCustomElement } from '@angular/elements';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  isPageBuilder = true;

  constructor(
    private uiService: UiService,
    private injector: Injector,
    private pageBuilderService: PageBuilderService,
    private route: ActivatedRoute,
    // private menuComponent: MenuComponent
  ) { }

  async ngOnInit() {
    // let url = location.href;
    // if(url.indexOf('page-builder') > -1){
    //   this.isPageBuilder = true;
    // }


    this.route.queryParams.subscribe(params => {
      console.log('route params', params);
    });

  }
}