const form = document.querySelector("form");
const inputQuery = document.querySelector(".inp1");
const inputPerPage = document.querySelector(".inp2");
const photoList = document.querySelector("ul");
const myPhotos = document.querySelector("aside");

const access_key = "Client-ID 5f8zX0jzSeoN_-oYZu6-f4OSV8SvrucmOhL8IkPIyCY";

// Favorite list
let favoriteList = [];
//Loadad Myphtos after pages refersh
document.addEventListener("DOMContentLoaded", () => {
  const savedFavorites = localStorage.getItem("favorites");
  if (savedFavorites) {
    favoriteList = JSON.parse(savedFavorites);
  }
});
//Fetch data från url and accesses_key
const searchPhotos = async (photos, pages) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${photos}&per_page=${pages}`,
      {
        headers: {
          Authorization: `${access_key}`,
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
    if (photoList) {
      photoList.innerHTML = `<li>Error loading photos. Please try again later.</li>`;
    }
  }
};
//Hämta data by click submint button
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!inputQuery || !inputPerPage) return;

  const query = inputQuery.value.trim();
  const perPage = parseInt(inputPerPage.value, 10);
  //If input felt empty or wrong filed
  if (!query || isNaN(perPage) || perPage <= 0) {
    alert("Please enter a valid search term and number of photos per page.");
    return;
  }

  //Clear both input field
  searchPhotos(query, perPage);
  inputQuery.value = "";
  inputPerPage.value = "";

  //To make visibility myphotos button after another search
  if (searchPhotoLista && myPhotos && favoriteListPhoto) {
    searchPhotoLista.style.display = "block";
    myPhotos.style.display = "none";
    favoriteListPhoto.textContent = "My Photos";
  }
});

let lightbox = document.getElementById("lightbox");
// Render favorite list
const renderLightbox = (photos, index) => {
  let currentIndex = index;

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    document.body.appendChild(lightbox);
  }

  lightbox.classList.add("active");
  lightbox.innerHTML = "";

  const img = document.createElement("img");
  const left = document.createElement("span");
  const description = document.createElement("p");
  const created_at = document.createElement("p");
  const right = document.createElement("span");

  //Endpoend for Api
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
  // Se to next img
  left.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightbox();
  });
  //Se previous img
  right.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightbox();
  });
  //Close lightbox on click around img
  lightbox.addEventListener("click", (e) => {
    if (e.target !== e.currentTarget) return;
    lightbox?.classList.remove("active");
  });

  updateLightbox();
};

// Render photos after search
function renderPhotos(getPhotos) {
  if (!photoList) return;
  photoList.innerHTML = "";
  getPhotos.forEach((photo, index) => {
    const li = document.createElement("li");
    const saveButton = document.createElement("button");
    saveButton.textContent = "Add to Favorites";
    const img = document.createElement("img");
    img.src = photo.urls.small;
    li.append(img, saveButton);
    if (photoList) {
      photoList.appendChild(li);
    }
    function handleClick() {
      alert("Add photo to se info about image");
    }
    li.addEventListener("click", handleClick);
    //Add ny photos
    saveButton.addEventListener("click", () => {
      li.removeEventListener("click", handleClick);
      renderLightbox(getPhotos, index);
      if (!favoriteList.some((fav) => fav.id === photo.id)) {
        favoriteList.push(photo);
        localStorage.setItem("favorites", JSON.stringify(favoriteList));
      } else {
        alert("This photo is already in your favorites");
        lightbox?.classList.remove("active");
      }
    });
  });
}

const searchPhotoLista = document.querySelector(".wrapper");
const favoriteListPhoto = document.querySelector(".favoriteButton");
let myphotosVisible = false;
//switch between myphoto and search page
favoriteListPhoto?.addEventListener("click", () => {
  if (!myPhotos || !searchPhotoLista || !favoriteListPhoto) return;
  myPhotos.innerHTML = "";
  myphotosVisible = !myphotosVisible;
  favoriteListPhoto.textContent = myphotosVisible
    ? "Back to Search"
    : "My Photos";
  searchPhotoLista.style.display = myphotosVisible ? "none" : "block";
  myPhotos.style.display = myphotosVisible ? "block" : "none";
  //create Div tag in myphto page and appand them delbutton and img
  if (myphotosVisible) {
    favoriteList.forEach((photo, index) => {
      const divPhotoList = document.createElement("div");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "x";
      const img = document.createElement("img");
      img.src = photo.urls.small;
      divPhotoList.append(img, deleteButton);
      if (myPhotos) {
        myPhotos.appendChild(divPhotoList);
      }
      //Click img in my favoriteList to make it lightbox
      img.addEventListener("click", () => {
        renderLightbox(favoriteList, index);
      });
      //Click del button to remove photo från my favoriteList
      deleteButton.addEventListener("click", () => {
        favoriteList.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(favoriteList));
        divPhotoList.remove();
      });
    });
  }
});
