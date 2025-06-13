// pages/story-detail-page.js
import storiesDetails from "../data/storylistdetail-model.js";
import StoryDetailPresenter from "../presenters/storylistdetail-presenter.js";
import {
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from "../utils/template.js";
import { parseActivePathname } from "../routes/url-parser.js";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";

export default class StoryDetailPage {
  #presenter;
  #detailContainer;
  #loadingIndicator;
  #errorMessageElement;
  #mapInstance;

  async render() {
    return `
      <div id="storyDetailLoading">Memuat detail cerita...</div>
      <div id="storyDetailError" class="error"></div>
      <div id="storyDetailContainer" class="story-detail-container-wrapper"></div>
    `;
  }

  async afterRender() {
    this.#detailContainer = document.getElementById("storyDetailContainer");
    this.#loadingIndicator = document.getElementById("storyDetailLoading");
    this.#errorMessageElement = document.getElementById("storyDetailError");

    const parsedPath = parseActivePathname();
    const storyId = parsedPath ? parsedPath.id : null;

    if (!storyId) {
      this.showError("ID cerita tidak ditemukan di URL atau URL tidak valid.");
      if (this.#detailContainer) {
        this.#detailContainer.innerHTML = `<div class="container__backBtn"><a href="#/" class="button">Kembali ke Daftar Cerita</a></div>`;
      }
      if (this.#loadingIndicator) this.#loadingIndicator.style.display = "none";
      return;
    }

    const storyDetailModelInstance = new storiesDetails();
    this.#presenter = new StoryDetailPresenter(storyId, {
      view: this,
      model: storyDetailModelInstance,
    });

    if (this.#presenter) {
      await this.#presenter.loadStoryDetail();
    }
  }

  displayStoryDetail(storyData) {
    if (!storyData) {
      this.showError("Gagal memuat data cerita.");
      return;
    }
    const storyDetailHTML = generateStoryDetailTemplate(storyData);
    this.#detailContainer.innerHTML = storyDetailHTML;

    if (this.#presenter) {
      this.#presenter.showSaveButton();
    }

    if (storyData.lat != null && storyData.lon != null) {
      const mapDiv = this.#detailContainer.querySelector("#storyMapDetail");
      if (mapDiv) {
        // Panggil dengan urutan yang benar
        this._initMap(storyData.lat, storyData.lon, mapDiv);
      }
    }
  }

  // DEFINISIKAN dengan urutan yang benar
  _initMap(lat, lon, mapElement) {
    if (typeof L !== "undefined") {
      if (this.#mapInstance) {
        try {
          this.#mapInstance.remove();
        } catch (e) {
          console.warn("Gagal menghapus instance peta sebelumnya:", e);
        }
        this.#mapInstance = null;
      }
      try {
        this.#mapInstance = L.map(mapElement).setView([lat, lon], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(this.#mapInstance);
        L.marker([lat, lon])
          .addTo(this.#mapInstance)
          .bindPopup("Lokasi cerita.")
          .openPopup();
      } catch (e) {
        if (mapElement) {
          mapElement.innerHTML = "<p><em>Gagal memuat peta.</em></p>";
        }
      }
    } else {
      if (mapElement) {
        mapElement.innerHTML =
          "<p><em>Peta tidak dapat ditampilkan (Library Leaflet tidak termuat).</em></p>";
      }
    }
  }

  renderSaveButton() {
    const saveContainer = document.getElementById("save-actions-container");
    if (saveContainer) {
      saveContainer.innerHTML = generateSaveStoryButtonTemplate();
      document
        .getElementById("saveButton")
        .addEventListener("click", async () => {
          await this.#presenter.saveStory();
        });
    }
  }

  renderRemoveButton() {
    const saveContainer = document.getElementById("save-actions-container");
    if (saveContainer) {
      saveContainer.innerHTML = generateRemoveStoryButtonTemplate();
      document
        .getElementById("removeButton")
        .addEventListener("click", async () => {
          await this.#presenter.removeStory();
        });
    }
  }

  saveToBookmarkSuccessfully(message) {
    alert(message);
  }

  removeFromBookmarkSuccessfully(message) {
    alert(message);
  }

  saveToBookmarkFailed(message) {
    alert(`Gagal: ${message}`);
  }

  showLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "block";
    if (this.#errorMessageElement)
      this.#errorMessageElement.style.display = "none";
    if (this.#detailContainer) this.#detailContainer.innerHTML = "";
  }

  hideLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "none";
  }

  showError(message) {
    if (this.#errorMessageElement) {
      this.#errorMessageElement.textContent = message;
      this.#errorMessageElement.style.display = "block";
    }
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "none";
    if (this.#detailContainer) this.#detailContainer.innerHTML = "";
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }
}
