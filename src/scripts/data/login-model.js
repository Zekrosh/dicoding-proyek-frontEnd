import { loginAPI } from "./api.js";

export default class LoginModel {
  async login(email, password) {
    const result = await loginAPI(email, password);

    if (result.error) {
      throw new Error(result.message);
    }

    if (result.loginResult && result.loginResult.token) {
      localStorage.setItem("token", result.loginResult.token);
      localStorage.setItem("userId", result.loginResult.userId);
      localStorage.setItem("userName", result.loginResult.name);
    } else {
      throw new Error("Data login tidak lengkap dari server.");
    }
    return result;
  }
}
