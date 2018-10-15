import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeEditSettingsComponent } from './content-type-edit-settings.component';

describe('ContentTypeEditSettingsComponent', () => {
  let component: ContentTypeEditSettingsComponent;
  let fixture: ComponentFixture<ContentTypeEditSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeEditSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeEditSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
