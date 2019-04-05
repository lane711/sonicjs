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

  constructor() { }

  ngOnInit(){
    this.setupGridEditor(`#layout-builder-${this.sectionId}`);
    // this.setupSummerNoteWYSIWYG();
  }

  setupGridEditor(gridElem){
    console.log('gridElem',gridElem);
    $(document).ready(function () {
      $(gridElem).gridEditor({
        new_row_layouts: [[12], [6, 6], [4, 4, 4], [3, 3, 3, 3], [9, 3], [3, 9]],
        content_types: ['summernote'],
        summernote: {
          config: {
            callbacks: {
              onInit: function () {
                var element = this;
                console.log('init done element:', element);
              }
            }
          }
        }
      });
    });
  }
  
  setupSummerNoteWYSIWYG(){
      $('#summernote').summernote();
  }

  saveContent() {
    // Get resulting html
    var html = $('#layout-builder').gridEditor('getHtml');
    console.log(html);
  }

}
