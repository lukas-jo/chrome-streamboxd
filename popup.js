var options = {
  languages: [lang("auto", "auto"), lang("Deutschland", "de_DE"), lang("USA", "en_US")],
  locale: "auto",
  //showStream: true,
  //showBuy: false,
  //showRent: false
}

function Language(country, locale) {
  this.country = country;
  this.locale = locale;
}

function lang(c, l) {
  return new Language(c, l);
}

function setOptions() {
  chrome.storage.local.get(['options'], function(result) {
    if (result != null) {
      options = JSON.parse(result.options);
    } else {
      saveChanges();
    }
  });
}

function loadOptions() {
  options.languages.forEach((l) => {
    $("#countrySelect").append($('<option/>').attr({
      'value': l.locale
    }).text(l.country));
  });
  chrome.storage.local.get(['options'], function(result) {
    opt = JSON.parse(result.options);
    $("#countrySelect").val(opt.locale);
    //$("#showStream").prop('checked', opt.showStream);
    //$("#showBuy").prop('checked', opt.showBuy);
    //$("#showRent").prop('checked', opt.showRent);
  });
}

function saveChanges() {
  chrome.storage.local.set({
    'options': JSON.stringify(options)
  });
}

function getLocale() {
  return $("#countrySelect").val();
}
/*

function showStream() {
  return $("#showStream").is(':checked');
}
function showBuy() {
  return $("#showBuy").is(':checked');
}

function showRent() {
  return $("#showRent").is(':checked');
}
*/
$("#countrySelect").change(function() {
  options.locale = getLocale();
  saveChanges();
});
/*
$("#showStream").change(function() {
  options.showStream = showStream();
  saveChanges();
});
$("#showBuy").change(function() {
  options.showBuy = showBuy();
  saveChanges();
});
$("#showRent").change(function() {
  options.showRent = showRent();
  saveChanges();
});
*/

setOptions();
loadOptions();
