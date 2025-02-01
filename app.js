const access_key = "Client-ID 5f8zX0jzSeoN_-oYZu6-f4OSV8SvrucmOhL8IkPIyCY";

const form = document.querySelector("form");
const inputQuery = document.querySelector(".inp1");
const inputPerPage = document.querySelector(".inp2");
const photoList = document.querySelector("ul");
const favoriteListPhoto = document.querySelector(".favoriteButton");
const searchPhotoLista = document.querySelector(".wrapper");
const myPhotos = document.querySelector("aside");

// Favorite list
let favoriteList = [];
let myphotosVisible = false;
document.addEventListener("DOMContentLoaded", () => {
  const savedFavorites = JSON.parse(localStorage.getItem("favorites"));
  if (savedFavorites) {
    favoriteList = savedFavorites;
  }
});
// Render favorite list
const renderLightbox = (photos, index) => {
  let currentIndex = index;
  const lightbox =
    document.getElementById("lightbox") || document.createElement("div");
  lightbox.id = "lightbox";
  document.body.appendChild(lightbox);
  lightbox.classList.add("active");
  // Clear lightbox
  while (lightbox.firstChild) {
    lightbox.removeChild(lightbox.firstChild);
  }

  const img = document.createElement("img");
  const left = document.createElement("span");
  const description = document.createElement("span");
  const created_at = document.createElement("p");
  const right = document.createElement("span");

  // Update lightbox
  const updateLightbox = () => {
    img.src = photos[currentIndex].urls.small;
    description.textContent = `Description: ${photos[currentIndex].slug}`;
    created_at.innerHTML = `Created: ${photos[currentIndex].created_at} <br> By: ${photos[currentIndex].user.name}`;
  };

  left.innerHTML = "<";
  right.innerHTML = ">";

  lightbox.append(img, description, created_at, left, right);
  left.classList.add("left");
  right.classList.add("right");

  //Previous buttons to navigate through the photos
  left.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightbox();
  });
  //Next buttons to navigate through the photos
  right.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightbox();
  });
  //Close the lightbox
  lightbox.addEventListener("click", (e) => {
    if (e.target !== e.currentTarget) return;
    lightbox.classList.remove("active");
  });

  updateLightbox();
};
// Render photos after search
function renderPhotos(getPhotos) {
  photoList.innerHTML = "";
  getPhotos.forEach((photo, index) => {
    const li = document.createElement("li");
    const saveButton = document.createElement("button");
    saveButton.textContent = "Add to Favorites";
    const img = document.createElement("img");
    img.src = photo.urls.small;

    li.append(img, saveButton);
    photoList.appendChild(li);
    // Save Photos to favorites
    saveButton.addEventListener("click", () => {
      renderLightbox(getPhotos, index);
      if (!favoriteList.some((fav) => fav.id === photo.id)) {
        favoriteList.push(photo);
        localStorage.setItem("favorites", JSON.stringify(favoriteList));
        /* photoList.removeChild(li); */
      } else {
        alert("This photo is already in your favorites");
      }
    });
    // Lightbox
    /*   li.addEventListener("click", () => renderLightbox(getPhotos, index)); */
  });
}
favoriteListPhoto.addEventListener("click", () => {
  myPhotos.innerHTML = "";
  myphotosVisible = !myphotosVisible;
  favoriteListPhoto.textContent = myphotosVisible
    ? "Back to Search"
    : "My Photos";
  searchPhotoLista.style.display = myphotosVisible ? "none" : "block";
  myPhotos.style.display = myphotosVisible ? "block" : "none";

  if (myphotosVisible) {
    favoriteList.forEach((photo, index) => {
      const divPhotoList = document.createElement("div");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "x";
      const img = document.createElement("img");
      img.src = photo.urls.small;
      divPhotoList.append(img, deleteButton);
      myPhotos.appendChild(divPhotoList);

      img.addEventListener("click", () => {
        renderLightbox(favoriteList, index);
      });

      deleteButton.addEventListener("click", () => {
        favoriteList.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(favoriteList));
        divPhotoList.remove();
      });
    });
  }
});

const searchPhotos = async (photos, pages) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${photos}&per_page=${pages}`,
      {
        headers: {
          Authorization: access_key,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();
    renderPhotos(data.results);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    photoList.innerHTML = `<li>Error loading photos. Please try again later.</li>`;
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const query = inputQuery.value.trim();
  const perPage = parseInt(inputPerPage.value, 30);

  if (!query || isNaN(perPage) || perPage <= 0) {
    alert("Please enter a valid search term and number of photos per page.");
    return;
  }

  searchPhotos(query, perPage);
  inputQuery.value = "";
  inputPerPage.value = "";

  // Ensure search view is visible
  myphotosVisible = false;
  searchPhotoLista.style.display = "block";
  myPhotos.style.display = "none";
  favoriteListPhoto.textContent = "My Photos";
});
