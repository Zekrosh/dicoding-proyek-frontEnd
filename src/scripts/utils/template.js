export function generateStoryItemTemplate(story) {
  const uploaderName = story.name || "Pengguna Anonim";
  const descriptionText = story.description || "Tidak ada deskripsi.";
  const storyId = story.id || "#"; //
  const photoUrl = story.photoUrl || "placeholder-image.jpg";
  const createdAtDate = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tanggal tidak diketahui";

  return `
    <div class="story-item">
      <a href="#/stories/${storyId}" class="story-item__link" aria-label="Lihat detail cerita oleh ${uploaderName}">
        <img
          class="story-item__image"
          src="${photoUrl}"
          alt="Gambar cerita oleh ${uploaderName}"
          loading="lazy"
        >
        <div class="story-item__content">
          <h3 class="story-item__uploader">Cerita oleh: ${uploaderName}</h3>
          <p class="story-item__description">${descriptionText}</p>
          <p class="story-item__meta">Diupload: ${createdAtDate}</p>
        </div>
      </a>
    </div>
  `;
}

export function generateStoryDetailTemplate(storyDetail) {
  if (!storyDetail || Object.keys(storyDetail).length === 0) {
    return `
      <div class="container story-detail-page">
        <p id="storyDetailError" class="error">Detail cerita tidak dapat dimuat atau tidak ditemukan.</p>
        <a href="#/" class="button button--outline">Kembali ke Daftar Cerita</a>
      </div>
    `;
  }
  const uploaderName = storyDetail.name || "Pengguna Anonim";
  const descriptionText =
    storyDetail.description || "Tidak ada deskripsi untuk cerita ini.";
  const photoUrl = storyDetail.photoUrl || "path/to/default-image.jpg";
  const createdAtDate = storyDetail.createdAt
    ? new Date(storyDetail.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : "Tanggal tidak diketahui";
  const hasLocation =
    storyDetail.lat !== null &&
    storyDetail.lat !== undefined &&
    storyDetail.lon !== null &&
    storyDetail.lon !== undefined;

  return `
    <article class="container story-detail-page">
      <div class="story-detail__header-navigation">
        <a href="#/" class="button button--outline button--small">&larr; Kembali ke Daftar</a>
        <h1 class="story-detail__main-title">Detail Cerita</h1>
      </div>
      <div class="story-detail__card">
        <div class="story-detail__image-container">
          <img class="story-detail__image" src="${photoUrl}" alt="Gambar cerita oleh ${uploaderName}">
        </div>
        <div class="story-detail__info">
          <h3 class="story-detail__uploader">Diunggah oleh: ${uploaderName}</h3>
          <p class="story-detail__date">Pada: ${createdAtDate}</p>
          <div class="story-detail__description-container">
            <h4>Deskripsi:</h4>
            <p class="story-detail__description">${descriptionText}</p>
          </div>
          ${
            hasLocation
              ? `
            <div class="story-detail__location">
              <h4>Lokasi Pengambilan Cerita:</h4>
              <p>Latitude: ${storyDetail.lat.toFixed(6)}</p>
              <p>Longitude: ${storyDetail.lon.toFixed(6)}</p>
              <div id="storyMapDetail"></div>
            </div>`
              : `<p class="story-detail__no-location"><em>Informasi lokasi tidak tersedia untuk cerita ini.</em></p>`
          }
        </div>
        <div id="save-actions-container" class="story-detail__actions"></div>
      </div>
    </article>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `<button id="saveButton" class="button button--primary" aria-label="Simpan cerita ini">Simpan Cerita (Bookmark)</button>`;
}

export function generateRemoveStoryButtonTemplate() {
  return `<button id="removeButton" class="button button--danger" aria-label="Hapus cerita dari bookmark">Hapus dari Bookmark</button>`;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button add-story-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button add-story-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}
