import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import {
  subscribePushNotificationAPI,
  unsubscribePushNotificationAPI,
} from "../data/api";

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(`${CONFIG.VAPID_KEY}`),
  };
}

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }
  if (isNotificationGranted()) {
    return true;
  }
  const status = await Notification.requestPermission();
  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }
  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }
  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  try {
    const pushSubscription = await getPushSubscription();
    return !!pushSubscription;
  } catch (error) {
    console.error("Gagal memeriksa langganan push:", error);
    return false;
  }
}

export async function subscribe() {
  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    return;
  }
  if (await isCurrentPushSubscriptionAvailable()) {
    alert("Anda sudah berlangganan push notification.");
    return;
  }
  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";
  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotificationAPI({ endpoint, keys });
    if (response.error) {
      console.error("Server gagal menyimpan langganan:", response.message);
      throw new Error(response.message);
    }
    alert(successSubscribeMessage);
  } catch (error) {
    console.error("Proses subscribe gagal:", error);
    alert(failureSubscribeMessage);
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert(
        "Tidak bisa memutus langganan karena belum berlangganan sebelumnya."
      );
      return;
    }
    const response = await unsubscribePushNotificationAPI(pushSubscription);
    if (response.error) {
      console.error("Gagal menghapus langganan di server:", response);
      alert(failureUnsubscribeMessage);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      console.error("Gagal unsubscribe dari browser setelah server berhasil.");
      alert(failureUnsubscribeMessage);
      return;
    }
    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error("Terjadi error saat proses unsubscribe:", error);
  }
}
