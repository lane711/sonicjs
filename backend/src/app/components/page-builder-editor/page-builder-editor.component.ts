import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-page-builder-editor',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css']
})
export class PageBuilderEditorComponent implements OnInit {

  constructor(private pageBuilderService: PageBuilderService,
    private contentService: ContentService) { }

  sections: any;
  page: any;
  ngOnInit() {
    this.loadSections();
  }

  loadSections(){
    this.pageBuilderService.currentPageSubject.subscribe(page => {
      console.log('loadSections', page);
      this.page = page;
      this.sections = page.data.layout;
      // this.html = data.html.toString();
    });
  }

  async addSection(){
    let block1 = {contentType: 'block', body : 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros.'};
    let block2 = {contentType: 'block', body : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'};
    let block3 = {contentType: 'block', body : 'Nullam quis risus eget urna mollis ornare vel eu leo.'};

    //save blocks and get the ids
    let b1 = await this.contentService.createContentInstance(block1);
console.log(b1);
    // let row1 = {class : 'col', blocks : [block1, block2]}
    // let row2 = {class : 'col', blocks : [block3]}

    // let rows = [row1, row2];

    // let section = { title: 'Section 1', rows: rows};
  }

  saveContent(){
    //add sections
    this.page.data.layout = [{sectionId : '123456'},{ sectionId : '345678'}];
    this.contentService.editPage(this.page);
  }
}
