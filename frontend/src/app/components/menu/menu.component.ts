import { Component, OnInit } from '@angular/core';
// import { ContentService } from 'projects/sonic-core/src/lib/services/content.service'
import { SonicCoreComponent } from 'node_modules/sonic-core/src/lib/sonic-core.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private contentService:SonicCoreComponent) { }
  
  menuItems:any;

  ngOnInit() {
    // this.contentService.getContentByType('menu').then(data =>{
    //   // console.log('menu', data);
    //   this.menuItems = data;
    // })
  }

}
