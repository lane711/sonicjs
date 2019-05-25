import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { PageBuilderService } from "../../../../projects/sonic-core/src/lib/services/page-builder.service";

@Component({
  selector: 'app-admin-side-menu',
  templateUrl: './admin-side-menu.component.html',
  styleUrls: ['./admin-side-menu.component.css'],
})
export class AdminSideMenuComponent implements OnInit {

  constructor(private router: Router,
    private pageBuilderService: PageBuilderService) { }

  ngOnInit() {
  }
}
