import { Component, OnInit, Input } from '@angular/core';
import { ContentService } from 'projects/sonic-core/src/lib/services/content.service'

declare var $: any;

@Component({
  selector: 'app-wysiwyg',
  templateUrl: './wysiwyg.component.html',
  styleUrls: ['./wysiwyg.component.css']
})


export class WysiwygComponent implements OnInit {
  
  @Input()
  sectionId: string;

  @Input()
  onSubmitHandler: any;

  showSaveControls: boolean = false;

  constructor(private contentService:ContentService) { }

  ngOnInit(){
    // console.log('main this', this);
    this.setupJqueryFunctions();
  }

  setupJqueryFunctions(){
    $(document).ready(() => {
      this.setupGridEditor(`#layout-builder-${this.sectionId}`);
    });

  }

  setupGridEditor(gridElem){
    var self = this;

      $(gridElem).gridEditor({
        new_row_layouts: [[12], [6, 6], [4, 4, 4], [3, 3, 3, 3], [9, 3], [3, 9]],
        content_types: ['summernote'],
        summernote: {
          config: {
            callbacks: {
              onInit: () => {
                var element = this;
                // console.log('init done element:', element);
                $(`.${self.sectionId}-save`).show();
              }
            }
          }
        }
      });
  }
  
  setupSummerNoteWYSIWYG(){
      $('#summernote').summernote();
  }

  onSubmit(sectionId, payload) {
    let fullSectionId = `#layout-builder-${sectionId}`
    // Get resulting html
    var html = $(fullSectionId).gridEditor('getHtml');
    this.onSubmitHandler(sectionId, html);

  }

}
