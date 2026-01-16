const searchInput = document.getElementById("search_bar");
const searchButton = document.getElementById("inputButton");
const gallery = document.getElementById("gallery");
const tagButtons = Array.from(document.querySelectorAll(".tag"));

const API_KEY = "SqtLnaigBIVNIHzSoKu7HIQecjZlrkn1";
const LIMIT = 18; // max results per request

const setMessage = (text) => {
  gallery.innerHTML = "";
  const message = document.createElement("div");
  message.className = "gallery-message";
  message.textContent = text;
  gallery.appendChild(message);
};

const renderGifs = (items) => {
  gallery.innerHTML = "";

  if (!items || items.length === 0) {
    setMessage("No GIFs found. Try another search.");
    return;
  }

  items.forEach((gif) => {
    const card = document.createElement("article");
    card.className = "gif-card";

    const image = document.createElement("img");
    image.src =
      gif?.images?.downsized_medium?.url || gif?.images?.original?.url || "";
    image.alt = gif?.title || "GIF result";
    image.loading = "lazy";

    const caption = document.createElement("div");
    caption.className = "gif-caption";
    caption.textContent = gif?.title || "Untitled GIF";

    card.appendChild(image);
    card.appendChild(caption);
    gallery.appendChild(card);
  });
};

const fetchGifs = async (term) => {
  // Build the correct endpoint for trending vs query search
  const endpoint =
    term === "trending"
      ? `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${LIMIT}`
      : `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(
          term
        )}&api_key=${API_KEY}&limit=${LIMIT}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Unable to fetch GIFs");
  }
  const json = await response.json();
  return json?.data ?? [];
};

const setActiveTag = (term) => {
  tagButtons.forEach((btn) => {
    btn.classList.toggle("active", term && btn.dataset.term === term);
  });
};

const handleSearch = async (termOverride) => {
  // Prioritize explicit tag term; otherwise read the input value
  const query = termOverride || searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  searchInput.value = query;
  setActiveTag(termOverride ? termOverride : "");
  setMessage("Loading GIFs...");

  try {
    const gifs = await fetchGifs(query);
    renderGifs(gifs);
  } catch (error) {
    console.error(error);
    setMessage("Unable to load GIFs right now. Please try again.");
  }
};

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchButton.addEventListener("click", () => handleSearch());

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const term = button.dataset.term;
    handleSearch(term);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  // Prime the gallery with trending GIFs on first load
  handleSearch("trending");
});
