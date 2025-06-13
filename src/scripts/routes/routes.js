import LoginPage from "../pages/login-page.js";
import RegisterPage from "../pages/register-page.js";
import StoryListPage from "../pages/storylist-page.js";
import StoryDetailPage from "../pages/storylistdetail-page.js";
import AddStoryPage from "../pages/add-story-page.js";
import BookmarkPage from "../pages/bookmark-page.js";

const routes = {
  "/": new StoryListPage(),
  "/stories/:id": new StoryDetailPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add": new AddStoryPage(),
  "/bookmark": new BookmarkPage(),
};

export default routes;
