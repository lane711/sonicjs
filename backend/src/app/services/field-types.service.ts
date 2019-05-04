import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class FieldTypesService {
  constructor() {}

  public getTypes() {
    let self = this;
    var fieldTypes = [
      {
        id: "dc52ae4c-cef2-4752-9ecc-cae3b8894984",
        name: "textBox",
        desc: "Textbox",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTextbox(id, placeholder, css);
        }
      },
      {
        id: "745af640-9a62-47b8-99a2-ce3854d22dca",
        name: "textarea",
        desc: "Textarea",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTextArea(id, placeholder, css);
        }
      },
      {
        id: "745af640-9a62-47b8-99a2-ce3854d22dca",
        name: "wysiwyg",
        desc: "wysiwyg text editor",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTextArea(id, placeholder, css);
        }
      },
      {
        id: "0ba9bee2-c7ec-4245-8a2c-2eeb9fe1068b",
        name: "number",
        desc: "Number, money",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTextboxNumber(id, placeholder, css);
        }
      },
      {
        id: "527f36db-30d9-42c7-b3fa-9a3b6c9e5082",
        name: "email",
        desc: "Email address",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTextboxEmail(id, placeholder, css);
        }
      },
      {
        id: "510da54d-05d0-48a0-8ee8-f5297a3f4d14",
        name: "slug",
        desc: "Slug (url)",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getSlug(id, placeholder, css);
        }
      },
      {
        id: "d0910500-bf44-4104-b724-18eae720df7f",
        name: "country",
        desc: "Country drop down list",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getCountryDropDownList(id, placeholder, css);
        }
      },
      {
        id: "34def6c2-9b99-473e-b685-2f75814a7c98",
        name: "layout",
        desc: "Bootstrap layout building",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getLayout(id, placeholder, css);
        }
      },
      {
        id: "8f4e0062-d4a5-42f2-8b0b-867f7262e0df",
        name: "tags",
        desc: "Phrase based tags",
        generateHtml: function(id = "notDefined", placeholder = "", css = "") {
          return self.getTags(id, placeholder, css);
        }
      }
    ];

    return fieldTypes;
  }

  public getTextbox(id = "notDefined", placeholder = "", css = "") {
    return '<input type="text" formControlName="title">';
    // return `<input type="text" name="${id}" formControlName="title" class="form-control" placeholder="some text">`;
  }

  public getTextArea(id = "notDefined", placeholder = "", css = "") {
    return `<textarea class="form-control" name="${id}" rows="5" placeholder="some long text goes here" id="comment"></textarea>`;
  }

  public getTextboxNumber(id = "notDefined", placeholder = "", css = "") {
    return `<input type="text" name="${id}" class="form-control" placeholder="some number">`;
  }

  public getTextboxEmail(id = "notDefined", placeholder = "", css = "") {
    return `<input type="email" name="${id}" class="form-control" placeholder="some email">`;
  }

  public getCountryDropDownList(id = "notDefined", placeholder = "", css = "") {
    return (
      `<select class="form-control" name="${id}">` +
      "<option>United States</option>" +
      "<option>United Kingdom</option>" +
      "<option>Canada</option>" +
      "<option>Mexico</option>" +
      "</select>"
    );
  }

  public getLayout(id = "notDefined", placeholder = "", css = "") {
    return "layout goes here";
  }

  public getTags(id = "notDefined", placeholder = "", css = "") {
    return (
      '<a href="#" class="badge badge-primary">Node.js</a>' +
      '<a href="#" class="badge badge-primary">React</a>' +
      '<a href="#" class="badge badge-primary">Angular</a>' +
      '<a href="#" class="badge badge-primary">Vue</a>' +
      '<a href="#" class="badge badge-primary">.Net Core</a>'
    );
  }

  public getSlug(id = "notDefined", placeholder = "", css = "") {
    return `<input type="text" class="form-control" placeholder="/my-url-goes-here"  name="${id}">`;
  }

  public generateHtml(field) {
    let baseFieldDef = this.getTypes().find(x => x.name == field.fieldType);
    let html = baseFieldDef.generateHtml(
      field.id,
      field.placeholder,
      field.css
    );
    return html;
  }
}
