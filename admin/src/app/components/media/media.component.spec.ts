import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaComponent } from './media.component';

describe('MediaComponent', () => {
  let component: MediaComponent;
  let fixture: ComponentFixture<MediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
