import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.css']
})
export class PageBuilderComponent implements OnInit {

  constructor(private pageBuilderService:PageBuilderService,
    private route:ActivatedRoute) { }

  html = '';
  
  ngOnInit() {
    console.log('page builder route', this.route.snapshot);

    this.pageBuilderService.isPageBuilder = true;
    this.loadPage();

    this.pageBuilderService.setIsPageBuilder(true);
  }

  async loadPage(){
    // this.html = '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
    let page : any  = await this.pageBuilderService.getPageById('5cb146f83f6d33389f244564');
    console.log('page777', page);
    this.html = page.html.toString();
    // this.html = '<!DOCTYPE html><html><body><h1>My Second Heading</h1><p>My first paragraph.</p></body></html>';


  }

  ngOnDestroy(){
    this.pageBuilderService.setIsPageBuilder(false);
  }


}
