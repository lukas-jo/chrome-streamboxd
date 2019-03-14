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
  return navigator.language.replace("-", "_");
}

//parse film title from letterboxd page
function getFilmTitle() {
  if ($("#featured-film-header").children("h1") != null) {
    return $("#featured-film-header").children("h1").text();
  } else {
    return null;
  }
}

//parse film release year from letterboxd page
function getFilmYear() {
  if ($("#featured-film-header").children("p").children("small").children("a") != null) {
    return $("#featured-film-header").children("p").children("small").children("a").text();
  } else {
    return null;
  }
}

//get justwatch-id of the film
async function getFilmID(title, year) {
  if (title != null && year != null) {
    var t0 = performance.now();
    var result = await jweng.search({query: title, cinema_release: year});
    var t1 = performance.now();
    if (result != null) {
      var len = result.items.length > 3 ? 3 : result.items.length;
      for (var i = 0; i < len; i++) {
        //need better way to compare titles
        if (result.items[i].original_release_year >= year-1 && result.items[i].original_release_year <= year+1) {
          console.log("Streamboxd: " + result.items[i].title + ", " + result.items[i].original_release_year +  " zu finden hat " + Math.round(t1-t0) + "ms gedauert");
          return result.items[i].id
        }
      }
    }
  }
  return null;
}


//get film information from justwatch
async function getFilm(id) {
  if (id != null) {
    var film = await jw.getTitle('movie', id);
    return film;
  } else {
    return null;
  }
}

//get film trailer from justwatch-api or parse it from letterboxd
function getTrailer(film) {
  if (film != null && film.clips != null) {
    var trailerID = film.clips.filter(clip => clip.type == "trailer")[0].external_id;
  } else if ($(".watch-panel").children("p").children("a").attr("href") != null) {
    var trailerID = $(".watch-panel").children("p").children("a").attr("href").substr(24,11);
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
  var film = await getFilm(await getFilmID(getFilmTitle(), getFilmYear()));
  allProviders = await getAllProviders();
  var streamProviders = createProviderPanels(getTrailer(film), getFilmProviders(film));
  var streamPanel = createStreamPanel(streamProviders);
  $(".watch-panel").replaceWith(streamPanel);
}

main();
