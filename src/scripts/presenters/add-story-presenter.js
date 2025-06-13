export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async submitStory(description, photoFile, lat, lon) {
    if (!description || !photoFile) {
      this.#view.showError("Deskripsi dan file foto wajib diisi.");
      return;
    }
    if (photoFile.size > 1000000) {
      this.#view.showError("Ukuran file foto tidak boleh melebihi 1MB.");
      return;
    }

    try {
      this.#view.showLoading();
      const response = await this.#model.uploadStory(
        description,
        photoFile,
        lat,
        lon
      );
      this.#view.showSuccess(
        response.message || "Cerita berhasil ditambahkan!"
      );
      this.#view.navigateToHome();
    } catch (error) {
      const errorMessage =
        error.message || "Terjadi kesalahan saat menambahkan cerita.";
      this.#view.showError(errorMessage);
      if (
        errorMessage.toLowerCase().includes("sesi") ||
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("otentikasi")
      ) {
        this.#view.navigateToLogin();
      }
    } finally {
      this.#view.hideLoading();
    }
  }
}
