const JustWatch = require('justwatch-api');

/*
globals ... meh
*/

var jw;
var jweng = new JustWatch({
  locale: 'en_US'
});

var options;
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

async function getOptions() {
  var opt = await chrome.storage.local.get(['options'])
  return JSON.parse(opt.options);
}

//check if a String is a locale
function isLocale(locale) {
  return typeof locale === "string" && /[a-z][a-z]_[A-Z][A-Z]/.test(locale);
}

//get user location
function getLocale() {
  if (isLocale(options.locale)) {
    return options.locale;
  } else if (isLocale(navigator.language.replace("-", "_"))) {
    return navigator.language.replace("-", "_");
  } else {
    return "en_US" //default locale
  }
}

//find the tMDB ID of a film from justwatch
function getJWTmdbId(scoring = []) {
  return scoring.find(item => item.provider_type === "tmdb:id").value;
}

//find a film in a list of film from justwatch
function findFilm(films = []) {
  return films.find(film => getJWTmdbId(film.scoring) === getLBTmdbId());
}

//get the Trailer ID from justwatch
function getJWTrailerId(clips = []) {
  return clips.filter(clip => clip.type === "trailer")[0].external_id;
}

//returns only uniqie Providers: eg. Netflix is listed twice as HD and SD
function uniqueProviders(providers = []) {
  return providers.filter((v, i, a) => a.map(v => v.provider_id).indexOf(v.provider_id) === i);
}

//turn provider id from justwatch to provider name
function IDtoProvider(id = 0) {
  try {
    return allProviders.find(provider => provider.id === id).clear_name;
  } catch (err) {
    console.log("Could not find Provider with ID " + id);
    return "Unbekannt";
  }
}

/*
justwatch
*/

//get justwatch-id of the film
async function getFilmID(title) {
  try {
    var result = await jweng.search({
      query: title
    });
    return findFilm(result.items).id;
  } catch (err) {
    console.log("Could not find film with title " + title);
    return null;
  }
}

//get film information from justwatch
async function getFilm(id = 0) {
  try {
    return await jw.getTitle('movie', id);
  } catch (err) {
    console.log(id + " is not a valid ID")
    return null;
  }
}

//get film trailer from justwatch-api or parse it from letterboxd
function getTrailer(film) {
  if (film != null && film.clips != null) {
    return trailerProvider + getJWTrailerId(film.clips);
  }
  try {
    return trailerProvider + getLBTrailerId()
  } catch (err) {
    console.log("No trailer could be found");
    return null;
  }
}

//get providers that offer the film from justwatch
function getFilmProviders(film) {
  if (film != null && film.offers != null) {
    return film.offers.filter(
      provider => provider.monetization_type === "flatrate"
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
  streamPanel.append($(".watch-panel").children("p").attr("hidden", "true"));
  return streamPanel.append(title).append(provider);
}

/*
main
*/

async function main() {
  options = await getOptions();
  jw = new JustWatch({
    locale: getLocale()
  });
  var film = await getFilm(await getFilmID(getFilmTitle()));
  allProviders = await jw.getProviders();
  var streamProviders = createProviderPanels(getTrailer(film), getFilmProviders(film));
  var streamPanel = createStreamPanel(streamProviders);
  $(".watch-panel").replaceWith(streamPanel);
  $("#div-gpt-ad-1529350096921-1").remove(); //remove ad
}

main();
