$(document).ready(async function(){
  
  await Formio.builder(document.getElementById('formBuilder'));

    function generateButtonList(container, dest) {
      // debugger;
        let buttonListHtml = '';
        $(`${container} span`).each(function () {
          let text = $(this).text();
          let icon = $(this).children('i').first().attr('class');
          buttonListHtml += `<button class="btn btn-outline-primary btn-lg rmargin tmargin"><i class="${icon}"></i>${text}</button>`;
        });

        $(`${dest}`).html(buttonListHtml);

      }

      generateButtonList('#group-container-basic', '#basicFieldList');
      generateButtonList('#group-container-advanced', '#advancedFieldList');
      generateButtonList('#group-container-layout', '#layoutFieldList');
      generateButtonList('#group-container-data', '#dataFieldList');

  });