import { getStories } from "./api";

export default class storyListModel {
  async fetchStories() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token otentikasi tidak ditemukan. Silakan login.");
    }

    const response = await getStories(token);

    if (response.error) {
      if (
        response.message &&
        (response.message.toLowerCase().includes("token") ||
          response.message.toLowerCase().includes("unauthorized"))
      ) {
        localStorage.removeItem("token");
        throw new Error(
          "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."
        );
      }
      throw new Error(
        response.message || "Gagal mengambil data cerita dari server."
      );
    }

    return response.listStory || [];
  }
}
