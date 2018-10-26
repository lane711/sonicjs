import { Component, OnInit } from "@angular/core";
import { ContentTypesService } from "../../../services/content-types.service";
import { FieldTypesService } from "../../../services/field-types.service";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-content-type-edit-create-instance",
  templateUrl: "./content-type-edit-create-instance.component.html",
  styleUrls: ["./content-type-edit-create-instance.component.css"]
})
export class ContentTypeEditCreateInstanceComponent implements OnInit {
  constructor(
    private contentTypesService: ContentTypesService,
    private fieldTypesService: FieldTypesService
  ) {}
  instanceForm = new FormGroup({
    title: new FormControl(),
    firstName: new FormControl()
  });
  ngOnInit() {}

  createInstance() {
    // TODO: Use EventEmitter with form value
    console.warn(this.instanceForm.value);
  }
}
