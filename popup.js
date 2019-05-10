async function loadOptions() {
  $.ajax({
    url: "lib/options.json",
    dataType: 'json',
    async: false,
    success: function(data) {
      data.languages.forEach((l) => {
        $("#countrySelect").append($('<option/>').attr({
          'value': l.locale
        }).text(l.country));
      });
      data.trailerProviders.forEach((t) => {
        $("#trailerSelect").append($('<option/>').attr({
          'value': t.url
        }).text(t.provider));
    })
    }
  });
  options = await getOptions();
  $("#countrySelect").val(options.locale);
  $("#trailerSelect").val(options.trailerProvider);
  $("#trailerOV").prop('checked', options.trailerOV);
  //$("#showStream").prop('checked', options.showStream);
  //$("#showBuy").prop('checked', options.showBuy);
  //$("#showRent").prop('checked', options.showRent);
}

$("#saveOptions").click(function() {
  options.locale = $("#countrySelect").val();
  options.trailerProvider = $("#trailerSelect").val();
  options.trailerOV = $("#trailerOV").is(':checked');
  /*
  options.showStream = $("#showStream").is(':checked');
  options.showBuy = $("#showBuy").is(':checked');
  options.showRent = $("#showRent").is(':checked');
  */
  saveChanges();
});

loadOptions();
