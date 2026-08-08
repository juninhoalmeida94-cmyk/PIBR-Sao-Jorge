/* =========================================================
   POSIÇÃO INICIAL DA PÁGINA
========================================================= */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (window.location.hash) {
  history.replaceState(history.state, "", `${window.location.pathname}${window.location.search}`);
}

window.scrollTo(0, 0);
window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });

/* =========================================================
   MENU MOBILE
========================================================= */
const burger = document.querySelector(".burger");
const mobileOverlay = document.querySelector(".mobile-overlay");

if (burger && mobileOverlay) {
  burger.addEventListener("click", () => {
    const open = mobileOverlay.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    mobileOverlay.setAttribute("aria-hidden", String(!open));
  });

  mobileOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileOverlay.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      mobileOverlay.setAttribute("aria-hidden", "true");
    });
  });
}

/* =========================================================
   FORMULÁRIOS VISUAIS — REDIRECIONAMENTO OFICIAL
========================================================= */
document.querySelectorAll(".visual-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    window.open(form.action, "_blank", "noopener,noreferrer");
  });
});

/* =========================================================
   PARALLAX HERO MINISTÉRIOS (com requestAnimationFrame)
========================================================= */
const ministriesHero = document.querySelector(".ministries-hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (ministriesHero && !reduceMotion) {
  let ticking = false;

  const updateParallax = () => {
    const offset = ministriesHero.getBoundingClientRect().top;

    if (offset < window.innerHeight && offset > -window.innerHeight) {
      ministriesHero.style.backgroundPosition = `center ${offset * -0.12}px`;
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* =========================================================
   VÍDEO DO HERO
========================================================= */
const heroVideo = document.querySelector(".hero-video");
const videoSoundButton = document.querySelector(".video-sound");
const videoPauseButton = document.querySelector(".video-pause");

// helper seguro para chamar .play() sem warning no console
function safePlay(video) {
  const result = video.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      /* autoplay bloqueado pelo navegador — ignora silenciosamente */
    });
  }
}

function syncHeroControls() {
  if (!heroVideo) return;

  if (videoSoundButton) {
    videoSoundButton.innerHTML = heroVideo.muted
      ? '<i class="fas fa-volume-mute" aria-hidden="true"></i>'
      : '<i class="fas fa-volume-up" aria-hidden="true"></i>';
    videoSoundButton.setAttribute("aria-label", heroVideo.muted ? "Ativar som" : "Desativar som");
  }

  if (videoPauseButton) {
    videoPauseButton.innerHTML = heroVideo.paused
      ? '<i class="fas fa-play" aria-hidden="true"></i>'
      : '<i class="fas fa-pause" aria-hidden="true"></i>';
    videoPauseButton.setAttribute("aria-label", heroVideo.paused ? "Reproduzir vídeo" : "Pausar vídeo");
  }
}

if (heroVideo) {
  heroVideo.muted = true;

  ["play", "pause", "volumechange", "ended"].forEach((eventName) => {
    heroVideo.addEventListener(eventName, syncHeroControls);
  });
  syncHeroControls();

  heroVideo.addEventListener("error", () => {
    heroVideo.style.display = "none";
    document.querySelector(".hero-video-controls")?.style.setProperty("display", "none");
  }, true);

  heroVideo.addEventListener("click", () => {
    const source = heroVideo.querySelector("source");
    const videoSource = heroVideo.currentSrc || source?.src;
    if (videoSource) openLightbox("video", videoSource);
  });
}

if (heroVideo && videoSoundButton) {
  videoSoundButton.addEventListener("click", () => {
    heroVideo.muted = !heroVideo.muted;
    safePlay(heroVideo);
    syncHeroControls();
  });
}

if (heroVideo && videoPauseButton) {
  videoPauseButton.addEventListener("click", () => {
    if (heroVideo.paused) {
      safePlay(heroVideo);
    } else {
      heroVideo.pause();
    }
    syncHeroControls();
  });
}

/* =========================================================
   ASSISTA AO CULTO (vídeo sob demanda, via lightbox)
========================================================= */
document.querySelectorAll(".watch-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const videoSrc = trigger.dataset.videoSrc;
    const videoPoster = trigger.dataset.videoPoster || "";
    if (videoSrc) openLightbox("video", videoSrc, videoPoster);
  });
});

