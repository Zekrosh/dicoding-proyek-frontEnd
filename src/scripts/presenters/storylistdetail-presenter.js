import Database from "../data/database.js";

export default class StoryDetailPresenter {
  #view;
  #model;
  #dbModel;
  #storyId;

  constructor(storyId, { view, model }) {
    this.#view = view;
    this.#model = model;
    this.#storyId = storyId;
    this.#dbModel = Database;

    if (!this.#storyId) {
      console.error(
        "StoryDetailPresenter: storyId tidak diberikan atau tidak valid saat inisialisasi."
      );
    }
  }

  async loadStoryDetail() {
    if (!this.#storyId) {
      this.#view.showError(
        "ID Cerita tidak valid atau tidak tersedia untuk dimuat."
      );
      this.#view.hideLoading();
      return;
    }

    try {
      this.#view.showLoading();
      const storyData = await this.#model.fetchStoryDetail(this.#storyId);
      this.#view.displayStoryDetail(storyData);
    } catch (error) {
      this.#view.showError(
        error.message || "Terjadi kesalahan saat memuat detail cerita."
      );
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveStory() {
    try {
      const story = await this.#model.fetchStoryDetail(this.#storyId);
      await this.#dbModel.putStory(story);
      this.#view.saveToBookmarkSuccessfully(
        "Cerita berhasil disimpan ke bookmark."
      );
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    } finally {
      await this.showSaveButton();
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.deleteStory(this.#storyId);
      this.#view.removeFromBookmarkSuccessfully(
        "Cerita berhasil dihapus dari bookmark."
      );
    } catch (error) {
      console.error("removeStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    } finally {
      await this.showSaveButton();
    }
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();
    if (isSaved) {
      this.#view.renderRemoveButton();
    } else {
      this.#view.renderSaveButton();
    }
  }

  async #isStorySaved() {
    if (!this.#storyId) return false;
    const story = await this.#dbModel.getStoryById(this.#storyId);
    return !!story;
  }
}
