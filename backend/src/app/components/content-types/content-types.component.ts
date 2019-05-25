
import { Component, OnInit } from "@angular/core";
import { DeprecatedI18NPipesModule } from "@angular/common";
import { ContentTypesService } from "../../../../projects/sonic-core/src/lib/services/content-types.service";
import { t } from "@angular/core/src/render3";

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

  deleteContentType(id){
    this.contentTypesService.deleteContentTypeAsync(id).then(x => {
      this.loadContentTypes();
    });
  }
}
