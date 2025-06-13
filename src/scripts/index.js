import "../styles/styles.css";
import "../styles/storylist.css";
import "../styles/storylistdetail-style.css";
import "../styles/addstory.css";
import "../styles/loginandregister.css";
import "../styles/subscribe.css";
import { registerServiceWorker } from "./utils";
import App from "./pages/app.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
