import {
  Input,
  Component,
  ViewEncapsulation,
  EventEmitter,
  Output,
  OnInit
} from '@angular/core';

// import { PageBuilderService } from '../../services/page-builder.service';
// import { ContentService } from 'node_modules/sonic-core/src/lib/services/content.service';
// import { ShortcodesService } from '../../services/shortcodes.service';
import { TempserviceService } from '../services/tempservice.service';
import { PageBuilderService } from '../services/page-builder.service';

import { ActivatedRoute } from "@angular/router";

declare var $: any;
declare var tinyMCE: any;
declare var tinymce: any;

@Component({
  selector: 'custom-button',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css'],
  encapsulation: ViewEncapsulation.Native
})
export class PageBuilderComponent implements OnInit {
  @Input() label = 'default label';
  @Output() action = new EventEmitter<number>();
  private clicksCt = 0;
  timestamp : any;

  constructor(
    private pageBuilderService: PageBuilderService,
    // private contentService: ContentService,
    // private shortcodesService: ShortcodesService,
    private tempserviceService: TempserviceService,
    private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('params', params);
    });

    let id = this.route.snapshot.paramMap.get("id");
    console.log('page builder editor route', id);

    this.timestamp = new Date().getTime();

  }

  handleClick() {
    this.clicksCt++;
    this.action.emit(this.clicksCt);
  }
}
