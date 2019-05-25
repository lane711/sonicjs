import { Component, OnInit, Renderer2 } from '@angular/core';
import { UiService } from '../../../../projects/sonic-core/src/lib/services/ui.service';

@Component({
  selector: 'app-aside-menu',
  templateUrl: './aside-menu.component.html',
  styleUrls: ['./aside-menu.component.css']
})
export class AsideMenuComponent implements OnInit {

  constructor(private renderer: Renderer2,
    private uiService:UiService) { }

  ngOnInit() {
    //this.renderer.addClass(document.body, 'aside-menu-show');
  }

}
