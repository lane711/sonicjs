import { Component, OnInit } from '@angular/core';
import { ContentService } from "../../services/content.service";

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  constructor(private contentService: ContentService ) { }

  public contentInstances;

  ngOnInit() {
    this.loadContent();
  }

  loadContent(){
    this.contentService.getContent().then(data =>{
      this.contentInstances = data;
    })
  }

  deleteContent(contentId){
    this.contentService.deleteContentInstance(contentId).then(() => {
      this.loadContent();
    });
  }

}
