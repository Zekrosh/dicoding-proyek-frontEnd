import AddStoryModel from "../data/add-story-model.js";
import AddStoryPresenter from "../presenters/add-story-presenter.js";
import MapWrapper from "../utils/map.js";
import Camera from "../utils/camera.js";

export default class AddStoryPage {
  #presenter;
  #formAddStory;
  #descriptionInput;
  #photoInput;
  #latInput;
  #lonInput;
  #loadingIndicator;
  #errorMessageElement;
  #successMessageElement;
  #imagePreview;
  #useCurrentLocationButton;
  #inputMapWrapper = null;
  #mainContentId = "addStoryMainContent";
  #cameraInstance = null;
  #cameraContainer;
  #cameraVideoElement;
  #cameraSelectElement;
  #cameraCanvasElement;
  #toggleCameraButton;
  #capturedPhotoFile = null;
  #isCameraActive = false;

  async render() {
    return `
      <a href="#${
        this.#mainContentId
      }" class="skip-link">Lewati ke Konten Utama</a>
      <main class="container add-story-page" id="${
        this.#mainContentId
      }" tabindex="-1">
        <div class="add-story__header">
          <a href="#/" class="button button--outline button--small" aria-label="Kembali ke halaman utama">&larr; Kembali</a>
          <h1>Tambah Cerita Baru</h1>
        </div>

        <form id="formAddStory" class="add-story__form" novalidate>
          <div class="form-group">
            <label for="addStoryDescription">Deskripsi Cerita:</label>
            <textarea id="addStoryDescription" name="description" rows="5" required aria-describedby="descriptionError"></textarea>
            <div class="input-error-message" id="descriptionError" aria-live="polite"></div>
          </div>

          <div class="form-group">
            <label>Ambil Foto dengan Kamera:</label>
            <button type="button" id="addStoryToggleCameraButton" class="button button--secondary">Buka Kamera</button>
            <div id="addStoryCameraContainer" class="camera-section" style="display:none;">
              <video id="addStoryCameraVideo" playsinline muted autoplay></video>
              <canvas id="addStoryCameraCanvas"></canvas>
              <div class="camera-controls">
                <label for="addStoryCameraSelect" class="sr-only">Pilih Kamera:</label>
                <select id="addStoryCameraSelect"></select>
                <button type="button" id="addStoryTakePictureButton" class="button">Ambil Gambar</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="addStoryPhoto">Atau Unggah Foto Cerita (Max 1MB):</label>
            <input type="file" id="addStoryPhoto" name="photo" accept="image/jpeg, image/png, image/gif" aria-describedby="photoError">
            <img id="imagePreview" src="#" alt="Pratinjau gambar yang akan diunggah">
            <div class="input-error-message" id="photoError" aria-live="polite"></div>
          </div>

          <fieldset class="form-group form-group--location">
            <legend>Informasi Lokasi Cerita (Opsional)</legend>
            <button type="button" id="useCurrentLocationButton" class="button button--secondary">Ambil Lokasi GPS Saat Ini</button>
            <p class="location-separator">atau pilih lokasi di peta:</p>
            <div id="addStoryMapContainer" aria-label="Peta untuk memilih lokasi cerita"></div>
            <div class="coordinates-inputs">
                <div>
                    <label for="addStoryLat">Latitude:</label>
                    <input type="number" id="addStoryLat" name="lat" step="any" placeholder="-6.2000000 (Contoh)">
                </div>
                <div>
                    <label for="addStoryLon">Longitude:</label>
                    <input type="number" id="addStoryLon" name="lon" step="any" placeholder="106.8166660 (Contoh)">
                </div>
            </div>
          </fieldset>
          
          <div id="addStoryLoading"></div>
          <div id="addStoryError" class="error" role="alert"></div>
          <div id="addStorySuccess" class="success" role="status"></div>

          <button type="submit" class="button button--primary add-story__submit-button">Unggah Cerita</button>
        </form>
      </main>
    `;
  }

