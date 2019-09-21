let allProviders, options;

/*
parse html
*/

//parse film title from letterboxd page
function getFilmTitle() {
  return document.querySelector("#featured-film-header").firstElementChild.innerText;
}

//parse tMDB ID from letterboxd page
function getLBTmdbId() {
  return parseInt(document.querySelector("body").dataset.tmdbId);
}

//parse Traile ID from letterboxd page
function getLBTrailerId() {
  return document.querySelector(".watch-panel").children[1].firstElementChild.href.substr(24, 11);
}

/*
background & helper
*/

//set Listener for Chrome Storage API
function setStorageListener() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    location.reload();
  });
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

//find a film in a list of films from justwatch
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

function request(method, endpoint, data = null) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, 'https://cors-anywhere.herokuapp.com/apis.justwatch.com/content' + endpoint);
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send(JSON.stringify(data));
  });
}

//get all Providers from justwatch
async function getProviders() {
  return await request("GET", `/providers/locale/${getLocale()}`);
}

//search on justwatch for a film
async function searchTitle(title) {
  try {
    const res = await request("POST", '/titles/en_US/popular', {
      query: title
    });
    return findFilm(res.items);
  } catch {
    console.log("Could not find film with title " + title);
    return {};
  }
}

//get film information from justwatch
async function getFilm(id = 0) {
  try {
    return await request("GET", `/titles/movie/${id}/locale/${getLocale()}`);
  } catch {
    console.log(id + " is not a valid ID");
    return {};
  }
}

//get film trailer from justwatch-api or parse it from letterboxd
function getTrailer({ clips }) {
  if (clips != null) {
    return options.trailerProvider + getJWTrailerId(clips);
  }
  try {
    return options.trailerProvider + getLBTrailerId()
  } catch (err) {
    console.log("No trailer could be found");
    return null;
  }
}

//get providers that offer the film from justwatch
function getFilmProviders({ offers }) {
  if (offers != null) {
    return offers.filter(
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
function getProviderLabel(provider, url) {
  return `<p>
            <a href="${url}" class="label">
              <span class="icon -play"></span>
              <span class="name">${provider}</span>
            </a>
          </p>`
}

//display panel
function createStreamPanel(trailer, providers) {
  return `<h3 class="title">Watch</h3>
          <section>
            ${trailer != null ? getProviderLabel("Trailer", trailer) : ''}
            ${uniqueProviders(providers).map(p => getProviderLabel(IDtoProvider(p.provider_id), p.urls.standard_web)).join('')}
          </section>`
}

/*
main
*/

async function main() {
  setStorageListener();
  options = await getOptions();
  allProviders = await getProviders();
  let filmOV = await searchTitle(getFilmTitle());
  let film = await getFilm(filmOV.id);
  let trailer = getTrailer(options.trailerOV ? filmOV : film);
  let streamPanel = createStreamPanel(trailer, getFilmProviders(film));
  document.querySelector(".watch-panel").innerHTML = streamPanel;
}

main();
