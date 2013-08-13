jQuery.fn.inputHints = function() {
  function hintIfBlank(elem)
  {
    if (elem.val() == '')
      elem.val(elem.attr('title')).addClass('hint').data('hint', true);
  }

  $(this)
    .data('hint', false)
    .focus(function() {
             if ($(this).val() == $(this).attr('title') && $(this).data('hint'))
               $(this).val('').removeClass('hint').data('hint', false);
           })
    .blur(function() {
            hintIfBlank($(this));
          });

  $(this).each(function(index, value) {
    hintIfBlank($(this));
  });
};