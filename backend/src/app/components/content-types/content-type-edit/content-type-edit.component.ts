import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { ContentTypesService } from "../../../services/content-types.service";
import { TextboxQuestion } from "../../../models/question-textbox";
import { DropdownQuestion } from "../../../models/question-dropdown";
import { HiddenQuestion } from '../../../models/question-hidden';

@Component({
  selector: "app-content-type-edit",
  templateUrl: "./content-type-edit.component.html",
  styleUrls: ["./content-type-edit.component.css"]
})
export class ContentTypeEditComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService
  ) {}

  public contentType;
  isDataAvailable = false;

  questions = [
    new HiddenQuestion({
      key: "contentTypeId",
      label: "",
      required: false,
      order: 1
    }),

    new HiddenQuestion({
      key: "fieldId",
      label: "fieldId",
      value: "",
      required: false,
      order: 2
    }),

    new TextboxQuestion({
      key: "systemId",
      label: "System Id",
      value: "",
      required: false,
      order: 3
    }),

    new TextboxQuestion({
      key: "label",
      label: "Label",
      value: "my lablel",
      required: false,
      order: 4
    }),

    new DropdownQuestion({
      key: "isRequired",
      label: "Required",
      options: [{ key: "true", value: "true" }, { key: "false", value: "false" }],
      order: 5
    }),
  ];
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.contentTypesService.getContentType(id);
    this.contentType = this.contentTypesService.contentType;
    this.isDataAvailable = true;
  }

  onSubmitContentTypeEdit(){

  }
}