/* =========================================================
   MENSAGENS
   Edite os objetos abaixo para trocar capas, textos e vídeos.
   Em youtubeId, informe somente o ID (ex.: dQw4w9WgXcQ).
========================================================= */
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@pibrsaojorge";

const mensagens = [
  {
    youtubeId: "iabtLscUtGM",
    titulo: "Culto de Celebração",
    data: "",
    pregador: "",
    descricao: ""
  },
  {
    youtubeId: "NStdcnhxZ1g",
    titulo: "Culto de Celebração",
    data: "",
    pregador: "",
    descricao: ""
  },
  {
    youtubeId: "KlASUJhVopg",
    titulo: "Culto de Celebração",
    data: "",
    pregador: "",
    descricao: ""
  }
];

const messagesGrid = document.querySelector("#messagesGrid");
const messageDetail = document.querySelector("#messageDetail");
const messageDetailBack = document.querySelector("#messageDetailBack");
const messageFallbackCover = "assets/mensagens/capa-padrao.svg";

function getMessageCover(mensagem) {
  const youtubeId = mensagem.youtubeId?.trim();
  if (youtubeId) return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/maxresdefault.jpg`;
  return mensagem.imagem || messageFallbackCover;
}

function createMessageImage(src, alt) {
  const image = document.createElement("img");
  image.src = src || messageFallbackCover;
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    if (image.src.includes("/maxresdefault.jpg")) {
      image.src = image.src.replace("/maxresdefault.jpg", "/hqdefault.jpg");
      return;
    }
    if (!image.src.endsWith(messageFallbackCover)) image.src = messageFallbackCover;
  });
  return image;
}

function renderMessageCards() {
  if (!messagesGrid) return;
  messagesGrid.replaceChildren();

  mensagens.forEach((mensagem, index) => {
    const article = document.createElement("article");
    article.className = "message-card";

    const media = document.createElement("div");
    media.className = "message-card__media";
    media.append(createMessageImage(getMessageCover(mensagem), `Capa: ${mensagem.titulo}`));

    const content = document.createElement("div");
    content.className = "message-card__content";
    content.innerHTML = `
      ${mensagem.data ? `<div class="message-card__date">${mensagem.data}</div>` : ""}
      <h3>${mensagem.titulo}</h3>
      ${mensagem.pregador ? `<div class="message-card__speaker">${mensagem.pregador}</div>` : ""}
      ${mensagem.descricao ? `<p>${mensagem.descricao}</p>` : ""}
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "message-card__action";
    button.textContent = "Assistir mensagem →";
    button.addEventListener("click", () => openMessage(index));
    content.append(button);
    article.setAttribute("aria-label", `Abrir mensagem: ${mensagem.titulo}`);
    article.addEventListener("click", (event) => {
      if (!event.target.closest("button")) openMessage(index);
    });
    article.append(media, content);
    messagesGrid.append(article);
  });
}

function openMessage(index) {
  const mensagem = mensagens[index];
  if (!mensagem || !messageDetail || !messagesGrid) return;

  const detailImage = document.querySelector("#messageDetailImage");
  detailImage.src = getMessageCover(mensagem);
  detailImage.alt = `Capa: ${mensagem.titulo}`;
  detailImage.onerror = () => {
    if (detailImage.src.includes("/maxresdefault.jpg")) {
      detailImage.src = detailImage.src.replace("/maxresdefault.jpg", "/hqdefault.jpg");
      return;
    }
    detailImage.onerror = null;
    detailImage.src = messageFallbackCover;
  };

  document.querySelector("#messageDetailTitle").textContent = mensagem.titulo;
  const detailMeta = document.querySelector("#messageDetailMeta");
  const detailDate = document.querySelector("#messageDetailDate");
  const detailSpeaker = document.querySelector("#messageDetailSpeaker");
  const detailDescription = document.querySelector("#messageDetailDescription");
  detailDate.textContent = mensagem.data || "";
  detailDate.hidden = !mensagem.data;
  detailSpeaker.textContent = mensagem.pregador || "";
  detailSpeaker.hidden = !mensagem.pregador;
  detailMeta.hidden = !mensagem.data && !mensagem.pregador;
  detailDescription.textContent = mensagem.descricao || "";
  detailDescription.hidden = !mensagem.descricao;

  const player = document.querySelector("#messagePlayer");
  const youtubeLink = document.querySelector("#messageYoutubeLink");
  player.replaceChildren();

  if (mensagem.youtubeId?.trim()) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(mensagem.youtubeId.trim())}`;
    iframe.title = `Vídeo: ${mensagem.titulo}`;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    player.append(iframe);
    youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(mensagem.youtubeId.trim())}`;
    youtubeLink.hidden = false;
  } else {
    const unavailable = document.createElement("p");
    unavailable.className = "message-player__empty";
    unavailable.textContent = "Vídeo em breve";
    player.append(unavailable);
    youtubeLink.hidden = true;
  }

  messagesGrid.hidden = true;
  messageDetail.hidden = false;
  messageDetail.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

