import { Component, OnInit, Input } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-wysiwyg',
  templateUrl: './wysiwyg.component.html',
  styleUrls: ['./wysiwyg.component.css']
})


export class WysiwygComponent implements OnInit {
  
  @Input()
  sectionId: string;

  showSaveControls: boolean = false;

  constructor() { }

  ngOnInit(){
    // console.log('main this', this);
    this.setupJqueryFunctions();
  }

  setupJqueryFunctions(){
    $(document).ready(() => {
      this.setupGridEditor(`#layout-builder-${this.sectionId}`);
      this.setupShowSaveControlsListener();
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
                console.log('init done element:', element);
                $(`.${self.sectionId}-save`).show();
              }
            }
          }
        }
      });
  }

  setupShowSaveControlsListener(){
    var self = this;
      $('.wysiwyg-header').click(() => {
        // var self= this;
        console.log('note-editable clicked');
        $(`.${self.sectionId}-save2`).show();
        self.showSaveControls = true;

        self.showControls();
      })
  }

  showControls(){
    console.log('showControls this', this);
    this.showSaveControls = true;
    console.log('showControls', this.showSaveControls);
  }
  
  setupSummerNoteWYSIWYG(){
      $('#summernote').summernote();
  }

  saveContent(sectionId) {
    let fullSectionId = `#layout-builder-${sectionId}`
    console.log('wysiwyg saving for ', fullSectionId);
    // Get resulting html
    var html = $(fullSectionId).gridEditor('getHtml');
    console.log('html', html);
  }

}
