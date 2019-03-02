import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ContentService } from '../../../services/content.service'
@Component({
  selector: 'app-content-edit',
  templateUrl: './content-edit.component.html',
  styleUrls: ['./content-edit.component.css']
})
export class ContentEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService:ContentService) { }

  id:any;
  contentInstance: any;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.loadContent();
  }

  loadContent(){
    this.contentService.getContentInstance(this.id).then(data =>{
      this.contentInstance = data;
      console.log(this.contentInstance);
    })
  }

}
