import RegisterModel from "../data/register-model.js";
import RegisterPresenter from "../presenters/register-page-presenter.js";

export default class RegisterPage {
  #presenter;

  async render() {
    return `
    <section class="container__register">
      <section class="register">
        <h1>Daftar Akun</h1>
        <form id="registerForm">
          <label for="name">Masukkan nama disini</label>
          <input type="text" id="name" placeholder="Nama" required>
          <label for="email">Masukkan Email disini</label>
          <input type="email" id="email" placeholder="Email" required>
          <label for="password">Masukkan Password disini</label>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit" aria-label="Tombol untuk submit form Daftar">Daftar</button>
        </form>
        <p id="errorMessage" class="error"></p>
      </section>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      model: new RegisterModel(),
      view: this,
    });
    document.getElementById("registerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      this.#presenter.registerUser(name, email, password);
    });
  }

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    document.getElementById("errorMessage").textContent = message;
  }

  redirectToLogin() {
    window.location.href = "#/login";
  }
}
