import { Component, OnInit } from "@angular/core";
import { FieldTypesService } from "../../services/field-types.service";

@Component({
  selector: "app-field-types",
  templateUrl: "./field-types.component.html",
  styleUrls: ["./field-types.component.css"]
})
export class FieldTypesComponent implements OnInit {
  constructor(private fieldTypesService: FieldTypesService) {}

  public fieldTypes;
  ngOnInit() {
    this.fieldTypes = this.fieldTypesService.getTypes();
  }
}
