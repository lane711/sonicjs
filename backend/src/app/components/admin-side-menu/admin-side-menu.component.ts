import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-admin-side-menu',
  templateUrl: './admin-side-menu.component.html',
  styleUrls: ['./admin-side-menu.component.css'],
})
export class AdminSideMenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
}
