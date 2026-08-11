/* =========================================================
   POSIÇÃO INICIAL DA PÁGINA
========================================================= */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (!window.location.hash) {
  window.scrollTo(0, 0);
  window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
}

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
   MENSAGENS
   Edite os objetos abaixo para trocar capas, textos e vídeos.
   Em youtubeId, informe somente o ID (ex.: dQw4w9WgXcQ).
========================================================= */
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@pibrsaojorge";

const mensagens = [
  {
    youtubeId: "L8lZbhWkEmE",
    titulo: "Culto de Celebração",
    data: "09/08/2026",
    pregador: "",
    descricao: ""
  },
  {
    youtubeId: "iabtLscUtGM",
    titulo: "Culto de Celebração",
    data: "19/07/2026",
    pregador: "",
    descricao: ""
  },
  {
    youtubeId: "NStdcnhxZ1g",
    titulo: "Culto de Celebração",
    data: "26/07/2026",
    pregador: "",
    descricao: ""
  },
  {
    youtubeId: "KlASUJhVopg",
    titulo: "Culto de Celebração",
    data: "02/08/2026",
    pregador: "",
    descricao: ""
  }
];

const messagesGrid = document.querySelector("#messagesGrid");
const messagesPreview = document.querySelector("#messagesPreview");
const messagesAll = document.querySelector("#messagesAll");
const messagesAllList = document.querySelector("#messagesAllList");
const messageDetail = document.querySelector("#messageDetail");
const messageDetailBack = document.querySelector("#messageDetailBack");
const messageFallbackCover = "assets/mensagens/capa-padrao.svg";
let messageOrigin = document.body.classList.contains("messages-page") ? "all" : "preview";

function getMessageDateTimestamp(value) {
  const date = String(value || "").trim();
  if (!date) return Number.NEGATIVE_INFINITY;

  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const brMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return Date.UTC(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
  }

  return Number.NEGATIVE_INFINITY;
}

const mensagensOrdenadas = mensagens
  .map((mensagem, originalIndex) => ({ mensagem, originalIndex }))
  .sort((a, b) => {
    const dateDifference = getMessageDateTimestamp(b.mensagem.data) - getMessageDateTimestamp(a.mensagem.data);
    return dateDifference || a.originalIndex - b.originalIndex;
  })
  .map(({ mensagem }) => mensagem);

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

function formatMessageCardDate(value) {
  const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  return `${match[1]} DE ${months[Number(match[2]) - 1]} DE ${match[3]}`;
}

function renderMessageCards() {
  if (!messagesGrid) return;
  messagesGrid.replaceChildren();

  mensagensOrdenadas.slice(0, 3).forEach((mensagem) => {
    const article = document.createElement("article");
    article.className = "message-card";

    const media = document.createElement("div");
    media.className = "message-card__media";
    media.append(createMessageImage(getMessageCover(mensagem), `Capa: ${mensagem.titulo}`));

    const content = document.createElement("div");
    content.className = "message-card__content";
    content.innerHTML = `
      ${mensagem.data ? `<div class="message-card__date">${formatMessageCardDate(mensagem.data)}</div>` : ""}
      <h3>${mensagem.titulo}</h3>
      ${mensagem.pregador ? `<div class="message-card__speaker">${mensagem.pregador}</div>` : ""}
      ${mensagem.descricao ? `<p>${mensagem.descricao}</p>` : ""}
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "message-card__action";
    button.textContent = "Assistir mensagem →";
    button.addEventListener("click", () => openMessage(mensagem));
    content.append(button);
    article.setAttribute("aria-label", `Abrir mensagem: ${mensagem.titulo}`);
    article.addEventListener("click", (event) => {
      if (!event.target.closest("button")) openMessage(mensagem);
    });
    article.append(media, content);
    messagesGrid.append(article);
  });
}

function renderAllMessages() {
  if (!messagesAllList) return;
  messagesAllList.replaceChildren();

  mensagensOrdenadas.forEach((mensagem) => {
    const article = document.createElement("article");
    article.className = "messages-all__item";

    const media = document.createElement("div");
    media.className = "messages-all__media";
    media.append(createMessageImage(getMessageCover(mensagem), `Capa: ${mensagem.titulo}`));

    const content = document.createElement("div");
    content.className = "messages-all__content";
    content.innerHTML = `
      ${mensagem.data ? `<div class="message-card__date">${formatMessageCardDate(mensagem.data)}</div>` : ""}
      <h3>${mensagem.titulo}</h3>
      ${mensagem.pregador ? `<div class="message-card__speaker">${mensagem.pregador}</div>` : ""}
      ${mensagem.descricao ? `<p>${mensagem.descricao}</p>` : ""}
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-dark messages-all__action";
    button.textContent = "Assistir";
    button.addEventListener("click", () => {
      messageOrigin = "all";
      openMessage(mensagem);
    });
    content.append(button);
    article.append(media, content);
    messagesAllList.append(article);
  });
}

function openMessage(mensagem) {
  if (!mensagem || !messageDetail || (!messagesGrid && !messagesAll)) return;

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

  if (messagesPreview) messagesPreview.hidden = true;
  if (messagesAll) messagesAll.hidden = true;
  messageDetail.hidden = false;
  messageDetail.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

messageDetailBack?.addEventListener("click", () => {
  messageDetail.hidden = true;
  if (messageOrigin === "all") {
    messagesAll.hidden = false;
    messagesAll.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  } else {
    if (messagesPreview) messagesPreview.hidden = false;
    document.querySelector("#messages-title")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
});

renderMessageCards();
renderAllMessages();

/* =========================================================
   GALERIA: FOTOS DO ÚLTIMO CULTO
   (grade de destaque + modal com todas as fotos + visualizador)
========================================================= */

// LISTA DE FOTOS — para adicionar mais fotos, é só incluir novas
// linhas aqui. A grade de destaque, o contador e o modal "ver
// todas" se atualizam sozinhos, sem precisar mexer em mais nada.
const cultoPhotos = [
  { src: "ativos/imagens/culto/culto-01.jpg", alt: "Registro 1 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-02.jpg", alt: "Registro 2 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-03.jpg", alt: "Registro 3 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-04.jpg", alt: "Registro 4 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-05.jpg", alt: "Registro 5 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-06.jpg", alt: "Registro 6 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-07.jpg", alt: "Registro 7 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-08.jpg", alt: "Registro 8 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-09.jpg", alt: "Registro 9 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-10.jpg", alt: "Registro 10 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-11.jpg", alt: "Registro 11 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-12.jpg", alt: "Registro 12 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-13.jpg", alt: "Registro 13 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-14.jpg", alt: "Registro 14 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-15.jpg", alt: "Registro 15 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-16.jpg", alt: "Registro 16 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-17.jpg", alt: "Registro 17 do último culto — Batista Renovada São Jorge" },
  { src: "ativos/imagens/culto/culto-18.jpg", alt: "Registro 18 do último culto — Batista Renovada São Jorge" },
];

const CULTO_FEATURED_COUNT = 12;

const cultoFeaturedGrid = document.querySelector("#cultoFeaturedGrid");
const cultoAllGrid = document.querySelector("#cultoAllGrid");
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

if (cultoAllGrid && cultoPhotos.length) {
  cultoPhotos.forEach((photo, index) => {
    cultoAllGrid.appendChild(buildCultoPhotoButton(photo, index));
  });
}

if (!cultoPhotos.length) {
  cultoOpenAllBtn?.closest(".culto-more")?.setAttribute("hidden", "");
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
