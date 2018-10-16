import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { ContentTypesService } from "../../../services/content-types.service";

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
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.contentTypesService.getContentType(id).then(data => {
      console.log(data);
      this.contentType = data;
    });
  }
}
