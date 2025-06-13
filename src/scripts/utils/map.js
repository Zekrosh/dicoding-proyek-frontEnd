import L, { map, tileLayer, marker } from "leaflet";

export default class MapWrapper {
  #map = null;
  #marker = null;
  #currentZoom = 13;
  #onLocationChangeCallback = null;

  static isGeolocationAvailable() {
    return "geolocation" in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!MapWrapper.isGeolocationAvailable()) {
        reject(new Error("Geolocation API unsupported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async build(selector, options = {}) {
    let centerCoordinate = options.center;
    const initialZoom = options.zoom || 5;
    const targetZoomAfterLocate = options.targetZoom || 13;

    if (!centerCoordinate) {
      const jakartaCoordinate = [-6.2, 106.816666];
      centerCoordinate = jakartaCoordinate;

      if (options.locate) {
        try {
          const position = await MapWrapper.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
          centerCoordinate = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          options.zoom = targetZoomAfterLocate;
        } catch (error) {
          console.error(
            "Map.build: Gagal mendapatkan lokasi GPS, menggunakan default Jakarta:",
            error.message
          );
          options.zoom = initialZoom;
        }
      } else {
        options.zoom = initialZoom;
      }
    } else {
      options.zoom = targetZoomAfterLocate;
    }

    return new MapWrapper(selector, {
      ...options,
      center: centerCoordinate,
      zoom: options.zoom,
    });
  }

  constructor(selector, options = {}) {
    const mapElement = document.querySelector(selector);
    if (!mapElement) {
      console.error(
        `Elemen kontainer peta dengan selector "${selector}" tidak ditemukan.`
      );
      throw new Error(
        `Elemen kontainer peta dengan selector "${selector}" tidak ditemukan.`
      );
    }

    this.#currentZoom = options.zoom ?? this.#currentZoom;

    const tileOsm = tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    );

    this.#map = map(mapElement, {
      center: options.center,
      zoom: this.#currentZoom,
      scrollWheelZoom:
        options.scrollWheelZoom === undefined ? true : options.scrollWheelZoom,
      layers: [tileOsm],
      ...options.leafletMapOptions,
    });

    this.addOrUpdateMarker(options.center[0], options.center[1], true);

    this.#map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      this.addOrUpdateMarker(lat, lng);
      if (this.#onLocationChangeCallback) {
        this.#onLocationChangeCallback(lat, lng);
      }
    });
  }

  onLocationChange(callback) {
    this.#onLocationChangeCallback = callback;
  }

  addOrUpdateMarker(lat, lng, draggable = true) {
    if (this.#marker) {
      this.#marker.setLatLng([lat, lng]);
    } else {
      this.#marker = marker([lat, lng], { draggable }).addTo(this.#map);

      if (draggable) {
        this.#marker.on("dragend", () => {
          const newPosition = this.#marker.getLatLng();
          if (this.#onLocationChangeCallback) {
            this.#onLocationChangeCallback(newPosition.lat, newPosition.lng);
          }
        });
      }
    }
    this.#map.panTo([lat, lng]);
    return this.#marker;
  }

  setLocation(lat, lng, zoomLevel) {
    const newZoom = zoomLevel || this.#currentZoom;
    this.#map.setView([lat, lng], newZoom);
    this.addOrUpdateMarker(lat, lng);
  }

  getLeafletMapInstance() {
    return this.#map;
  }

  destroy() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
    this.#marker = null;
    this.#onLocationChangeCallback = null;
  }
}
