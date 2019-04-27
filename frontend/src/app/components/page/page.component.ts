import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationStart, NavigationEnd } from "@angular/router";
import { SonicCoreComponent } from 'node_modules/sonic-core/src/lib/sonic-core.component';

// import { SafePipe } from "./pipes/safe.pipe";

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {

  constructor(
    private contentService:SonicCoreComponent,
    private route: ActivatedRoute,
    private router: Router) { }

  content:any;
  contentUrl:string;
  sections:any

  ngOnInit() {
    this.loadUrlParam();
  }

  loadUrlParam(){
    // this.router.events.forEach((event) => {
    //   if(event instanceof NavigationStart) {
    //     console.log('NavigationStart', event);
    //   }
    //   // NavigationEnd
    //   // NavigationCancel
    //   // NavigationError
    //   // RoutesRecognized
    // });

    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
            // console.log('NavigationEnd', event);
            this.contentUrl = event.url;
            if(this.contentUrl == '/null'){
              this.contentUrl = '/';
            }
            // console.log('contentUrl', this.contentUrl);
            this.loadPage();
          }
    });

    
  }

  loadPage(){
    // this.contentService.getContentByUrl("page", this.contentUrl).then(data => {
    //   console.log('page data', data[0]);
    //   this.content = data[0];
    //   this.loadSections();
    // });
  }

  loadSections(){
    console.log('layout', this.content.layout);
    // this.contentService.getContentById('5cb1547b3f6d33389f244568').then(data => {
      // this.contentService.getContentByType('section').then(data => {

// this.sections = data;
// console.log('section', this.sections);
//     });
  }

}
