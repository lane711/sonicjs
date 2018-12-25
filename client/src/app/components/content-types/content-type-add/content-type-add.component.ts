import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { ContentTypesService } from "../../../services/content-types.service";
import { TextboxQuestion } from "../../../models/question-textbox";

@Component({
  selector: "app-content-type-add",
  templateUrl: "./content-type-add.component.html",
  styleUrls: ["./content-type-add.component.css"]
})
export class ContentTypeAddComponent implements OnInit {
  contentType = {
    name: "",
    description: ""
  };

  isDataAvailable = true;
  questions = [
    new TextboxQuestion({
      key: "name",
      label: "Name",
      required: true,
      order: 1
    }),

    new TextboxQuestion({
      key: "description",
      label: "Description",
      order: 2
    }),

    new TextboxQuestion({
      key: "test",
      label: "test",
      order: 3
    })
  ];

  constructor(
    private location: Location,
    private contentTypesService: ContentTypesService,
    private router: Router
  ) {}

  ngOnInit() {}

  submitHandlerContentTypeAdd(payload) {
    if (payload) {
      console.log("payload", payload);

      this.contentTypesService.createContentTypeInstanceSubmitSubject.next(
        payload
      );

      // this.contentTypesService
      //   .createContentTypeAsync(this.contentType)
      //   .then(data => {
      //     if (data) {
      //       // this.router.navigate(["/content-types", data.id]);
      //     }
      //   });
    }
  }

  back() {
    this.location.back();
  }
}