messageDetailBack?.addEventListener("click", () => {
  messageDetail.hidden = true;
  messagesGrid.hidden = false;
  document.querySelector("#messages-title")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
});

renderMessageCards();

/* =========================================================
   GALERIA: FOTOS DO ÚLTIMO CULTO
   (grade de destaque + modal com todas as fotos + visualizador)
========================================================= */

// LISTA DE FOTOS — para adicionar mais fotos, é só incluir novas
// linhas aqui. A grade de destaque, o contador e o modal "ver
// todas" se atualizam sozinhos, sem precisar mexer em mais nada.
const cultoPhotos = [
  { src: "ativos/imagens/galeria-01.svg", alt: "Imagem genérica da galeria 1" },
  { src: "ativos/imagens/galeria-02.svg", alt: "Imagem genérica da galeria 2" },
  { src: "ativos/imagens/galeria-03.svg", alt: "Imagem genérica da galeria 3" },
  { src: "ativos/imagens/galeria-04.svg", alt: "Imagem genérica da galeria 4" },
  { src: "ativos/imagens/galeria-05.svg", alt: "Imagem genérica da galeria 5" },
  { src: "ativos/imagens/galeria-06.svg", alt: "Imagem genérica da galeria 6" },
];

const CULTO_FEATURED_COUNT = 12;

const cultoFeaturedGrid = document.querySelector("#cultoFeaturedGrid");
const cultoOpenAllBtn = document.querySelector("#cultoOpenAll");
const cultoCountEl = document.querySelector("#cultoCount");
const cultoModal = document.querySelector("#cultoModal");
const cultoModalThumbs = document.querySelector("#cultoModalThumbs");
const cultoModalTotal = document.querySelector("#cultoModalTotal");
const cultoModalClose = document.querySelector("#cultoModalClose");
const cultoViewer = document.querySelector("#cultoViewer");
const cultoViewerImg = document.querySelector("#cultoViewerImg");
const cultoViewerCounter = document.querySelector("#cultoViewerCounter");
const cultoViewerPrev = document.querySelector("#cultoViewerPrev");
const cultoViewerNext = document.querySelector("#cultoViewerNext");
const cultoViewerClose = document.querySelector("#cultoViewerClose");

let cultoViewerIndex = 0;

function buildCultoPhotoButton(photo, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "culto-photo";
  button.setAttribute("aria-label", `Ampliar foto ${index + 1}`);

  const frame = document.createElement("span");
  frame.className = "culto-photo-frame";

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = "lazy";
  img.decoding = "async";

  frame.appendChild(img);
  button.appendChild(frame);
  button.addEventListener("click", () => openCultoViewer(index));
  return button;
}

function lockScroll(lock) {
  document.body.style.overflow = lock ? "hidden" : "";
}

// grade de destaque (as primeiras fotos, sempre visíveis na seção)
if (cultoFeaturedGrid && cultoPhotos.length) {
  cultoPhotos.slice(0, CULTO_FEATURED_COUNT).forEach((photo, index) => {
    cultoFeaturedGrid.appendChild(buildCultoPhotoButton(photo, index));
  });

  if (cultoCountEl) cultoCountEl.textContent = `(${cultoPhotos.length})`;

}

// modal com todas as fotos (miniaturas carregadas sob demanda, só quando aberto)
function openCultoModal() {
  if (!cultoModal || !cultoModalThumbs) return;

  if (!cultoModalThumbs.childElementCount) {
    cultoPhotos.forEach((photo, index) => {
      cultoModalThumbs.appendChild(buildCultoPhotoButton(photo, index));
    });
  }

  if (cultoModalTotal) cultoModalTotal.textContent = `${cultoPhotos.length} fotos`;

  cultoModal.classList.add("open");
  cultoModal.setAttribute("aria-hidden", "false");
  lockScroll(true);
}

