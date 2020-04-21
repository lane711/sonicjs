// JS File for Module: code-snippet
// JS File for Module: wiki
$(document).ready(async function () {
  setupACEForSnippets();
});
async function setupACEForSnippets() {
  if (typeof ace === "undefined") {
    return;
  }

  let codeSnippets = $(".code-snippet");

  for (let index = 0; index < codeSnippets.length; index++) {
    let codeSnippetObj = codeSnippets[index];

    let codeSnippet = $(codeSnippetObj);
    let type = codeSnippet.data("type");
    // console.log(type, codeSnippet);

    var editor = ace.edit(codeSnippetObj);
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/" + type);
    editor.renderer.setShowGutter(false);
    editor.setOptions({
      maxLines: 40,
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
    });
    editor.renderer.$cursorLayer.element.style.display = "none";
    editor.autoIndent = true;
    editor.setShowPrintMargin(false);
  }

  // var editor5 = ace.edit("editor5");
  // editor5.setTheme("ace/theme/solarized_light");
  // editor5.session.setMode("ace/mode/html");
  // editor5.setOptions({
  //     maxLines: Infinity
  // });

  // console.log('editor1 setup');
  // if ($('#editor1').length === 0) {
  //     return;
  // }
  // var editor1 = ace.edit("editor1");
  // editor1.setTheme("ace/theme/solarized_light");
  // editor1.session.setMode("ace/mode/html");
  // editor1.setOptions({
  //     maxLines: Infinity
  // });

  // var editor2 = ace.edit("editor2");
  // editor2.setTheme("ace/theme/monokai");
  // editor2.session.setMode("ace/mode/js");
  // editor2.setOptions({
  //     maxLines: Infinity
  // });
}
