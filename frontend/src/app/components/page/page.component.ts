import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationStart, NavigationEnd } from "@angular/router";
import { ContentService } from '../../services/content.service'

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {

  constructor(
    private contentService:ContentService,
    private route: ActivatedRoute,
    private router: Router) { }

  content:any;
  contentUrl:string;

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
            console.log('NavigationEnd', event);
            this.contentUrl = event.url;
            if(this.contentUrl == '/null'){
              this.contentUrl = '/';
            }
            console.log('contentUrl', this.contentUrl);
            this.loadContent();
          }
    });

    
  }

  loadContent(){
    this.contentService.getContentByUrl("page", this.contentUrl).then(data => {
      console.log('page data', data[0]);
      this.content = data[0];
    });
  }

}
