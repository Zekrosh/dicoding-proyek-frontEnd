export default class StoryListPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadStories() {
    try {
      this.#view.showLoading();

      const stories = await this.#model.fetchStories();

      this.#view.displayStories(stories);
    } catch (error) {
      this.#view.showError(error.message || "Gagal memuat cerita.");

      if (
        error.message.toLowerCase().includes("sesi anda tidak valid") ||
        error.message.toLowerCase().includes("token otentikasi tidak ditemukan")
      ) {
        this.#view.navigateToLogin();
      }
    } finally {
      this.#view.hideLoading();
    }
  }
}
