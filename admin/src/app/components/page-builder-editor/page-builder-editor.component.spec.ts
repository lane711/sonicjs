import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBuilderEditorComponent } from './page-builder-editor.component';

describe('PageBuilderEditorComponent', () => {
  let component: PageBuilderEditorComponent;
  let fixture: ComponentFixture<PageBuilderEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageBuilderEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageBuilderEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
