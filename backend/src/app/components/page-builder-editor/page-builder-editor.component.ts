import { Component, OnInit } from '@angular/core';
import { PageBuilderService } from '../../services/page-builder.service';

@Component({
  selector: 'app-page-builder-editor',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css']
})
export class PageBuilderEditorComponent implements OnInit {

  constructor(private pageBuilderService: PageBuilderService) { }

  ngOnInit() {
    this.loadSections();
  }

  loadSections(){
    this.pageBuilderService.currentPageSubject.subscribe(data => {
      console.log('loadSections', data);
      // this.html = data.html.toString();
    });
  }

}
