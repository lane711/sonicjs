import { Component, OnInit } from '@angular/core';
import { UiService} from 'projects/sonic-core/src/lib/services/ui.service'
@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.css']
})
export class AlertMessageComponent implements OnInit {

  constructor(private uiService: UiService) { }

  ngOnInit() {

  }

  

}
