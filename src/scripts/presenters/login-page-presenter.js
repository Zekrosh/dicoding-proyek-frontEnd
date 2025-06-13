export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#view = view;
    this.#model = model;
  }

  async login(email, password) {
    try {
      await this.#model.login(email, password);
      this.#view.showSuccess("Login Berhasil");
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
}
