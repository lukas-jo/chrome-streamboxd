async function loadOptions() {
  options = await getOptions();
  options.languages.forEach((l) => {
    $("#countrySelect").append($('<option/>').attr({
      'value': l.locale
    }).text(l.country));
  });
  options.trailerProviders.forEach((t) => {
    $("#trailerSelect").append($('<option/>').attr({
      'value': t.url
    }).text(t.provider));
  });
  $("#countrySelect").val(options.locale);
  $("#trailerSelect").val(options.trailerProvider);
  //$("#showStream").prop('checked', options.showStream);
  //$("#showBuy").prop('checked', options.showBuy);
  //$("#showRent").prop('checked', options.showRent);
}

$("#saveOptions").click(function() {
  options.locale = $("#countrySelect").val();
  options.trailerProvider = $("#trailerSelect").val();
  /*
  options.showStream = $("#showStream").is(':checked');
  options.showBuy = $("#showBuy").is(':checked');
  options.showRent = $("#showRent").is(':checked');
  */
  saveChanges();
});

loadOptions();
