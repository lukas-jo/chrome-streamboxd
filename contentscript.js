const JustWatch = require('justwatch-api');

/*
background
*/

var allProviders = [];
var jw = new JustWatch({locale: getLocale()});
var jweng = new JustWatch({locale: 'en_US'});

//get user location
function getLocale() {
  return  navigator.language.replace("-", "_");
}

//parse film title from letterboxd page
function getFilmTitle() {
  return $("#featured-film-header").children("h1").text();
}

//get justwatch-id of the film
async function getFilmID() {
  var result = await jweng.search({query: getFilmTitle()});
  return result.items[0].id
}

//get film information from justwatch
async function getFilm() {
  var film = await jw.getTitle('movie', await getFilmID());
  return film;
}

//get all available providers from justwatch
async function getAllProviders() {
  var providers = await jw.getProviders();
  return providers.filter(provider => provider.monetization_types.includes("flatrate"));
}

//get providers that offer the film from justwatch
async function getFilmProviders() {
  var film = await getFilm();
  return film.offers.filter(provider => provider.monetization_type == "flatrate" && provider.presentation_type == "hd")
}

//turn provider id from justwatch to provider name
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

//create a provider panel
function createProviderPanel(provider, url) {
  var s = $("<span></span>").addClass("name").text(provider);
  var a = $("<a></a>").attr("href", url).addClass("label").append(s);
  return $("<p></p>").append(a);
}

//get all available provider panels
async function getProviderPanels() {
  var providerPanel = $("<section></section>").addClass("provider");
  allProviders = await getAllProviders();
  var providers = await getFilmProviders();
  for (var i = 0; i < providers.length; i++) {
    $(providerPanel).append(createProviderPanel(IDtoProvider(providers[i].provider_id), providers[i].urls.standard_web));
  }
  return providerPanel;
}

//display panel
async function createStreamPanel() {
  var streamPanel = $("<section></section>").attr('id', 'stream-panel').addClass("watch-panel").css("margin-top", "20px");
  var streamPanelTitle = $("<h3></h3>").addClass("title").text("Stream");
  var providerPanel = await getProviderPanels();
  $(".watch-panel").after(streamPanel.append(streamPanelTitle).append(providerPanel));
}

/*
main
*/

createStreamPanel();
