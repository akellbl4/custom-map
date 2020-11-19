import debounce from "lodash/debounce";

import "./styles.css";

const mapElement = document.querySelector(".map-view");
const frameElement = document.querySelector(".map-frame");
const zoomInButton = document.querySelector(".map-zoom-in");
const zoomOutButton = document.querySelector(".map-zoom-out");

const ZOOM_STEP = 0.2;

const currentDragPosition = { x: 0, y: 0 };
const mapOffset = { x: 0, y: 0 };
const mapPosition = { x: 0, y: 0 };
const startCursorPosition = { x: 0, y: 0 };

const { width, height } = mapElement.getBoundingClientRect();
let {
  width: viewWidth,
  height: viewHeight
} = frameElement.getBoundingClientRect();
let imageWidth = width;
let imageHeight = height;
let zoom = 1;
let dragging = false;

setMapViewPosition();

zoomInButton.addEventListener("click", () => {
  zoom += ZOOM_STEP;
  setCurrentImageSize(zoom);
  console.log("zoomin", zoom);
  mapElement.style.setProperty("--map-scale", `${zoom}`);
});

zoomOutButton.addEventListener("click", () => {
  zoom -= ZOOM_STEP;
  setCurrentImageSize(zoom);
  console.log("zoomout", zoom);
  mapElement.style.setProperty("--map-scale", `${zoom}`);
});

mapElement.addEventListener("mousedown", (evt) => {
  evt.preventDefault();
  dragging = true;
  startCursorPosition.x = evt.pageX;
  startCursorPosition.y = evt.pageY;
  mapElement.classList.add("map-view-grabbing");
  mapElement.classList.remove("map-view-animate");
});

mapElement.addEventListener("mousemove", (evt) => {
  evt.preventDefault();

  if (!dragging) {
    return;
  }

  currentDragPosition.x = evt.pageX - startCursorPosition.x + mapOffset.x;
  currentDragPosition.y = evt.pageY - startCursorPosition.y + mapOffset.y;

  mapElement.style.setProperty(
    "--map-position-x",
    `calc(-50% + ${currentDragPosition.x}px)`
  );
  mapElement.style.setProperty(
    "--map-position-y",
    `calc(-50% + ${currentDragPosition.y}px)`
  );
});

window.addEventListener("mouseup", (evt) => {
  dragging = false;
  mapElement.classList.remove("map-view-grabbing");
  mapOffset.x = currentDragPosition.x;
  mapOffset.y = currentDragPosition.y;

  // min = 0
  // max = 600 (viewWidth)
  const maxHorizontalOffset = (imageWidth - viewWidth) / 2;
  const maxVerticalOffset = (imageHeight - viewHeight) / 2;
  const offsetX = maxHorizontalOffset - mapOffset.x;
  const offsetY = maxVerticalOffset - mapOffset.y;

  //  x = 0
  if (offsetX < 0) {
    mapElement.classList.add("map-view-animate");
    mapElement.style.setProperty(
      "--map-position-x",
      `calc(-50% + ${maxHorizontalOffset}px)`
    );
    mapOffset.x = maxHorizontalOffset;
    mapElement.addEventListener("transitionend", () => {
      mapElement.classList.remove("map-view-animate");
    });
  }
  if (offsetY < 0) {
    console.log("out of view vertical TOP");
  }
  if (offsetX > imageWidth - viewWidth) {
    mapElement.classList.add("map-view-animate");
    mapElement.style.setProperty(
      "--map-position-x",
      `calc(-50% - ${maxHorizontalOffset}px)`
    );
    mapOffset.x = -maxHorizontalOffset;
    mapElement.addEventListener("transitionend", () => {
      mapElement.classList.remove("map-view-animate");
    });
  }
  if (offsetY > imageHeight - viewHeight) {
    console.log("out of view vertical BOTTOM");
  }
});

window.addEventListener("resize", setMapViewPosition);
// window.addEventListener("resize", debounce(setMapViewPosition, 300));

const houses = document.querySelectorAll(".map-house");

houses.forEach((house) => {
  house.addEventListener("click", (evt) => {
    const id = evt.target.dataset.id;

    console.log(id);
  });
});

function setMapViewPosition() {
  const bounds = frameElement.getBoundingClientRect();

  viewHeight = bounds.height;
  viewWidth = bounds.width;
  mapPosition.x = bounds.x; // Много процессора, ограничеть если лагает (debounce)
  mapPosition.y = bounds.y;
}

function setCurrentImageSize(zoom) {
  imageWidth = width * zoom;
  imageHeight = height * zoom;
}
