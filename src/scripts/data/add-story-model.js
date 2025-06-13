import { addNewStoryAPI } from "./api.js";

export default class AddStoryModel {
  async uploadStory(description, photoFile, lat, lon) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token otentikasi tidak ditemukan. Silakan login.");
    }

    if (!description || !photoFile) {
      throw new Error("Deskripsi dan file foto wajib diisi.");
    }

    const response = await addNewStoryAPI(
      token,
      description,
      photoFile,
      lat,
      lon
    );

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
      throw new Error(response.message || "Gagal mengunggah cerita.");
    }

    return response;
  }
}
