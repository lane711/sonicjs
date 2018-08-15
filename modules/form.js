
exports.convertFormElementsToDocument = function (formElements) {
    var array = JSON.parse(formElements);
    let content = {};
    array.forEach(element => {
        content[element.name] = element.value;
    });
    return content;
}
