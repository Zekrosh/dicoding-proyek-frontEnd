export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadBookmarkedStories() {
    this.#view.showLoading();
    try {
      const stories = await this.#model.getAllBookmarkedStories();
      this.#view.displayStories(stories);
    } catch (error) {
      this.#view.showError(
        error.message || "Gagal memuat cerita yang disimpan."
      );
    } finally {
      this.#view.hideLoading();
    }
  }
}
