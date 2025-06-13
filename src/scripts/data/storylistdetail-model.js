import { getStoryDetailAPI } from "./api.js";

export default class storiesDetails {
  async fetchStoryDetail(storyId) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token otentikasi tidak ditemukan. Silakan login.");
    }

    if (!storyId) {
      throw new Error("ID Cerita diperlukan untuk mengambil detail.");
    }

    const response = await getStoryDetailAPI(storyId, token);

    if (response.error) {
      if (
        response.message &&
        (response.message.toLowerCase().includes("token") ||
          response.message.toLowerCase().includes("unauthorized") ||
          response.message.toLowerCase().includes("forbidden"))
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        throw new Error(
          "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."
        );
      }
      if (
        response.message &&
        response.message.toLowerCase().includes("not found")
      ) {
        throw new Error("Cerita tidak ditemukan.");
      }
      throw new Error(
        response.message || "Gagal mengambil detail cerita dari server."
      );
    }

    if (response.story) {
      return response.story;
    } else {
      throw new Error(
        "Data detail cerita tidak ditemukan dalam respons server."
      );
    }
  }
}
