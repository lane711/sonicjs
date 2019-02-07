import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ContentTypesService } from "../../../services/content-types.service";

@Component({
  selector: 'app-content-type-edit-field',
  templateUrl: './content-type-edit-field.component.html',
  styleUrls: ['./content-type-edit-field.component.css']
})
export class ContentTypeEditFieldComponent implements OnInit {

  constructor(private route: ActivatedRoute, private contentTypesService:ContentTypesService) { }

  fieldId: string;
  field: any;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        this.fieldId = params['fieldId'];
        this.loadField(this.fieldId);
    });
  }

loadField(fieldId){
  console.log(this.contentTypesService.contentType);
}

}
