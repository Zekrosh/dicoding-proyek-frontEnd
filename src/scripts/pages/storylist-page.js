import storyListModel from "../data/storylist-model.js";
import StoryListPresenter from "../presenters/storylist-presenter.js";
import { generateStoryItemTemplate } from "../utils/template";

export default class StoryListPage {
  #presenter;
  #storiesContainer;
  #loadingIndicator;
  #errorMessageElement;

  async render() {
    return `
      <article class="container__welcome">
        <div class="container__title">
          <h1>Welcome To Dicoding Story</h1>
          <h2>Share your story or see others story!</h2>
        </div>
          <div class="container__btn_skipToContent">
          <a href="#mainContent" class="button add-story-button" id="btn_skip">Skip to Content</a>
        </div>
      </article>

      <article class="container__stories-page" id="mainContent">
        <div class="stories-header">
          <h1>Daftar Cerita</h1>
          <div>
            <a href="#/bookmark" class="button add-story-button">Laporan Tersimpan</a>
            <a href="#/add" class="button add-story-button">Tambah Cerita Baru</a>
          </div>
        </div>
        <p id="storyListLoading" style="display:none;">Memuat cerita...</p>
        <p id="storyListError" class="error" style="color: red; display:none;"></p>
        <div id="storiesContainer" class="stories-list">
          </div>
      </article>
    `;
  }

  async afterRender() {
    this.#storiesContainer = document.getElementById("storiesContainer");
    this.#loadingIndicator = document.getElementById("storyListLoading");
    this.#errorMessageElement = document.getElementById("storyListError");

    const storyListModelInstance = new storyListModel();
    this.#presenter = new StoryListPresenter({
      view: this,
      model: storyListModelInstance,
    });

    if (this.#presenter) {
      this.#presenter.loadStories();
    }

    const contentMain = document.querySelector("#mainContent");
    const skipLink = document.querySelector("#btn_skip");

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      contentMain.focus();
      contentMain.scrollIntoView();
    });
  }

  displayStories(stories) {
    this.#storiesContainer.innerHTML = "";
    if (!stories || stories.length === 0) {
      this.#storiesContainer.innerHTML =
        "<p>Belum ada cerita yang tersedia.</p>";
      return;
    }

    const storiesHTML = stories.reduce((accumulator, currentStory) => {
      return accumulator + generateStoryItemTemplate(currentStory);
    }, "");

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
    if (this.#storiesContainer) this.#storiesContainer.innerHTML = "";
    console.error(message);
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }
}