function closeCultoModal() {
  if (!cultoModal) return;
  cultoModal.classList.remove("open");
  cultoModal.setAttribute("aria-hidden", "true");
  if (!cultoViewer?.classList.contains("open")) lockScroll(false);
}

// visualizador de foto única, com navegação prev/next, teclado e swipe
function updateCultoViewer() {
  const photo = cultoPhotos[cultoViewerIndex];
  if (!photo || !cultoViewerImg) return;
  cultoViewerImg.src = photo.src;
  cultoViewerImg.alt = photo.alt;
  if (cultoViewerCounter) {
    cultoViewerCounter.textContent = `${cultoViewerIndex + 1} de ${cultoPhotos.length}`;
  }
}

function openCultoViewer(index) {
  if (!cultoViewer || !cultoPhotos[index]) return;
  cultoViewerIndex = index;
  updateCultoViewer();
  cultoViewer.classList.add("open");
  cultoViewer.setAttribute("aria-hidden", "false");
  lockScroll(true);
}

function showCultoViewer(delta) {
  const total = cultoPhotos.length;
  cultoViewerIndex = (cultoViewerIndex + delta + total) % total;
  updateCultoViewer();
}

function closeCultoViewer() {
  if (!cultoViewer) return;
  cultoViewer.classList.remove("open");
  cultoViewer.setAttribute("aria-hidden", "true");
  if (cultoViewerImg) cultoViewerImg.src = "";
  if (!cultoModal?.classList.contains("open")) lockScroll(false);
}

if (cultoOpenAllBtn) cultoOpenAllBtn.addEventListener("click", openCultoModal);
if (cultoModalClose) cultoModalClose.addEventListener("click", closeCultoModal);
if (cultoModal) {
  cultoModal.addEventListener("click", (event) => {
    if (event.target === cultoModal) closeCultoModal();
  });
}

if (cultoViewerClose) cultoViewerClose.addEventListener("click", closeCultoViewer);
if (cultoViewerPrev) cultoViewerPrev.addEventListener("click", () => showCultoViewer(-1));
if (cultoViewerNext) cultoViewerNext.addEventListener("click", () => showCultoViewer(1));
if (cultoViewer) {
  cultoViewer.addEventListener("click", (event) => {
    if (event.target === cultoViewer) closeCultoViewer();
  });
}

document.addEventListener("keydown", (event) => {
  if (cultoViewer && cultoViewer.classList.contains("open")) {
    if (event.key === "Escape") closeCultoViewer();
    if (event.key === "ArrowLeft") showCultoViewer(-1);
    if (event.key === "ArrowRight") showCultoViewer(1);
  } else if (cultoModal && cultoModal.classList.contains("open") && event.key === "Escape") {
    closeCultoModal();
  }
});

// swipe no visualizador (mobile)
let cultoTouchStartX = 0;
if (cultoViewer) {
  cultoViewer.addEventListener("touchstart", (event) => {
    cultoTouchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  cultoViewer.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - cultoTouchStartX;
    if (Math.abs(deltaX) > 40) showCultoViewer(deltaX > 0 ? -1 : 1);
  }, { passive: true });
}

/* =========================================================
   LIGHTBOX
========================================================= */
const lightbox = document.querySelector(".lightbox");
const lightboxContent = document.querySelector(".lightbox-content");
const lightboxClose = document.querySelector(".lightbox-close");

function openLightbox(type, src, alt = "") {
  if (!lightbox || !lightboxContent) return;

  lightboxContent.innerHTML = "";

  if (type === "video") {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    if (alt) video.poster = alt;
    lightboxContent.appendChild(video);
    safePlay(video);
  } else {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    lightboxContent.appendChild(image);
  }

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  if (!lightbox || !lightboxContent) return;

  // pausa qualquer vídeo antes de remover do DOM, evita áudio "fantasma"
  const playingVideo = lightboxContent.querySelector("video");
  if (playingVideo) {
    playingVideo.pause();
    playingVideo.removeAttribute("src");
    playingVideo.load();
  }

  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxContent.innerHTML = "";
}

if (lightbox && lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
}
