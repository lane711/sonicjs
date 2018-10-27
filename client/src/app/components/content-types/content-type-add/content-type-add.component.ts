import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { ContentTypesService } from "../../../services/content-types.service";

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

  constructor(
    private location: Location,
    private contentTypesService: ContentTypesService,
    private router: Router
  ) {}

  ngOnInit() {}

  async createContentType() {
    const data = await this.contentTypesService
      .createContentTypeAsync(this.contentType)
      .then(data => {
        if (data) {
          // this.router.navigate(["/content-types", data.id]);
        }
      });
  }

  back() {
    this.location.back();
  }
}
