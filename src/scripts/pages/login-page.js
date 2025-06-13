import LoginModel from "../data/login-model";
import LoginPresenter from "../presenters/login-page-presenter";

export default class LoginPage {
  #presenter;
  async render() {
    return `
      <section class="container__login">
      <h1>LOGIN</h1>
        <div class="login-user">
          <form id="loginForm">
            <label for="LoginEmail">Masukkan Email disini</label>
            <input type="email" id="loginEmail" placeholder="Email" required >
            <label for="LoginPassword">Masukkan password disini</label>
            <input type="password" id="loginPassword" placeholder="Password" required>
            <button type="submit" aria-label="Submit untuk Login">Login</button>
          </form>
          <p id="loginErrorMessage" class="error"></p>
          <p id="loginSuccessMessage" class="success"></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      model: new LoginModel(),
      view: this,
    });
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    this.clearMessages();

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.clearMessages();

      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        this.showError("Email dan password tidak boleh kosong.");
        return;
      }

      await this.#presenter.login(email, password);
    });
  }
  showSuccess(message) {
    const successMessageElement = document.getElementById(
      "loginSuccessMessage"
    );
    if (successMessageElement) {
      successMessageElement.textContent = message;
    }
    setTimeout(() => {
      window.location.href = "#/";
    }, 1000);
  }

  showError(message) {
    const errorMessageElement = document.getElementById("loginErrorMessage");
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
    }
  }

  clearMessages() {
    const errorMessageElement = document.getElementById("loginErrorMessage");
    const successMessageElement = document.getElementById(
      "loginSuccessMessage"
    );
    if (errorMessageElement) errorMessageElement.textContent = "";
    if (successMessageElement) successMessageElement.textContent = "";
  }
}
