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

  constructor() { }

  ngOnInit() {
    console.log('layout question', this.question);
    console.log('layout formGroup', this.form);

  }

}
