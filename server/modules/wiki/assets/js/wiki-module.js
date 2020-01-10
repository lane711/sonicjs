// JS File for Module: wiki
$(document).ready(async function () {
    setupACEEditor1();
});
async function setupACEEditor1() {
    if ($('#editor1').length === 0) {
        return;
    }
    var editor1 = ace.edit("editor1");
    editor1.setTheme("ace/theme/monokai");
    editor1.session.setMode("ace/mode/css");
}