import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-wysiwyg',
  templateUrl: './wysiwyg.component.html',
  styleUrls: ['./wysiwyg.component.css']
})


export class WysiwygComponent implements OnInit {


  constructor() { }

  ngOnInit() {
    $(document).ready(function () {
      $('#myGrid').gridEditor({
        new_row_layouts: [[12], [6, 6], [9, 3]],
      });
    });
  }

}
