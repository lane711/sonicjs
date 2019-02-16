import { Component } from '@angular/core';
import { UiService } from "./services/ui.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';

  constructor(
    private uiService:UiService
  ) {}
  }