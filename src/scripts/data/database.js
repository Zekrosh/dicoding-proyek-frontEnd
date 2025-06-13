import { openDB } from "idb";
import CONFIG from "../config.js";

const DATABASE_NAME = `${CONFIG.DATABASE_NAME}-v${CONFIG.DATABASE_VERSION}`;
const OBJECT_STORE_NAME = "saved-stories";

const dbPromise = openDB(DATABASE_NAME, CONFIG.DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, {
        keyPath: "id",
      });
    }
  },
});

const Database = {
  async putStory(story) {
    if (!story || !story.id) {
      throw new Error("`id` properti pada story dibutuhkan.");
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async getStoryById(id) {
    if (!id) {
      return null;
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async deleteStory(id) {
    if (!id) {
      throw new Error("`id` dibutuhkan untuk menghapus.");
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;
