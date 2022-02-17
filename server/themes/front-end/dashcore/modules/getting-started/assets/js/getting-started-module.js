// JS File for Module: getting-started
$(document).ready(async function () {
    $('#copy-clone').click(function(){
        let text = $("#clone-text").val();
        navigator.clipboard.writeText(text);
$(".copy-success").show();
    })
});