import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageBuilderComponent implements OnInit {

  constructor(private pageBuilderService:PageBuilderService,
    private route:ActivatedRoute) { }

  html = '';
  id: string;
  
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    console.log('page builder route', this.id);

    // this.pageBuilderService.isPageBuilder = true;
    this.loadPage();

    // this.pageBuilderService.setIsPageBuilder(true);
  }

  async loadPage(){
    // this.html = '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
    // let page : any  = await this.pageBuilderService.getPageById('5cb146f83f6d33389f244564');

    this.pageBuilderService.currentPageSubject.subscribe(page => {
      console.log('this.pageBuilderService.currentPageSubject', page);
      this.html = page.data.html.toString();
    });

    this.pageBuilderService.loadPageIntoSubjectById(this.id);

    // this.html = '<!DOCTYPE html><html><body><h1>My Second Heading</h1><p>My first paragraph.</p></body></html>';


  }

  async loadPageIntoIframe(){
    console.log('loadPageIntoIframe');
    return "ok";
  }

  refresh(){
    this.loadPage();
  }

  ngOnDestroy(){
    this.pageBuilderService.setIsPageBuilder(false);
  }


}
