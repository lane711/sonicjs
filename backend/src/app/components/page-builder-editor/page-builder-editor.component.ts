import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
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
      await this.loadSections(page);

      await this.loadQuill();
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

      $('section span').on("click", function () {
        var id = $(this).data("id");
        console.log('span clicked ' + id);
        $('#block-edit-it').val(id);
        $('#wysiwygModal').appendTo("body").modal('show');

        var content = $(this).html();
        $('.ql-editor').html(content);
      });

      $('.pb-section a').not('.section-edit').on("click", function () {
        $(this).parent().toggleClass('open');
      });

      $(".pb-section").on({
        mouseenter: function () {
          let sectionId = $(this).attr('id');
          $(`section[id='${sectionId}']`).addClass('section-highlight');
        },
        mouseleave: function () {
          let sectionId = $(this).attr('id');
          $(`section[id='${sectionId}']`).removeClass('section-highlight');
        }
      });

      $(".mini-layout .pb-row").on({
        mouseenter: function () {
          let sectionId = $(this).closest('.pb-section').attr('id');
          let rowIndex = $(this).index() + 1;
          $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`).addClass('row-highlight');
        },
        mouseleave: function () {
          let sectionId = $(this).closest('.pb-section').attr('id');
          let rowIndex = $(this).index() + 1;
          $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`).removeClass('row-highlight');
        }
      });


    });
  }

  async loadQuill(){

    $(document).ready(function () {
      var quill = new Quill('#editor-container', {
        modules: {
          // toolbar: [
          //   ['bold', 'italic'],
          //   ['link', 'blockquote', 'code-block', 'image'],
          //   [{ list: 'ordered' }, { list: 'bullet' }]
          // ]
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
      });
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

  async addColumn(sectionId, rowIndex) {
    console.log('adding column ', sectionId, rowIndex);
    let section = await this.contentService.getContentInstance(sectionId) as any;
    console.log('secton', section);
    let column = await this.generateNewColumn();
    section.data.rows[rowIndex].columns.push(column);
    console.log(section.data.rows[rowIndex].columns);
    this.contentService.editContentInstance(section);

    this.fullPageUpdate();
  }

  async generateNewRow() {

    let col = await this.generateNewColumn();

    let row = { class: 'row', columns: [col] }

    return row;
  }

  async deleteSection(sectionId) {
    console.log(`deleting section ${sectionId}`);
    // remove section from page

    const index: number = this.page.data.layout.indexOf(sectionId);
    console.log('index', index);
    if (index !== -1) {
      this.page.data.layout.splice(index, 1);
    }

    let updatedPage = await this.contentService.editContentInstance(this.page);

    //reload sidebar
    this.loadSections(updatedPage);

    //update screen
    $(`section[id="${sectionId}"]`).remove();
    this.loadJQuery();
  }

  async generateNewColumn() {
    let block1 = { contentType: 'block', body: '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>' };

    //save blocks and get the ids
    let b1: any = await this.contentService.createContentInstance(block1);
    let b1ShortCode = `[BLOCK id="${b1.id}"/]`;

    //columns
    let col = { class: 'col', content: `${b1ShortCode}` }
    return col;
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
