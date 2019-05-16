import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ContentService } from '../../services/content.service';
import { ShortcodesService } from '../../services/shortcodes.service';
import { ActivatedRoute } from "@angular/router";
// import * as $ from 'jquery';
declare var $ : any;


@Component({
  selector: 'app-page-builder-editor',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css']
})
export class PageBuilderEditorComponent implements OnInit {

  constructor(private pageBuilderService: PageBuilderService,
    private contentService: ContentService,
    private shortcodesService: ShortcodesService,
    private route: ActivatedRoute) { }

  sections = [];
  page: any;
  id: any;
  Quill: any;

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('params', params);
    });


    this.id = this.route.snapshot.paramMap.get("id");
    console.log('page builder editor route', this.id);

    await this.loadSections();

  }

  async loadSections() {
    this.pageBuilderService.currentPageSubject.subscribe(async page => {
      console.log('loadSections', page);
      this.page = page;
      let sectionsIds = page.data.layout;
      for (let sectionId of sectionsIds) {
        let section = await this.contentService.getContentInstance(sectionId) as object;
        await this.processColumnContent(section);
        this.sections.push(section);
      }
      console.log(this.sections)

      //load jquery after html page has been imported
      await this.loadJQuery();

    });
  }

  async loadJQuery() {

    $(document).ready(function () {

      var quill = new Quill('#editor-container', {
        modules: {
          toolbar: [
            ['bold', 'italic'],
            ['link', 'blockquote', 'code-block', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }]
          ]
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
      });

      // $('#wysiwygModalTrigger').on("click", function () {
      //   $('#wysiwygModal').appendTo("body").modal('show');
      //   $('.ql-editor').text('load me here');
      //   // console.log('quill', quill);
      // });

      $('.wysiwyg-save').on("click", function () {
        console.log('saveing wysiwyg');
        // console.log(quill.getContents())
      });

      $('span').on("click", function () {
        var id = $(this).data("id");
        console.log('span clicked ' + id);
        $('#wysiwygModal').appendTo("body").modal('show');

        var content = $(this).html();
        $('.ql-editor').text(content);
      });

    });
  }

  async loadQuill() {
  }

  async processColumnContent(section) {

  }

  async addSection() {
    let block1 = { contentType: 'block', body: 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros.' };
    let block2 = { contentType: 'block', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' };
    let block3 = { contentType: 'block', body: 'Nullam quis risus eget urna mollis ornare vel eu leo.' };

    //save blocks and get the ids
    let b1: any = await this.contentService.createContentInstance(block1);
    let b2: any = await this.contentService.createContentInstance(block2);
    let b3: any = await this.contentService.createContentInstance(block3);

    let b1ShortCode = `[BLOCK id="${b1.id}"/]`;
    let b2ShortCode = `[BLOCK id="${b2.id}"/]`;
    let b3ShortCode = `[BLOCK id="${b3.id}"/]`;

    //columns
    let col1 = { class: 'col', content: `${b1ShortCode}${b2ShortCode}` }
    let col2 = { class: 'col', content: `${b1ShortCode}${b3ShortCode}` }
    let col3 = { class: 'col', content: `${b3ShortCode}` }

    let row1 = { class: 'row', columns: [col1, col2] }
    let row2 = { class: 'row', columns: [col3] }

    //rows
    let rows = [row1, row2];

    //section
    let section = { title: 'Section 1', contentType: 'section', rows: rows };
    let s1: any = await this.contentService.createContentInstance(section);

    //add to current page
    this.page.data.layout = [s1.id];
    this.contentService.editPage(this.page);

  }

  saveContent() {
    //add sections
    this.page.data.layout = [{ sectionId: '123456' }, { sectionId: '345678' }];
    this.contentService.editPage(this.page);
  }

  async insertShortCode() {
    let result = await this.shortcodesService.parseShortCode('[[BLOCK id="12344"]]');
    console.log(result);
  }

  onContentChanged = (event) => {
    console.log(event.html);
  }
}
