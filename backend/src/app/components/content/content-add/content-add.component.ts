import { Component, OnInit } from '@angular/core';
import { ContentService } from "../../../services/content.service";
import { ContentTypesService } from "../../../services/content-types.service";

@Component({
  selector: 'app-content-add',
  templateUrl: './content-add.component.html',
  styleUrls: ['./content-add.component.css']
})
export class ContentAddComponent implements OnInit {

  constructor(private contentTypesService: ContentTypesService,
    private contentService: ContentService) { }

  contentTypes: any;

  ngOnInit() {
    this.loadContentTypeButton();
  }

  loadContentTypeButton() {
    this.contentTypesService.getContentTypes().then(contentTypes => {
      this.contentTypes = contentTypes;
    })
  }

}
