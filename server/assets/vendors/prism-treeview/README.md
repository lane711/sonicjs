prism-treeview
==============

Treeview language definition for [Prism](https://github.com/LeaVerou/prism). Based on [kbjr](https://github.com/kbjr)'s initial idea (https://github.com/LeaVerou/prism/issues/193)

Icons are from [Font Awesome](http://fortawesome.github.io/Font-Awesome/).

## Usage

Include the CSS file after Prism theme, and the JS file after Prism core.
You may use `tree -F` to get a compatible text structure.

It may be helpful to specify the charset in the `tree` command ie. `tree -F --charset=ascii` for some directory structures.

## Example code

```html
<pre><code class="language-treeview">
root_folder/
|-- a first folder/
|   |-- holidays.mov
|   |-- javascript-file.js
|   `-- some_picture.jpg
|-- documents/
|   |-- spreadsheet.xls
|   |-- manual.pdf
|   |-- document.docx
|   `-- presentation.ppt
|       `-- test    
|-- empty_folder/
|-- going deeper/
|   |-- going deeper/
|   |   `-- going deeper/
|   |        `-- going deeper/
|   |            `-- .secret_file
|   |-- style.css
|   `-- index.html
|-- music and movies/
|   |-- great-song.mp3
|   |-- S01E02.new.episode.avi
|   |-- S01E02.new.episode.nfo
|   `-- track 1.cda
|-- .gitignore
|-- .htaccess
|-- .npmignore
|-- archive 1.zip
|-- archive 2.tar.gz
|-- logo.svg
`-- README.md
</code></pre>
```

## Result
![Result](http://puu.sh/dvYNb/95139e70c2.png)

## Alternative syntax

You can also use the following box-drawing characters to represent the tree : `─│└├`

```html
<pre><code class="language-treeview">
root_folder/
├── a first folder/
|   ├── holidays.mov
|   ├── javascript-file.js
|   └── some_picture.jpg
├── documents/
|   ├── spreadsheet.xls
|   ├── manual.pdf
|   ├── document.docx
|   └── presentation.ppt
└── etc.
</code></pre>
