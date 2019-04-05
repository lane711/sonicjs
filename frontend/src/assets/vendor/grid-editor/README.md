Grid Editor
===========

Grid Editor is a visual javascript editor for the [bootstrap 4 grid system](http://getbootstrap.com/css/#grid), written as a [jQuery](http://jquery.com/) plugin. You can create, drag, resize and delete rows and columns, and set different column widths for tablets and phones.

(Looking for the __bootstrap 3 support__? Use version 0 in the [bootstrap_3 branch](https://github.com/Frontwise/grid-editor/tree/bootstrap_3))

It provides integration plugins for the following rich text editors to edit column content: TinyMCE, summernote and CKEditor.

![Preview](http://i.imgur.com/UF9CCzk.png) 

# <a href="http://transfer.frontwise.com/frontwise/grid-editor/example/" target="_blank">Try the demo!</a>

Installation
------------

* __Dependencies:__ Grid Editor depends on jQuery, jQuery UI, Font Awesome, and Bootstap, so make sure you have included those in the page. 
    * If you want to use the tincyMCE integration, include tinyMCE and tinyMCE jQuery plugin as well.
    * If you want to use the summernote integration, include summernote as well.
    * If you want to use the CKEditor integration... you get the point.
* [Download the latest version of Grid Editor](https://github.com/Frontwise/grid-editor/archive/master.zip) and include it in your page: 

```html
<!-- Make sure jQuery, jQuery UI, font awesome, and bootstrap 4 are included. TinyMCE is optional. -->
<link rel="stylesheet" type="text/css" href="grid-editor/dist/grideditor.css" />
<script src="grid-editor/dist/jquery.grideditor.min.js"></script>
```

Usage
-----
```javascript
$('#myGrid').gridEditor({
    new_row_layouts: [[12], [6,6], [9,3]],
});
// Call this to get the result after the user has done some editing:
var html = $('#myGrid').gridEditor('getHtml');
```

Methods
-------

__`getHtml`:__ Returns the clean html.

```javascript
var html = $('#myGrid').gridEditor('getHtml');
```

__`remove`:__ Completely remove grideditor.

```javascript
var html = $('#myGrid').gridEditor('remove');
```
    
Options
-------

### General options

__`new_row_layouts`:__ Set the column layouts that appear in the "new row" buttons at the top of the editor.

```javascript
$('#myGrid').gridEditor({
    new_row_layouts: [[12], [6,6], [9,3]],
});
```

__`row_classes`:__ Set the css classes that the user can toggle on the rows, under the settings button.

```javascript
$('#myGrid').gridEditor({
    row_classes: [{label: 'Example class', cssClass: 'example-class'}],
});
```

__`col_classes`:__ The same as `row_classes`, but for columns.

__`row_tools`:__ Add extra tool buttons to the row toolbar.

```javascript
$('#myGrid').gridEditor({
    row_tools: [{
        title: 'Set background image',
        iconClass: 'glyphicon-picture',
        on: { 
            click: function() {
                $(this).closest('.row').css('background-image', 'url(http://placekitten.com/g/300/300)');
            }
        }
    }]
});
```
    
__`col_tools`:__ The same as row_tools, but for columns.

__`custom_filter`:__ Allows the execution of a custom function before initialization and after de-initialization. Accepts a functions or a function name as string.
Gives the `canvas` element and `isInit` (true/false) as parameter.

```javascript
$('#myGrid').gridEditor({
    'custom_filter': 'functionname',
});

function functionname(canvas, isInit) {
    if(isInit) {
        // do magic on init
    } else {
        // do magic on de-init
    }
}
```

or

```javascript
$('#myGrid').gridEditor({
    'custom_filter': function(canvas, isInit) {
        //...
    },
});
```

__`valid_col_sizes`:__ Specify the column widths that can be selected using the +/- buttons

```javascript
$('#myGrid').gridEditor({
    'valid_col_sizes': [2, 5, 8, 10],
});
```

__`source_textarea`:__ Allows to set an already existing textarea as input for grid editor.

```javascript
$('#myGrid').gridEditor({
    source_textarea: 'textarea.myTextarea',
});
```

You will have write back the content to the textarea before saving, for example in this way:

```javascript
$('form.myForm').on('submit', function() {
    var html = $('#myGrid').gridEditor('getHtml');
    $('textarea.myTextarea').val(html);
});
```

### Rich text editor options

Grid editor comes bundles with support for the following rich text editors (RTEs): 
* [TinyMCE](http://www.tinymce.com/) - [(example)](https://transfer.frontwise.com/frontwise/grid-editor/example/index.html)
* [summernote](http://summernote.org/) - [(example)](https://transfer.frontwise.com/frontwise/grid-editor/example/summernote.html)
* [CKEditor](http://ckeditor.com/) - [(example)](https://transfer.frontwise.com/frontwise/grid-editor/example/ckeditor.html)

__`content_types`:__ Specify the RTE to use. Valid values: `['tinymce']`, `['summernote']`, `['ckeditor']`. Default value: `['tinymce']`.

```javascript
$('#myGrid').gridEditor({
    content_types: ['summernote'],
});
```

__`ckeditor.config`:__ Specify ckeditor config, when using the `ckeditor` `content_types`.
See the [CKEditor documentation](http://docs.ckeditor.com/). 
Also check out the [ckeditor example](https://transfer.frontwise.com/frontwise/grid-editor/example/ckeditor.html).

```javascript
$('#myGrid').gridEditor({
    ckeditor: {
        config: { language: 'fr' }
    }
});
```

__`summernote.config`:__ Specify summernote config, when using the `summernote` `content_types`.
See the [summernote documentation](http://summernote.org/deep-dive/). 
Also check out the [summernote example](https://transfer.frontwise.com/frontwise/grid-editor/example/summernote.html).

```javascript
$('#myGrid').gridEditor({
    summernote: {
        config: { shortcuts: false }
    }
});
```

__`tinymce.config`:__ Specify tinyMCE config, when using the `tinymce` `content_types`.
See the [tinyMCE documentation](http://www.tinymce.com/wiki.php/Configuration).
Also check out the [tinymce example](https://transfer.frontwise.com/frontwise/grid-editor/example/index.html).

```javascript
$('#myGrid').gridEditor({
    tinymce: {
        config: { paste_as_text: true }
    }
});
```


Upgrading
---------

See UPGRADING.md for the changes you have to make when upgrading from grid-editor version 0 to 1.

Building
--------

If you want to make your own changes to the source, see [BUILDING.md](/BUILDING.md)


Contributing
--------
If you want to help out, please first read [CONTRIBUTING.md](/CONTRIBUTING.md)


Attribution
-----------

Grid Editor was heavily inspired by [Neokoenig's grid manager](https://github.com/neokoenig/jQuery-gridmanager)
