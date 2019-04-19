import { Component, OnInit, Input } from '@angular/core';
import { QuestionBase } from "../../../models/question-base";
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  @Input()
  question: QuestionBase<any>;
  @Input()
  form: FormGroup;

  layout : any;
  columnOptions : any;
  layoutColumnOptionsWidth = 300;
  layoutColumnOptionsHeight = 30;

  constructor() { }

  ngOnInit() {
    // console.log('layout question', this.question);
    // console.log('layout formGroup', this.form);
    this.loadLayoutColumnOptions();
    this.processRows();
  }

  processRows(){
    this.layout = {};
    this.layout.rows = [];

    let column = {class : "col"};

    let row = {class : "row", columns : [column, column]};
    this.layout.rows.push(row);
    this.layout.rows.push(row);

    console.log('layout', this.layout)
  }

  loadLayoutColumnOptions(){
    this.columnOptions = [];
    this.columnOptions.push(['col']);
    this.columnOptions.push(['col-3', 'col-9']);
  }

}
