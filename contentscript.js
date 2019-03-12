const JustWatch = require('justwatch-api');

/*
background
*/

var jw = new JustWatch({locale: getLocale()});
var jweng = new JustWatch({locale: 'en_US'});
var allProviders;
var trailerProvider = "https://www.invidio.us/watch?v=";

//get user location
function getLocale() {
  return  'de_DE';//navigator.language.replace("-", "_");
}

//parse film title from letterboxd page
function getFilmTitle() {
  return $("#featured-film-header").children("h1").text();
}

//parse film release year from letterboxd page
function getFilmYear() {
  return $("#featured-film-header").children("p").children("small").children("a").text();
}

//get justwatch-id of the film
async function getFilmID(title, year) {
  var t0 = performance.now();
  var result = await jweng.search({query: title, cinema_release: year});
  var t1 = performance.now();
  console.log("Streamboxd: " + result.items[0].title + ", " + result.items[0].original_release_year +  " zu finden hat " + Math.round(t1-t0) + "ms gedauert");
  return result.items[0].id
}

//get film information from justwatch
async function getFilm(id) {
  var film = await jw.getTitle('movie', id);
  return film;
}

//get film trailer
function getTrailer(film) {
  if (film.clips != null) {
    var trailerID = film.clips.filter(clip => clip.type == "trailer")[0].external_id;
  } else {
    var trailerID = $(".watch-panel").children("p").children("a").attr("href").substr(24,11);
  }
  return trailerProvider + trailerID;
}

//parse film trailer
function getTrailerFromLetterboxd() {
  return
}

//get all available providers from justwatch
async function getAllProviders() {
  var providers = await jw.getProviders();
  return providers.filter(provider => provider.monetization_types.includes("flatrate"));
}

//get providers that offer the film from justwatch
function getFilmProviders(film) {
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
function getProviderPanel(provider, url) {
  var i = $("<span></span>").addClass("icon -play");
  var s = $("<span></span>").addClass("name").text(provider);
  var a = $("<a></a>").attr("href", url).addClass("label").append(i).append(s);
  return $("<p></p>").append(a);
}

//get all available provider panels
function createProviderPanels(providers) {
  var providerPanel = $("<section></section>").addClass("provider");
  for (var i = 0; i < providers.length; i++) {
    $(providerPanel).append(getProviderPanel(IDtoProvider(providers[i].provider_id), providers[i].urls.standard_web));
  }
  return providerPanel;
}

//display panel
function createStreamPanel(trailer, provider) {
  var streamPanel = $("<section></section>").attr('id', 'stream-panel').addClass("watch-panel");
  var title = $("<h3></h3>").addClass("title").text("Watch");
  return streamPanel.append(title).append(trailer).append(provider);
}

/*
main
*/

async function main() {
  var film = await getFilm(await getFilmID(getFilmTitle(), getFilmYear()));
  allProviders = await getAllProviders();
  var trailer = getProviderPanel("Trailer", getTrailer(film))
  var streamProviders = createProviderPanels(getFilmProviders(film));
  $(".watch-panel").remove();
  $(".poster-list").after(createStreamPanel(trailer, streamProviders));
}

main();
