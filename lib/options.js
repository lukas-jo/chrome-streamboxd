function getOptions() {
  const optionsDefault = {
    locale: "auto",
    //showStream: true,
    //showBuy: false,
    //showRent: false,
    trailerProvider: "https://www.invidio.us/watch?v=",
    trailerOV: false
  }

  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(['options'], function(result) {
      resolve(Object.entries(result).length ? JSON.parse(result.options) : optionsDefault);
    })
  });
}
