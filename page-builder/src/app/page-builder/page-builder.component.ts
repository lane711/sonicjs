import {
  Input,
  Component,
  ViewEncapsulation,
  EventEmitter,
  Output,
  OnInit,
  AfterViewInit,
  ElementRef, 
  ViewChild,
  TemplateRef,
  Renderer
} from '@angular/core';

import { ContentService } from '../services/content.service';
import { ShortcodesService } from '../services/shortcodes.service';
import { PageBuilderService } from '../services/page-builder.service';

declare var $: any;
declare var tinyMCE: any;
declare var tinymce: any;

@Component({
  selector: 'page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.css'],
  encapsulation: ViewEncapsulation.Native
})
export class PageBuilderComponent implements OnInit, AfterViewInit {
  @ViewChild("tref", {read: ElementRef}) tref: ElementRef;
  @ViewChild("tpl") tpl: TemplateRef<any>;
  @Input() label = 'default label';
  @Output() action = new EventEmitter<number>();
  private clicksCt = 0;
  timestamp : any;
  sections = [];
  page: any;
  id: any;
  dataModel = "ipsum de lor";
  public isCollapsed: boolean[] = [];
  html:any;

  constructor(
    private pageBuilderService: PageBuilderService,
    private contentService: ContentService,
    private shortcodesService: ShortcodesService,
    private elRef:ElementRef,
    private renderer: Renderer
    ) {

     }

    async ngOnInit() {
      this.jQueryTest();

      this.collapseAllSections();

      this.id = await this.getPageId();

      this.getPage();

    }

    ngAfterViewInit(): void {

      let cols = this.elRef.nativeElement.querySelector('.mini-layout');
      console.log('cols', cols);

      // outputs `I am span`
      // this.tref.nativeElement.textContent = 'my class';
      this.tref.nativeElement.className = 'opened';
      console.log('tref', this.tref);

      // let elementRef = this.tpl.elementRef;
      // // outputs `template bindings={}`
      // console.log(elementRef.nativeElement.textContent);
  }

    async collapseAllSections(){
      for (let index = 0; index < 20; index++) {
        this.isCollapsed[index] = true;
      }
    }

    async getPageId(){
      let id = $('#page-id').val();
        return id;
    }

    menuToggle(event:any) {
      this.renderer.setElementClass(event.target,"opened",true);
      this.renderer.setElementClass(this.tref,"opened",true);

  }

    async getPage() {
      console.log('getPage', this.id);
        let page = await this.contentService.getPageById(this.id) as any;
        this.page = page.data;
        // console.log('page==>', this.page);
        await this.loadSections(this.page);

        // this.html = page.data.data.html;
        // console.log('html', page.data.data);

        //load jquery after html page has been imported
        await this.loadJQuery();
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
        // console.log('sections->', this.sections)
      }
    }

    jQueryTest(){

      // let elementList = this.elRef.nativeElement.querySelectorAll('.page-builder-nav');
      // console.log('elementList', elementList);
    //   window.onload = function() {
    //     if (window.jQuery) {  
    //         // jQuery is loaded  
    //         alert("Yeah!");
    //     } else {
    //         // jQuery is not loaded
    //         alert("Doesn't Work");
    //     }
    // }


      $('.refresh').click(function(){
        alert('ref');
      });
    }
  
    hoverRow(sectionId, show){
      console.log('hover', sectionId, show);

      $(`section[id='${sectionId}']`).addClass('section-highlight');
    }

    async loadJQuery() {
  
      console.log('loadJQuery');
      $(document).ready(function () {
  

        $('section span').on("click", function () {
          var id = $(this).data("id");
          console.log('span clicked ' + id);
          $('#block-edit-it').val(id);
          $('#wysiwygModal').appendTo("body").modal('show');
  
          var content = $(this).html();
          $('textarea.wysiwyg-content').html(content);
  
          // $(document).off('focusin.modal');
          //allow user to interact with tinymcs dialogs: https://stackoverflow.com/questions/36279941/using-tinymce-in-a-modal-dialog
          $(document).on('focusin', function(e) {
            if ($(e.target).closest(".tox-dialog").length) {
              // e.stopImmediatePropagation();
            }
          });
  
  
          tinymce.remove(); //remove previous editor
          // tinymce.baseURL = '/tinymce/';
          // console.log('tinymce.base_url',tinymce.baseURL);
          //plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount tinymcespellchecker a11ychecker imagetools textpattern help formatpainter permanentpen pageembed tinycomments mentions linkchecker',
  
          $('textarea.wysiwyg-content').tinymce({
            selector: '#block-content',
            height: 600,
            plugins: 'image imagetools',
            toolbar: 'formatselect | bold italic strikethrough forecolor backcolor permanentpen formatpainter | link image media pageembed | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | addcomment',
            image_advtab: false,
            image_list: [
              {title: 'My image 1', value: 'https://www.tinymce.com/my1.gif'},
              {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
            ],
            // images_upload_url: 'http://localhost:3000/api/containers/container1/upload',
            automatic_uploads: true,
            images_upload_handler: function (blobInfo, success, failure) {
              var xhr, formData;
      
              xhr = new XMLHttpRequest();
              xhr.withCredentials = false;
              xhr.open('POST', "/api/containers/container1/upload");
  
              xhr.onload = function() {
                  var json;
      
                  if (xhr.status != 200) {
                      failure("HTTP Error: " + xhr.status);
                      return;
                  }
      
                  json = JSON.parse(xhr.responseText);
                  var file = json.result.files.file[0];
                  var location = `/api/containers/${file.container}/download/${file.name}`;
                  if (!location) {
                      failure("Invalid JSON: " + xhr.responseText);
                      return;
                  }
      
                  success(location);
              };
      
              formData = new FormData();
              formData.append('file', blobInfo.blob(), blobInfo.filename());
      
              xhr.send(formData);
          }
         });
        });
  
        $('.pb-section a').not('.section-edit').on("click", function () {
          $(this).parent().toggleClass('open');
        });
  
        $(".pb-section").on({
          mouseenter: function () {
            let sectionId = $(this).attr('id');
            console.log('mouseenter', sectionId);
            $(`section[id='${sectionId}']`).addClass('section-highlight');
          },
          mouseleave: function () {
            let sectionId = $(this).attr('id');
            console.log('mouseleave', sectionId);
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
  
        //TODO: there is an occiasional bug where the user has to click twice to show popover
        //TODO: after add/remove section, popovers no longer work (refresh required)
        $('.section-edit').on("click", function (event) {
          let popoverId = $(this).attr('id');
          let popoverSelector = `#ngb-popover-${popoverId}`;
  
          //close other popovers
          $('.popover').not(popoverSelector).hide();
          $(popoverSelector).show();
          // event.stopPropagation();
        });
  
  
      });
    }
  
    async saveWYSIWYG() {
      let id = $('#block-edit-it').val();
      console.log('saving ' + id);
  
      let content = $('textarea.wysiwyg-content').html();
  
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
      // this.loadSections(updatedPage);
      this.refreshPage(updatedPage);
    }
  
    async refreshPage(updatedPage){
      await this.loadSections(updatedPage);
      this.loadJQuery();
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
      // this.loadSections(updatedPage);
  
      //update screen
      $(`section[id="${sectionId}"]`).remove();
      
      this.refreshPage(updatedPage);
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
  
    setSectionBackground(sectionId, backgroundType){
      console.log('setting ' + sectionId + ' ' + backgroundType);
      $(`section[id='${sectionId}']`).css('background','green');
  
    }

    refresh(){
      
    }
}
