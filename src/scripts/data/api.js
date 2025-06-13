import CONFIG from "../config";

const ENDPOINTS = {
  register: `${CONFIG.BASE_URL}/register`,
  login: `${CONFIG.BASE_URL}/login`,
  stories: `${CONFIG.BASE_URL}/stories`,
  detail: `${CONFIG.BASE_URL}/stories/:id`,
  subscribe: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function registerAPI(name, email, password) {
  try {
    const response = await fetch(`${ENDPOINTS.register}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error during get all stories API call:", error);
    return {
      error: true,
      message: "Gagal untuk Registrasi karena server atau jaringan",
    };
  }
}

export async function loginAPI(email, password) {
  try {
    const response = await fetch(`${ENDPOINTS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error during get all stories API call:", error);
    return {
      error: true,
      message: "Gagal untuk Login karena server atau jaringan",
    };
  }
}

export async function getStories(token) {
  try {
    const response = await fetch(`${ENDPOINTS.stories}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error during get all stories API call:", error);
    return {
      error: true,
      message: "Gagal untuk mengambil stories karena server atau jaringan",
    };
  }
}

export async function getStoryDetailAPI(storyId, token) {
  const storyDetailUrl = `${CONFIG.BASE_URL}/stories/${storyId}`;
  try {
    const response = await fetch(storyDetailUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(
      `Error during get story detail API call for ID ${storyId}:`,
      error
    );
    return {
      error: true,
      message:
        "Gagal untuk mendapatkan detail cerita karena masalah pada server atau jaringan.",
    };
  }
}

export async function addNewStoryAPI(token, description, photoFile, lat, lon) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photoFile, photoFile.name);

  if (lat !== null && lat !== undefined && !isNaN(parseFloat(lat))) {
    formData.append("lat", parseFloat(lat));
  }
  if (lon !== null && lon !== undefined && !isNaN(parseFloat(lon))) {
    formData.append("lon", parseFloat(lon));
  }

  try {
    const response = await fetch(ENDPOINTS.stories, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error during add new story API call:", error);
    return {
      error: true,
      message:
        "Gagal menambahkan cerita baru karena masalah pada server atau jaringan.",
    };
  }
}

export async function subscribePushNotificationAPI(subscription) {
  const accessToken = localStorage.getItem("token");
  if (!accessToken) {
    return {
      error: true,
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    };
  }

  // Siapkan data body dari objek subscription
  const bodyData = JSON.stringify({
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  try {
    const response = await fetch(ENDPOINTS.subscribe, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyData,
    });

    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Error during subscribe push notification API call:", error);
    return {
      error: true,
      message:
        "Gagal berlangganan notifikasi karena masalah pada server atau jaringan.",
    };
  }
}

export async function unsubscribePushNotificationAPI(subscription) {
  const accessToken = localStorage.getItem("token");
  if (!accessToken) {
    return {
      error: true,
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    };
  }

  const bodyData = JSON.stringify({
    endpoint: subscription.endpoint,
  });

  try {
    const response = await fetch(ENDPOINTS.subscribe, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyData,
    });

    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(
      "Error during unsubscribe push notification API call:",
      error
    );
    return {
      error: true,
      message:
        "Gagal berhenti berlangganan notifikasi karena masalah pada server atau jaringan.",
    };
  }
}