  async afterRender(presenter) {
    if (!presenter) {
      const addStoryModelInstance = new AddStoryModel();
      this.#presenter = new AddStoryPresenter({
        view: this,
        model: addStoryModelInstance,
      });
    } else {
      this.#presenter = presenter;
    }

    this.#formAddStory = document.getElementById("formAddStory");
    this.#descriptionInput = document.getElementById("addStoryDescription");
    this.#photoInput = document.getElementById("addStoryPhoto");
    this.#latInput = document.getElementById("addStoryLat");
    this.#lonInput = document.getElementById("addStoryLon");
    this.#imagePreview = document.getElementById("imagePreview");
    this.#useCurrentLocationButton = document.getElementById(
      "useCurrentLocationButton"
    );

    this.#loadingIndicator = document.getElementById("addStoryLoading");
    this.#errorMessageElement = document.getElementById("addStoryError");
    this.#successMessageElement = document.getElementById("addStorySuccess");

    this.#cameraContainer = document.getElementById("addStoryCameraContainer");
    this.#cameraVideoElement = document.getElementById("addStoryCameraVideo");
    this.#cameraSelectElement = document.getElementById("addStoryCameraSelect");
    this.#cameraCanvasElement = document.getElementById("addStoryCameraCanvas");
    this.#toggleCameraButton = document.getElementById(
      "addStoryToggleCameraButton"
    );

    this.#photoInput.addEventListener(
      "change",
      this._handlePhotoInputChange.bind(this)
    );
    this.#useCurrentLocationButton.addEventListener(
      "click",
      this._handleGetCurrentLocation.bind(this)
    );
    this.#toggleCameraButton.addEventListener(
      "click",
      this._handleToggleCamera.bind(this)
    );

    this._initializeInteractiveMap();
    this._initializeCamera();

    this.#formAddStory.addEventListener(
      "submit",
      this._handleFormSubmit.bind(this)
    );
    this.#latInput.addEventListener(
      "change",
      this._handleCoordinateInputChange.bind(this)
    );
    this.#lonInput.addEventListener(
      "change",
      this._handleCoordinateInputChange.bind(this)
    );

    const mainContentElement = document.getElementById(this.#mainContentId);
    if (
      mainContentElement &&
      window.location.hash === `#${this.#mainContentId}`
    ) {
      mainContentElement.focus();
    }
  }

  _initializeCamera() {
    this.#cameraInstance = new Camera({
      video: this.#cameraVideoElement,
      cameraSelect: this.#cameraSelectElement,
      canvas: this.#cameraCanvasElement,
    });
    this.#cameraInstance.addCheeseButtonListener(
      "#addStoryTakePictureButton",
      this._handleTakePicture.bind(this)
    );
  }

  _handleToggleCamera() {
    if (this.#isCameraActive) {
      this.#cameraInstance.stop();
      this.#cameraContainer.style.display = "none";
      this.#toggleCameraButton.textContent = "Buka Kamera";
      this.#isCameraActive = false;
      Camera.stopAllStreams();
    } else {
      this.#cameraContainer.style.display = "block";
      this.#cameraInstance
        .launch()
        .then(() => {
          this.#toggleCameraButton.textContent = "Tutup Kamera";
          this.#isCameraActive = true;
        })
        .catch((err) => {
          console.error("Gagal membuka kamera:", err);
          this.showError(
            "Gagal mengakses kamera. Pastikan izin sudah diberikan."
          );
          this.#cameraContainer.style.display = "none";
        });
    }
  }

  async _handleTakePicture() {
    if (this.#cameraInstance && this.#isCameraActive) {
      const blob = await this.#cameraInstance.takePicture();
      if (blob) {
        this.#capturedPhotoFile = new File([blob], `camera-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        const reader = new FileReader();
        reader.onload = (e) => {
          this.#imagePreview.src = e.target.result;
          this.#imagePreview.style.display = "block";
        };
        reader.readAsDataURL(this.#capturedPhotoFile);
        this.#photoInput.value = "";
        this.showSuccess("Gambar berhasil diambil dari kamera!");
        setTimeout(() => this.clearMessages(false, true, false), 2000);
      } else {
        this.showError("Gagal mengambil gambar dari kamera.");
      }
    } else {
      this.showError("Kamera belum aktif untuk mengambil gambar.");
    }
  }

  _handlePhotoInputChange(event) {
    this.#capturedPhotoFile = null;
    this._previewImage(event);
  }

  _previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      if (event.target.id === "addStoryPhoto") {
        this.#capturedPhotoFile = null;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.#imagePreview.src = e.target.result;
        this.#imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else if (!this.#capturedPhotoFile) {
      this.#imagePreview.src = "#";
      this.#imagePreview.style.display = "none";
    }
  }

  async _handleFormSubmit(event) {
    event.preventDefault();
    this.clearMessages();

    const description = this.#descriptionInput.value.trim();
    const photoFileToSubmit =
      this.#capturedPhotoFile || this.#photoInput.files[0];
    const lat = this.#latInput.value ? parseFloat(this.#latInput.value) : null;
    const lon = this.#lonInput.value ? parseFloat(this.#lonInput.value) : null;

    let isValid = true;
    document.getElementById("descriptionError").textContent = "";
    document.getElementById("photoError").textContent = "";

    if (!description) {
      document.getElementById("descriptionError").textContent =
        "Deskripsi wajib diisi.";
      this.#descriptionInput.focus();
      isValid = false;
    }
    if (!photoFileToSubmit) {
      document.getElementById("photoError").textContent =
        "Foto wajib diambil atau diunggah.";
      if (isValid) this.#photoInput.focus();
      isValid = false;
    } else if (photoFileToSubmit.size > 1000000) {
      document.getElementById("photoError").textContent =
        "Ukuran file foto tidak boleh melebihi 1MB.";
      if (isValid) this.#photoInput.focus();
      isValid = false;
    }

    if (isValid && this.#presenter) {
      await this.#presenter.submitStory(
        description,
        photoFileToSubmit,
        lat,
        lon
      );
    } else if (!isValid) {
      this.showError(
        "Silakan perbaiki semua error pada form sebelum mengirim."
      );
    }
  }

  async _initializeInteractiveMap() {
    if (this.#inputMapWrapper) {
      this.#inputMapWrapper.destroy();
    }
    try {
      const initialLat = parseFloat(this.#latInput.value);
      const initialLon = parseFloat(this.#lonInput.value);
      let options = {
        locate: true,
        zoom: 5,
        targetZoom: 15,
        leafletMapOptions: { scrollWheelZoom: true },
      };

      if (!isNaN(initialLat) && !isNaN(initialLon)) {
        options.center = [initialLat, initialLon];
        options.locate = false;
        options.zoom = 15;
      }

      this.#inputMapWrapper = await MapWrapper.build(
        "#addStoryMapContainer",
        options
      );

      if (this.#inputMapWrapper) {
        this.#inputMapWrapper.onLocationChange((lat, lng) => {
          this.#latInput.value = lat.toFixed(7);
          this.#lonInput.value = lng.toFixed(7);
        });
      }
    } catch (error) {
      console.error("Gagal menginisialisasi peta interaktif:", error.message);
      const mapContainer = document.getElementById("addStoryMapContainer");
      if (mapContainer)
        mapContainer.innerHTML =
          "<p><em>Peta interaktif gagal dimuat. Anda masih bisa input koordinat manual atau via GPS.</em></p>";
    }
  }

  _handleCoordinateInputChange() {
    if (this.#inputMapWrapper) {
      const lat = parseFloat(this.#latInput.value);
      const lon = parseFloat(this.#lonInput.value);
      if (!isNaN(lat) && !isNaN(lon)) {
        this.#inputMapWrapper.setLocation(lat, lon);
      }
    }
  }

  async _handleGetCurrentLocation() {
    if (MapWrapper.isGeolocationAvailable()) {
      this.showLoading();
      this.clearMessages(true, true, false);
      try {
        const position = await MapWrapper.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.#latInput.value = lat.toFixed(7);
        this.#lonInput.value = lon.toFixed(7);

        if (this.#inputMapWrapper) {
          this.#inputMapWrapper.setLocation(lat, lon, 15);
        }
        this.hideLoading();
        this.showSuccess("Lokasi GPS berhasil diambil!");
        setTimeout(() => this.clearMessages(false, true, false), 2000);
      } catch (error) {
        let message = "Tidak bisa mendapatkan lokasi: ";
        if (error instanceof Error) {
          if (error.message.includes("Geolocation API unsupported")) {
            message = error.message;
          } else {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message += "Izin akses lokasi ditolak.";
                break;
              case error.POSITION_UNAVAILABLE:
                message += "Informasi lokasi tidak tersedia.";
                break;
              case error.TIMEOUT:
                message += "Waktu permintaan lokasi habis.";
                break;
              default:
                message += `Error tidak diketahui (${error.message}).`;
                break;
            }
          }
        } else {
          message += "Terjadi kesalahan internal.";
        }
        this.showError(message);
        this.hideLoading();
      }
    } else {
      this.showError("Geolocation tidak didukung oleh browser ini.");
    }
  }

  showLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "block";
    this.clearMessages(false, true, true);
    const submitButton = this.#formAddStory
      ? this.#formAddStory.querySelector('button[type="submit"]')
      : null;
    if (submitButton) submitButton.disabled = true;
  }

  hideLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "none";
    const submitButton = this.#formAddStory
      ? this.#formAddStory.querySelector('button[type="submit"]')
      : null;
    if (submitButton) submitButton.disabled = false;
  }

  showError(message) {
    if (this.#errorMessageElement) {
      this.#errorMessageElement.textContent = message;
      this.#errorMessageElement.style.display = "block";
      this.#errorMessageElement.focus();
    }
    this.clearMessages(true, false, true);
  }

  showSuccess(message) {
    if (this.#successMessageElement) {
      this.#successMessageElement.textContent = message;
      this.#successMessageElement.style.display = "block";
      if (message.toLowerCase().includes("cerita berhasil ditambahkan")) {
        this.#successMessageElement.focus();
      }
    }
    if (!message.toLowerCase().includes("gps berhasil diambil")) {
      this.clearMessages(true, true, false);
    }

    if (
      this.#formAddStory &&
      message.toLowerCase().includes("cerita berhasil ditambahkan")
    ) {
      this.#formAddStory.reset();
      if (this.#imagePreview) {
        this.#imagePreview.src = "#";
        this.#imagePreview.style.display = "none";
      }
      this.#capturedPhotoFile = null;
      if (this.#latInput) this.#latInput.value = "";
      if (this.#lonInput) this.#lonInput.value = "";
      if (this.#inputMapWrapper) {
        const jakartaCoordinate = [-6.2, 106.816666];
        this.#inputMapWrapper.setLocation(
          jakartaCoordinate[0],
          jakartaCoordinate[1],
          5
        );
        this.#inputMapWrapper.removeMarker();
      }
      if (this.#isCameraActive) {
        this._handleToggleCamera();
      }
    }
  }

  clearMessages(clearError = true, clearSuccess = true, clearLoading = false) {
    if (clearError && this.#errorMessageElement)
      this.#errorMessageElement.style.display = "none";
    if (clearSuccess && this.#successMessageElement)
      this.#successMessageElement.style.display = "none";
    if (clearLoading && this.#loadingIndicator)
      this.#loadingIndicator.style.display = "none";
  }

  navigateToHome() {
    setTimeout(() => {
      window.location.hash = "#/";
    }, 1500);
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }
}
