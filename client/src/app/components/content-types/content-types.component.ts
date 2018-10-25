import { Component, OnInit } from "@angular/core";
import { DeprecatedI18NPipesModule } from "@angular/common";
import { ContentTypesService } from "../../services/content-types.service";

@Component({
  selector: "app-content-types",
  templateUrl: "./content-types.component.html",
  styleUrls: ["./content-types.component.css"]
})
export class ContentTypesComponent implements OnInit {
  constructor(private contentTypesService: ContentTypesService) {}

  public contentTypes;

  ngOnInit() {
    this.loadContentTypes();
  }

  loadContentTypes() {
    this.contentTypesService.getContentTypes().then(data => {
      this.contentTypes = data;
    });
  }
}
