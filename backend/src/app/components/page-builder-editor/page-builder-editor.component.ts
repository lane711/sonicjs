import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ContentService } from '../../services/content.service';
import { ShortcodesService } from '../../services/shortcodes.service';

@Component({
  selector: 'app-page-builder-editor',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css']
})
export class PageBuilderEditorComponent implements OnInit {

  constructor(private pageBuilderService: PageBuilderService,
    private contentService: ContentService,
    private shortcodesService: ShortcodesService) { }

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
    let b1 : any = await this.contentService.createContentInstance(block1);
    let b2 : any = await this.contentService.createContentInstance(block2);
    let b3 : any = await this.contentService.createContentInstance(block3);
    
    let b1ShortCode = `[[BLOCK id="${b1.id}"]]`;
    let b2ShortCode = `[[BLOCK id="${b2.id}"]]`;
    let b3ShortCode = `[[BLOCK id="${b3.id}"]]`;

    //columns
    let col1 = {class : 'col', content : `${b1ShortCode}${b2ShortCode}`}
    let col2 = {class : 'col', content : `${b1ShortCode}${b3ShortCode}`}
    let col3 = {class : 'col', content : `${b3ShortCode}`}

    let row1 = {class : 'row', columns : [col1, col2]}
    let row2 = {class : 'row', columns : [col3]}

    //rows
    let rows = [row1, row2];

    //section
    let section = { title: 'Section 1', rows: rows};
    let s1 : any = await this.contentService.createContentInstance(section);

    //add to current page
    this.page.data.layout = [s1.id];
    this.contentService.editPage(this.page);

  }

  saveContent(){
    //add sections
    this.page.data.layout = [{sectionId : '123456'},{ sectionId : '345678'}];
    this.contentService.editPage(this.page);
  }

  async insertShortCode(){
    let result = await this.shortcodesService.parseShortCode('[[BLOCK id="12344"]]');
    console.log(result);
  }
}
