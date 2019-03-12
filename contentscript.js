const JustWatch = require('justwatch-api');

/*
background
*/

var allProviders = [];

function getLocale() {
  return  navigator.language.replace("-", "_");
}

var jw = new JustWatch({locale: getLocale()});
var jweng = new JustWatch({locale: 'en_US'});

function getFilmTitle() {
  return $("#featured-film-header").children("h1").text();
}

async function getFilmID() {
  var result = await jweng.search({query: getFilmTitle()});
  return result.items[0].id
}

async function getFilm() {
  var film = await jw.getTitle('movie', await getFilmID());
  return film;
}

async function getAllProviders() {
  var providers = await jw.getProviders();
  return providers.filter(provider => provider.monetization_types.includes("flatrate"));
}

async function getFilmProviders() {
  var film = await getFilm();
  return film.offers.filter(provider => provider.monetization_type == "flatrate" && provider.presentation_type == "hd")
}

function IDtoProvider(id) {
  for (var i = 0; i < allProviders.length; i++) {
    if (allProviders[i].id == id) {
      return allProviders[i].clear_name;
    }
  }
  return "Unbekannt";
}

/*
create html
*/

function createStreamPanel() {
  var streamPanel = $("<section></section>").attr('id', 'stream-panel').addClass("watch-panel").css("margin-top", "20px");
  var streamPanelTitle = $("<h3></h3>").addClass("title").text("Stream");
  $(".watch-panel").after(streamPanel.append(streamPanelTitle));
}

function createProviderPanel(provider, url) {
  var s = $("<span></span>").addClass("name").text(provider);
  var a = $("<a></a>").attr("href", url).addClass("label").append(s);
  $("#stream-panel").append($("<p></p>").append(a));
}

/*
fill html
*/

async function fillStreamPanel() {
  var providerPanel = $("<section></section>").addClass("Provider");
  var providers = await getFilmProviders();
  for (var i = 0; i < providers.length; i++) {
    createProviderPanel(IDtoProvider(providers[i].provider_id, providers[i].urls.standard_web));
  }
}

async function main() {
  allProviders = await getAllProviders();
  setTimeout(function() { createStreamPanel(); }, 500);
  fillStreamPanel()
}

main()
