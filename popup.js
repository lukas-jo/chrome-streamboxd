var options = {
  languages: [	lang("auto", "auto"), lang("USA", "en_US"), lang("Canada", "en_CA"), lang("Mexico", "es_MX"),
				lang("Brazil", "pt_BR"),
				lang("Germany", "de_DE"), lang("Austria", "de_AT"), lang("Switzerland", "de_CH"),
				lang("United Kingdom", "en_GB"), lang("Ireland", "en_IE"),
				lang("Russia", "ru_RU"),
				lang("Italy", "it_IT"), lang("France", "fr_FR"), lang("Spain", "es_ES"),
				lang("Netherlands", "en_NL"), lang("Norway", "en_NO"), lang("Sweden", "en_SE"), lang("Denmark", "en_DK"), lang("Finland", "fi_FI"),
				lang("Lithuania", "lt_LT"), lang("Latvia", "lv_LV"), lang("Estonia", "et_EE"),
				lang("Portugal", "pt_PT"), lang("Poland", "pl_PL"),
				lang("South Africa", "en_ZA"),
				lang("Australia", "en_AU"), lang("New Zealand", "en_NZ"),
				lang("India", "hi_IN"), lang("India (Eng)", "en_IN"), lang("Japan", "ja_JP"), lang("South Korea", "ko_KR"), lang("Thailand", "th_TH"),
				lang("Malaysia", "ms_MY"), lang("Malaysia (Eng)", "en_MY"), lang("Philippines", "en_PH"), lang("Singapore", "en_SG"), lang("Indonesia", "id_ID")],
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
