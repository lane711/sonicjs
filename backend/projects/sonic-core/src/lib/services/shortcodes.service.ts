import { Injectable } from '@angular/core';
// import { Shortcode } from 'shortcode-insert';
import  * as Shortcode from 'node_modules/shortcode-insert';

@Injectable({
  providedIn: 'root'
})
export class ShortcodesService {

  parser :any;

  constructor() {
    this.addParsers();
  }

  addParsers() {
    this.parser = Shortcode();

    this.parser.add('HELLO', tag => {
      return 'HELLO WORLD';
    });

    this.parser.add('BLOCK', tag => {
      let blockId = tag.attributes.id
      //TODO: get from db;
    return 'Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
  });
  }

  async parseShortCode(input) {
    let result = await this.parser.parse(input);
    return result;
  }
}
