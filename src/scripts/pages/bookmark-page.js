import BookmarkModel from "../data/bookmark-model.js";
import BookmarkPresenter from "../presenters/bookmark-presenter.js";
import { generateStoryItemTemplate } from "../utils/template.js";

export default class BookmarkPage {
  #presenter;
  #storiesContainer;
  #loadingIndicator;
  #errorMessageElement;
  #mainContentId = "bookmarkMainContent";

  constructor() {
    const bookmarkModel = new BookmarkModel();
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: bookmarkModel,
    });
  }

  async render() {
    return `
      <a href="#${
        this.#mainContentId
      }" class="skip-link">Lewati ke Konten Utama</a>
      <main class="container bookmark-page" id="${
        this.#mainContentId
      }" tabindex="-1">
        <div class="bookmark-header">
          <h1>Cerita Tersimpan</h1>
          <a href="#/" class="button button--small">&larr; Kembali ke Beranda</a>
        </div>
        <div id="bookmarkLoading" class="loading-indicator">Memuat cerita yang disimpan...</div>
        <div id="bookmarkError" class="error"></div>
        <div id="bookmarkedStoriesContainer" class="stories-list"></div>
      </main>
    `;
  }

  async afterRender() {
    this.#storiesContainer = document.getElementById(
      "bookmarkedStoriesContainer"
    );
    this.#loadingIndicator = document.getElementById("bookmarkLoading");
    this.#errorMessageElement = document.getElementById("bookmarkError");

    if (this.#presenter) {
      await this.#presenter.loadBookmarkedStories();
    }
  }

  displayStories(stories) {
    if (!stories || stories.length === 0) {
      this.#storiesContainer.innerHTML =
        "<p class='empty-bookmark-message'>Anda belum menyimpan cerita apapun.</p>";
      return;
    }

    const storiesHTML = stories.reduce(
      (accumulator, currentStory) =>
        accumulator + generateStoryItemTemplate(currentStory),
      ""
    );
    this.#storiesContainer.innerHTML = storiesHTML;
  }

  showLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "block";
    if (this.#storiesContainer) this.#storiesContainer.style.display = "none";
    if (this.#errorMessageElement)
      this.#errorMessageElement.style.display = "none";
  }

  hideLoading() {
    if (this.#loadingIndicator) this.#loadingIndicator.style.display = "none";
    if (this.#storiesContainer) this.#storiesContainer.style.display = "block";
  }

  showError(message) {
    if (this.#errorMessageElement) {
      this.#errorMessageElement.textContent = message;
      this.#errorMessageElement.style.display = "block";
    }
    this.hideLoading();
  }
}
