async function loadOptions() {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'lib/options.json');
  xhr.onload = async function() {
    if (this.status >= 200 && this.status < 300) {
      const res = JSON.parse(xhr.responseText);
      res.languages.forEach((l) => {
        document.querySelector("#countrySelect").innerHTML += `<option value=${l.locale}>${l.country}</option>`;
      });
      res.trailerProviders.forEach((t) => {
        document.querySelector("#trailerSelect").innerHTML += `<option value=${t.url}>${t.provider}</option>`;
      });
      let options = await getOptions();
      document.querySelector("#countrySelect").value = options.locale;
      document.querySelector("#trailerSelect").value = options.trailerProvider;
      document.querySelector("#trailerOV").checked = options.trailerOV;
      //document.querySelector("#showStream").checked' = options.showStream;
      //document.querySelector("#showBuy").checked' = options.showBuy;
      //document.querySelector("#showRent").checked' = options.showRent;
    }
  }
  xhr.send();
}

document.querySelector("#saveOptions").onclick = function() {
  chrome.storage.sync.set({
    'options': JSON.stringify({
      locale: document.querySelector("#countrySelect").value,
      trailerProvider: document.querySelector("#trailerSelect").value,
      trailerOV: document.querySelector("#trailerOV").checked//,
      //options.showStream = document.querySelector("#showStream").checked,
      //options.showBuy = document.querySelector("#showBuy").checked,
      //options.showRent = document.querySelector("#showRent").checked})
    })
  });
}

loadOptions();
