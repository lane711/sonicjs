import {
  Input,
  Component,
  ViewEncapsulation,
  EventEmitter,
  Output
} from '@angular/core';

// import { PageBuilderService } from '../../../../backend/projects/sonic-core/src/lib/services/page-builder.service';
// import { ContentService } from '../../../../projects/sonic-core/src/lib/services/content.service';
import { ShortcodesService } from 'node_modules/sonic-core/src/lib/services/shortcodes.service';
// import { ActivatedRoute } from "@angular/router";

declare var $: any;
declare var tinyMCE: any;
declare var tinymce: any;

@Component({
  selector: 'custom-button',
  templateUrl: './page-builder-editor.component.html',
  styleUrls: ['./page-builder-editor.component.css'],
  encapsulation: ViewEncapsulation.Native
})
export class PageBuilderComponent {
  @Input() label = 'default label';
  @Output() action = new EventEmitter<number>();
  private clicksCt = 0;

  handleClick() {
    this.clicksCt++;
    this.action.emit(this.clicksCt);
  }
}
