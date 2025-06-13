import Database from "./database.js";

export default class BookmarkModel {
  async getAllBookmarkedStories() {
    return Database.getAllStories();
  }
}
