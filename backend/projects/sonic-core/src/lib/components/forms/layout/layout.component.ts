import { Component, OnInit, Input } from '@angular/core';
import { QuestionBase } from "projects/sonic-core/src/lib/models/question-base";
import { FormGroup } from "@angular/forms";
import { st } from '@angular/core/src/render3';
import { FormService} from 'projects/sonic-core/src/lib//services/form.service'

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

  columnOptions: any;
  layoutColumnOptionsWidth = 300;
  layoutColumnOptionsHeight = 30;

  vehicles: any


  constructor(public formService:FormService ) {}

  ngOnInit() {
    console.log('layout ques', this.question);
    // console.log('layout question', this.question);
    // console.log('layout formGroup', this.form);
    this.loadLayoutColumnOptions();
    this.processRows();
  }

  processRows() {
    this.formService.layout = {};
    this.formService.layout.rows = [];

    let column = { class: "col" };

    let row = { class: "row", columns: [column, column] };
    this.formService.layout.rows.push(row);
    this.formService.layout.rows.push(row);


    this.processBlocks();

    console.log('layout', this.formService.layout)
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
  }

  addRow(columnsToAdd) {
    console.log('columnsToAdd', columnsToAdd);

    let columns = [];
    columnsToAdd.forEach(colClass => {
      columns.push({ class: colClass })
    });
    // let column = { class: "col" };

    // let row = { class: "row", columns: [column, column] };



    let row = { class: "row", columns: columns };


    this.formService.layout.rows.push(row);
    console.log('rows adding', this.formService.layout.rows);
  }

  processBlocks(){
    let blocks = [];
    let block = {id : '1234-1234', propX : 'ipsum' };
    blocks.push(block);

    this.formService.layout.rows.forEach(row => {
      row.columns.forEach(column => {
        column.blocks = blocks;
      });
    });

    console.log('this.formService.layout', this.formService.layout);

    // this.formService.layout.rows[0].columns[0].blocks = blocks;
  }

}
