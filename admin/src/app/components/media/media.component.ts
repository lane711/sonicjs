import { Component, OnInit } from '@angular/core';
import { MediaService } from "../../../../projects/sonic-core/src/lib/services/media.service";

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  constructor(private mediaService: MediaService) { }
  mediaList:any;

  ngOnInit() {
    this.loadMedia();
  }

  async loadMedia() {
    this.mediaList = await this.mediaService.getMedia();
    console.log('media', this.mediaList);
  }

}
