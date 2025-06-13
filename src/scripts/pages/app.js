import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";
import {
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../utils/template";
import { isServiceWorkerAvailable } from "../utils/index.js";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper.js";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async #setupNotification() {
    const notificationTools = document.getElementById("notification-btn");
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    notificationTools.innerHTML = "";

    if (isSubscribed) {
      notificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupNotification();
          });
        });

      return;
    }

    notificationTools.innerHTML = generateSubscribeButtonTemplate();
    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupNotification();
        });
      });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    const updateDOM = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      if (isServiceWorkerAvailable()) {
        this.#setupNotification();
      }
    };
    if (!document.startViewTransition) {
      await updateDOM();
      return;
    }
    document.startViewTransition(updateDOM);
  }
}

export default App;
