import { Component, Injector } from '@angular/core';
import { UiService } from "./services/ui.service";
import { PageBuilderService } from "./services/page-builder.service";
import { ActivatedRoute } from "@angular/router";

import { createCustomElement } from '@angular/elements';
declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  isPageBuilder = false;

  constructor(
    private uiService: UiService,
    private injector: Injector,
    private pageBuilderService: PageBuilderService,
    private route: ActivatedRoute,
    // private menuComponent: MenuComponent
  ) { }

  ngOnInit() {
    // let url = location.href;
    // if(url.indexOf('page-builder') > -1){
    //   this.isPageBuilder = true;
    // }
    // console.log('page builder isPageBuilder', this.pageBuilderService.isPageBuilder);

    // console.log('snap', this.route.snapshot.paramMap.get("id"))

    // this.route.queryParams.subscribe(params => {
    //   console.log('rout subs', params);
    //   });

    // this.route.queryParams.subscribe(params => {
    //   console.log('route params', params);
    // });

    // this.pageBuilderService.isPageBuilderChanged.subscribe(data => {
    //   console.log('app components isPageBuilderChanged', data);
    //   this.isPageBuilder = data;
    // });

    this.setupTinyMCE();
  }

  setupTinyMCE(){
    window.tinyMCE.overrideDefaults({
      base_url: '/admin/tinymce/',  // Base for assets such as skins, themes and plugins
      suffix: '.min'          // This will make Tiny load minified versions of all its assets
    });
  }
}