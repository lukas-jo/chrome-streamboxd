const JustWatch = require('justwatch-api');

/*
globals
*/

var jw;
var jweng = new JustWatch({locale: 'en_US'});
var allProviders;
var trailerProvider = "https://www.invidio.us/watch?v=";

chrome.storage.onChanged.addListener(function(changes, namespace) {
  main();
});

/*
parse html
*/

//parse film title from letterboxd page
function getFilmTitle() {
    return $("#featured-film-header").children("h1").text();
}

//parse tMDB ID from letterboxd page
function getLBTmdbId() {
  return parseInt($("body").attr("data-tmdb-id"));
}

//parse Traile ID from letterboxd page
function getLBTrailerId() {
  return $(".watch-panel").children("p").children("a").attr("href").substr(24, 11);
}

/*
background & helper
*/

//check if a String is a locale
function isLocale(locale) {
  return typeof locale === "string" && /[a-z][a-z]_[A-Z][A-Z]/.test(locale)
}

//get user location
function setLocale() {
  chrome.storage.local.get(['options'], function(result) {
    var opt = JSON.parse(result.options);
    if (isLocale(opt.locale)) {
      var loc = opt.locale;
    } else  {
      var loc =navigator.language.replace("-", "_");
    }
    jw = new JustWatch({locale: loc});
  });
}

//find the tMDB ID of a film from justwatch
function getJWTmdbId(scoring = []) {
  return scoring.find(item => item.provider_type == "tmdb:id").value;
}

//find a film in a list of film from justwatch
function findFilm(films = []) {
  return films.find(film => getJWTmdbId(film.scoring) == getLBTmdbId());
}

//get the Trailer ID from justwatch
function getJWTrailerId(clips = []) {
  return clips.filter(clip => clip.type == "trailer")[0].external_id;
}

//returns only uniqie Providers: eg. Netflix is listed twice as HD and SD
function uniqueProviders(providers = []) {
	return providers.filter( (v, i, a) => a.map(v => v.provider_id).indexOf(v.provider_id) === i );
}

//turn provider id from justwatch to provider name
function IDtoProvider(id = 0) {
  return allProviders.find(
    provider => provider.id == id
  ).clear_name;
}

/*
justwatch
*/

//get justwatch-id of the film
async function getFilmID(title) {
  try {
    var result = await jweng.search({query: title});
    return findFilm(result.items).id;
  } catch(err) {
    console.log("Film not found");
    return null;
  }
}

//get film information from justwatch
async function getFilm(id) {
  if (id != null) {
    return await jw.getTitle('movie', id);
  } else {
    console.log("no film");
    return null;
  }
}

//get film trailer from justwatch-api or parse it from letterboxd
function getTrailer(film) {
  if (film != null && film.clips != null) {
    return trailerProvider + getJWTrailerId(film.clips);
  } try {
    return trailerProvider + getLBTrailerId()
  } catch(err) {
    console.log("no trailer");
    return null;
  }
}

//get providers that offer the film from justwatch
function getFilmProviders(film) {
  if (film != null && film.offers != null) {
    return film.offers.filter(
      provider => provider.monetization_type == "flatrate"
    );
  } else {
    return [];
  }
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
function createProviderPanels(trailer, providers) {
  var providerPanel = $("<section></section>").addClass("provider");
    trailer != null && $(providerPanel).append(getProviderPanel("Trailer", trailer));
    uniqueProviders(providers).forEach(p => $(providerPanel).append(getProviderPanel(IDtoProvider(p.provider_id), p.urls.standard_web)));
    return providerPanel;
}

//display panel
function createStreamPanel(provider) {
  var streamPanel = $("<section></section>").attr('id', 'stream-panel').addClass("watch-panel");
  var title = $("<h3></h3>").addClass("title").text("Watch");
  return streamPanel.append(title).append(provider);
}

/*
main
*/

async function main() {
  setLocale();
  var film = await getFilm(await getFilmID(getFilmTitle()));
  allProviders = await jw.getProviders();
  var streamProviders = createProviderPanels(getTrailer(film), getFilmProviders(film));
  var streamPanel = createStreamPanel(streamProviders);
  $(".watch-panel").replaceWith(streamPanel);
}

main();
