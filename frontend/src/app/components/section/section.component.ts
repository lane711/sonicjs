import { Component, OnInit } from '@angular/core';
import { SonicCoreComponent } from 'node_modules/sonic-core/src/lib/sonic-core.component';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {

  constructor(private contentService:SonicCoreComponent) { }

  ngOnInit() {
    // this.contentService.saveSection('test', 'payload');
  }

  onSubmitSaveSection(sectionId, payload){
    console.log('onSubmitSaveSection', sectionId, payload);
    //section section info
    // console.log(this.contentService);
    // this.contentService.saveSection(sectionId, payload);
    //link section to page object
  }

}
