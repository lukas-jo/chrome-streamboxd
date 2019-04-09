function loadOptions() {
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
  chrome.storage.local.get(['options'], function(result) {
    opt = JSON.parse(result.options);
    $("#countrySelect").val(opt.locale);
	$("#trailerSelect").val(opt.trailerProvider);
    //$("#showStream").prop('checked', opt.showStream);
    //$("#showBuy").prop('checked', opt.showBuy);
    //$("#showRent").prop('checked', opt.showRent);
  });
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
