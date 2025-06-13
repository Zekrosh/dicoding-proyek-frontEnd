import { registerAPI } from "./api.js";

export default class RegisterModel {
  async register(name, email, password) {
    this.validateInput(name, email, password);
    const result = await registerAPI(name, email, password);

    if (result.error) {
      throw new Error(result.message);
    }

    return result;
  }

  validateInput(name, email, password) {
    if (!name || !email || !password)
      throw new Error("Semua field wajib diisi");
    if (password.length < 6) throw new Error("Password terlalu pendek");
  }
}
