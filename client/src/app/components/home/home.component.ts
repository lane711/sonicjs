import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.tempRedirect();
  }

  tempRedirect() {
    this.router.navigate(["/content-types", "5bd11e3ac34cad14b0afb0db"]);
    this.router.navigate(["/content-types", "add"]);
  }
}
