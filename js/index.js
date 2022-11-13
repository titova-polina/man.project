const countryInputRef = document.querySelector("#search");
const resultRef = document.querySelector("#results");
const wrapperRef = document.querySelector("#wrapper");
const countryAPItoFetch = "https://restcountries.com/v3.1/name/";
const fullName = "?fullText=true";

let timeout = null;

async function getRestData(countryName, full = false) {
  clearTimeout(timeout);
  if (!countryName) return null;
  resultRef.innerHTML = `<h3 class="search__error">
                          <lord-icon
                            src="https://cdn.lordicon.com/qmuwmmnl.json"
                            trigger="loop"
                            colors="primary:#ffe600"
                            state="hover"
                            style="width: 50px; height: 50px"
                          >
                          </lord-icon>
                          <span>${"SEARCHING...  " + countryName}</span>
                        </h3>`;
  return new Promise((resolve) => {
    timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          countryAPItoFetch +
            encodeURIComponent(countryName) +
            (full ? fullName : ""),
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (response.ok || response.status === 404)
          resolve(await response.json());
        throw new Error("Error fetching data");
      } catch (err) {
        console.warn(err);
        resolve(err);
      }
    }, 500);
  });
}

function createData(event) {
  const countryName = event.target.value.trim();
  fetchData(countryName);
}

function pushError(message) {
  wrapperRef.classList.add("open");
  resultRef.innerHTML = `<h3 class="search__error">
                          <lord-icon
                            src="https://cdn.lordicon.com/vacmyjrh.json"
                            trigger="loop"
                            colors="primary:#ffe600"
                            state="intro"
                            style="width: 50px; height: 50px"
                          >
                          </lord-icon>
                          <span>${message}</span>
                        </h3>`;
}

function operateData(data) {
  clearResult();
  if (data.message) return pushError(data.message);
  if (data.length > 10)
    return pushError(
      "To many matches found.\nPlease enter more specific query"
    );
  if (data.length === 1) {
    resultRef.innerHTML = getResultMarkup(data);
    wrapperRef.classList.add("open");
  }
  if (data.length > 1) enableResultListListner(data);
}

function clearResult() {
  resultRef.innerHTML = "";
  wrapperRef.classList.remove("open");
  resultRef.removeEventListener("click", resultListenToFetch);
}

function createCountryList(data) {
  return `
            <ul class="search-list wide">
              ${data
                .map(
                  ({ name: { official }, flags: { svg } }) =>
                    `<li class="search-list__item">
                      <p class="search__results-text">
                        <img src="${svg}" class="search-list__item-thumb" alt="flag"/>
                        <span>${official}</span>
                      </p>
                    </li>`
                )
                .join("")}
            </ul>
`;
}

function enableResultListListner(data) {
  wrapperRef.classList.add("open");
  resultRef.innerHTML = createCountryList(data);
  resultRef.addEventListener("click", resultListenToFetch);
}

function resultListenToFetch(event) {
  const country = event.target.querySelector("span").textContent;
  if (country) {
    countryInputRef.value = country;
    fetchData(country, true);
  }
}

async function fetchData(countryName, atOnce = false) {
  try {
    const data = await getRestData(countryName, atOnce);
    if (!data) {
      clearResult();
      return;
    }
    return operateData(data);
  } catch (err) {
    console.warn(err);
  }
}

function getResultMarkup(data) {
  const {
    name: { common, official, nativeName },
    capital: [capital] = [],
    languages,
    maps: { googleMaps },
    population,
    flags: { svg },
    coatOfArms: { svg: svgCoat },
    latlng,
    continents: [continent],
  } = data[0];
  const { official: officialNative } =
    Object.entries(nativeName).find(
      ([key, value]) => key !== "eng" && value
    )?.[1] || {};
  return `<div class="search__results-wrapper">                
            <h3 class="search__results-country">
            <span>${official || common}</span>
            ${officialNative ? `<sub>/ ${officialNative}</sub>` : ""}
            </h3>
              <ul class="search-list">
                <li class="search-list__item">
                  <h4 class="search__results-info">Capital</h4>
                  <p class="search__results-text">${capital || "-"}</p>
                </li>
              </ul>
              <div class="search__results-cont">
                <ul class="search-list">
                  <li class="search-list__item">
                    <h4 class="search__results-info">Population</h4>
                    <p class="search__results-text">${population}</p>
                  </li>
                  <li class="search-list__item">
                    <h4 class="search__results-info">Languages</h4>
                    ${Object.values(languages).map(
                      (lang) => `<p class="search__results-text">${lang}</p>`
                    )}
                  </li>
                  <li class="search-list__item">
                    <h4 class="search__results-info">Google Maps</h4>
                    <a class="search__results-text link" href="${googleMaps}" target="_blank">
                      <span>${continent}</span>
                      <sub>(${latlng.join(", ")})<sub>
                    </a>
                  </li>
                </ul>
                <ul class="search-list">
                  <li class="search-list__item">
                    <h4 class="search__results-info">Flag</h4>
                    <div class="search__results-flag" style="background-image:url(${svg})"></div>
                  </li>
                </ul>
                <ul>
                  <li class="search-list__item">
                    <h4 class="search__results-info">Coat of arms</h4>
                    <div class="search__results-flag" style="background-image:url(${svgCoat})"></div>
                  </li>
                </ul>
              </div>
              
            </div>`;
}

countryInputRef.addEventListener("input", createData);
