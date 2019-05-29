import {
  Input,
  Component,
  ViewEncapsulation,
  EventEmitter,
  Output
} from '@angular/core';

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
