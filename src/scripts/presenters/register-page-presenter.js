export default class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#view = view;
    this.#model = model;
  }

  async registerUser(name, email, password) {
    try {
      await this.#model.register(name, email, password);
      this.#view.showSuccess("Registrasi berhasil! Silakan login");
      this.#view.redirectToLogin();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
}
