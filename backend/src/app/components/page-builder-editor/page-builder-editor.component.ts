import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';
import { ContentService } from '../../services/content.service';
import { ShortcodesService } from '../../services/shortcodes.service';
import { ActivatedRoute } from "@angular/router";
// import * as $ from 'jquery';
declare var $: any;
import * as Quill from 'node_modules/quill/dist/quill.js';



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
  quill: any;

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('params', params);
    });


    this.id = this.route.snapshot.paramMap.get("id");
    console.log('page builder editor route', this.id);

    await this.loadSectionsSubscription();

  }

  async loadSectionsSubscription() {
    this.pageBuilderService.currentPageSubject.subscribe(async page => {
      console.log('loadSections', page);
      this.page = page;
      this.loadSections(page);

      //load jquery after html page has been imported
      await this.loadJQuery();

    });
  }

  async loadSections(page) {
    this.sections = [];
    if (page.data.layout) {
      let sectionsIds = page.data.layout;
      for (let sectionId of sectionsIds) {
        let section = await this.contentService.getContentInstance(sectionId) as object;
        await this.processColumnContent(section);
        this.sections.push(section);
      }
      console.log(this.sections)
    }
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



      $('section span').on("click", function () {
        var id = $(this).data("id");
        console.log('span clicked ' + id);
        $('#block-edit-it').val(id);
        $('#wysiwygModal').appendTo("body").modal('show');

        var content = $(this).html();
        $('.ql-editor').html(content);
      });

      // $('.wysiwyg-save').on("click", function () {

      //   //         var delta = editor.getContents();
      //   // var text = editor.getText();
      //   // var justHtml = editor.root.innerHTML;
      //   let id = $('#block-edit-it').val();
      //   console.log('saving ' + id);
      //   let content = quill.root.innerHTML;
      //   let block = this.contentService.getContentInstance(id).then(block => {
      //     console.log('editing...', block);

      //   });

      //   console.log(content);
      // });
    });
  }

  async saveWYSIWYG() {
    let id = $('#block-edit-it').val();
    console.log('saving ' + id);
    let content = $('.ql-editor').html();
    console.log('content', content);

    //update db
    let block = await this.contentService.getContentInstance(id) as any;
    block.data.body = content;
    this.contentService.editContentInstance(block);

    //update screen
    $(`span[data-id="${id}"]`).html(content);
  }

  async loadQuill() {
  }

  async processColumnContent(section) {

  }

  async addSection() {

    let row = await this.generateNewRow();
    //rows
    let rows = [row];

    //section
    let nextSectionCount = 1;
    if (this.page.data.layout) {
      nextSectionCount = this.page.data.layout.length + 1;
    }

    let section = { title: `Section ${nextSectionCount}`, contentType: 'section', rows: rows };
    let s1: any = await this.contentService.createContentInstance(section);

    //add to current page
    if (!this.page.data.layout) {
      this.page.data.layout = []
    }
    this.page.data.layout.push(s1.id);

    // this.contentService.editPage(this.page);
    let updatedPage = await this.contentService.editContentInstance(this.page);


    //update ui
    // this.fullPageUpdate();
    this.loadSections(updatedPage);
  }

  async fullPageUpdate() {
    this.sections = [];
    this.pageBuilderService.loadPageIntoSubjectById(this.page.id);
  }



  async addRow(sectionId) {
    console.log('adding row to section: ' + sectionId);
    let row = await this.generateNewRow();

    let section = await this.contentService.getContentInstance(sectionId) as any;
    section.data.rows.push(row);
    this.contentService.editContentInstance(section);

    this.fullPageUpdate();
  }

  async generateNewRow() {
    let block1 = { contentType: 'block', body: '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>' };

    //save blocks and get the ids
    let b1: any = await this.contentService.createContentInstance(block1);
    let b1ShortCode = `[BLOCK id="${b1.id}"/]`;

    //columns
    let col1 = { class: 'col', content: `${b1ShortCode}` }

    let row = { class: 'row', columns: [col1] }

    return row;
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
