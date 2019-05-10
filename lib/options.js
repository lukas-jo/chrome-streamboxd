let options;

const optionsDefault = {
  locale: "auto",
  //showStream: true,
  //showBuy: false,
  //showRent: false,
  trailerProvider: "https://www.invidio.us/watch?v=",
  trailerOV: false
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
