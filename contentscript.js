const JustWatch = require('justwatch-api');

/*
background
*/

var jw;
var jweng = new JustWatch({
  locale: 'en_US'
});
var allProviders;
var trailerProvider = "https://www.invidio.us/watch?v=";

chrome.storage.onChanged.addListener(function(changes, namespace) {
  main();
});

//get user location
function setLocale() {
  chrome.storage.local.get(['options'], function(result) {
    var pattloc = /[a-z][a-z]_[A-Z][A-Z]/;
    var loc = navigator.language.replace("-", "_");
    var opt = JSON.parse(result.options);
    var resloc = opt.locale;
    if (resloc != null && pattloc.test(resloc)) {
      loc = resloc;
    }
    jw = new JustWatch({
      locale: loc
    });
  });
}

//parse film title from letterboxd page
function getFilmTitle() {
  try {
    return $("#featured-film-header").children("h1").text();
  } catch (err) {
    console.log("No Film Title");
    return null;
  }
}

//parse tMDB ID from letterboxd page
function getTmdbId() {
  return parseInt($("body").attr("data-tmdb-id"));
}

//get justwatch-id of the film
async function getFilmID(title) {
  try {
    var result = await jweng.search({
      query: title
    });
    return result.items.find(function(film) {
      return film.scoring.find(function(item) {
        return item.provider_type == "tmdb:id";
      }).value == getTmdbId()
    }).id;
  } catch {
    console.log("Film not found");
    return null;
  }
}

//get film information from justwatch
async function getFilm(id) {
  if (id != null) {
    return await jw.getTitle('movie', id);
  } else {
    return null;
  }
}

//get film trailer from justwatch-api or parse it from letterboxd
function getTrailer(film) {
  if (film != null && film.clips != null) {
    var trailerID = film.clips.filter(clip => clip.type == "trailer")[0].external_id;
  } else if ($(".watch-panel").children("p").children("a").attr("href") != null) {
    var trailerID = $(".watch-panel").children("p").children("a").attr("href").substr(24, 11);
  } else {
    return null;
  }
  return trailerProvider + trailerID;
}

//get all available providers from justwatch
async function getAllProviders() {
  var providers = await jw.getProviders();
  if (providers != null) {
    return providers.filter(provider => provider.monetization_types.includes("flatrate"));
  } else {
    return [];
  }
}

//get providers that offer the film from justwatch
function getFilmProviders(film) {
  if (film != null && film.offers != null) {
    return film.offers.filter(provider => provider.monetization_type == "flatrate");
  } else {
    return [];
  }
}

//turn provider id from justwatch to provider name
function IDtoProvider(id) {
  return allProviders.find(function(provider) {
    return provider.id == id;
  }).clear_name;
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
  if (trailer != null || providers.length > 0) {
    trailer != null && $(providerPanel).append(getProviderPanel("Trailer", trailer));
    var ind = [];
    var id = 0;
    for (var i = 0; i < providers.length; i++) {
      id = providers[i].provider_id;
      ind.push(id);
      if (ind.indexOf(id) == i) {
        $(providerPanel).append(getProviderPanel(IDtoProvider(id), providers[i].urls.standard_web));
      }
    }
    return providerPanel;
  } else {
    throw "nothing found";
  }
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
  allProviders = await getAllProviders();
  var streamProviders = createProviderPanels(getTrailer(film), getFilmProviders(film));
  var streamPanel = createStreamPanel(streamProviders);
  $(".watch-panel").replaceWith(streamPanel);
}

main();
