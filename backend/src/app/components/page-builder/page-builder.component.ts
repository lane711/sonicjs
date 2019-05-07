import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service'
@Component({
  selector: 'app-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.css']
})
export class PageBuilderComponent implements OnInit {

  constructor(private pageBuilderService:PageBuilderService) { }

  html = '';
  
  ngOnInit() {
    this.loadPage();
  }

  async loadPage(){
    this.html = '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
    let page = await this.pageBuilderService.getPageById('5cb146f83f6d33389f244564');
    console.log('page777', page);
  }

}
