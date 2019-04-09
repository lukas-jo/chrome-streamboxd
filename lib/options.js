var options;
const optionsDefault = {
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
  //showRent: false,
  trailerProviders: [new TrailerProvider("YouTube", "https://www.youtube.com/watch?v="), new TrailerProvider("Invidio.us", "https://www.invidio.us/watch?v=")],
  trailerProvider: "https://www.invidio.us/watch?v="
}

async function getOptions() {
  let result = await chrome.storage.local.get(['options']);
  return jQuery.isEmptyObject(result) ? optionsDefault : JSON.parse(result.options);
}

function TrailerProvider(provider, url) {
	this.provider = provider;
	this.url = url;
}

function Language(country, locale) {
  this.country = country;
  this.locale = locale;
}

function lang(c, l) {
  return new Language(c, l);
}

function saveChanges() {
  chrome.storage.local.set({
    'options': JSON.stringify(options)
  });
}
