import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "app-content-type-edit",
  templateUrl: "./content-type-edit.component.html",
  styleUrls: ["./content-type-edit.component.css"]
})
export class ContentTypeEditComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  public id;
  ngOnInit() {
    console.log("loading ct edit");
    this.id = this.route.snapshot.paramMap.get("id");
  }
}
