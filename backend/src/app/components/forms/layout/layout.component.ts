import { Component, OnInit, Input } from '@angular/core';
import { QuestionBase } from "../../../models/question-base";
import { FormGroup } from "@angular/forms";
import { st } from '@angular/core/src/render3';

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

  layout: any;
  columnOptions: any;
  layoutColumnOptionsWidth = 300;
  layoutColumnOptionsHeight = 30;
  content = 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
  start: number;
  end: number;
  constructor() { }

  ngOnInit() {
    // console.log('layout question', this.question);
    // console.log('layout formGroup', this.form);
    this.loadLayoutColumnOptions();
    this.processRows();
  }

  processRows() {
    this.layout = {};
    this.layout.rows = [];

    let column = { class: "col" };

    let row = { class: "row", columns: [column, column] };
    this.layout.rows.push(row);
    this.layout.rows.push(row);

    console.log('layout', this.layout)
  }

  loadLayoutColumnOptions() {
    this.columnOptions = [];
    this.columnOptions.push(['col']);
    this.columnOptions.push(['col-6', 'col-6']);
    this.columnOptions.push(['col-4', 'col-4', 'col-4']);
    this.columnOptions.push(['col-3', 'col-3', 'col-3', 'col-3']);
    this.columnOptions.push(['col-3', 'col-9']);
    this.columnOptions.push(['col-4', 'col-8']);
    this.columnOptions.push(['col-9', 'col-3']);
    this.columnOptions.push(['col-8', 'col-4']);
    this.columnOptions.push(['col-3', 'col-9']);
  }

  addRow(columnsToAdd) {
    console.log('columnsToAdd', columnsToAdd);
  }

  onSelect(start, end) {
    console.log(start, end);
    this.start = start;
    this.end = end;
  }

  wrapTag(tag) {
    let last = this.content.substr(this.end);
    let toBeWrapped = this.content.substr(this.start, this.end - this.start);
    let first = this.content.substr(0, this.start);
    this.content = first + `<${tag}>` + toBeWrapped + `</${tag}>` + last;
  }

  insert(tag) {
    let last = this.content.substr(this.end);
    let toBeWrapped = this.content.substr(this.start, this.end - this.start);
    let first = this.content.substr(0, this.start);
    this.content = first + `${tag}` + toBeWrapped + last;
  }

}
