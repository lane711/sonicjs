import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private contentService:ContentService) { }
  
  public menuItems;

  ngOnInit() {
    this.contentService.getContent().then(data =>{
      console.log(data);
      this.menuItems = data;
    })
  }

}
