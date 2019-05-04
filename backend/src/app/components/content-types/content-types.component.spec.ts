import { puppeteer } from 'node_modules/puppeteer';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentTypesComponent } from './content-types.component';

describe('ContentTypesComponent', () => {
//   let component: ContentTypesComponent;
//   let fixture: ComponentFixture<ContentTypesComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ ContentTypesComponent ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ContentTypesComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

  it('should create RRRRRRRRRRR', () => {

    (async () => {
        const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // //   console.log(page);
        // await page.goto('http://localhost:4200/admin');
        // await page.screenshot({path: 'screenshots/admin-home.png'});

        // await browser.close();
    })(); 

    expect(true).toBeTruthy();
  });
});
