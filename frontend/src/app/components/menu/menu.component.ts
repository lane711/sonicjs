import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private contentService:ContentService) { }
  
  menuItems:any;

  ngOnInit() {
    this.contentService.getContentByType('menu').then(data =>{
      // console.log('menu', data);
      this.menuItems = data;
    })
  }

}
