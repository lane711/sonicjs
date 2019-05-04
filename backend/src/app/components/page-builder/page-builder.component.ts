import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.css']
})
export class PageBuilderComponent implements OnInit {

  constructor() { }

  html = '<div>content it <b>here</b></div>'
  ngOnInit() {
  }

}
