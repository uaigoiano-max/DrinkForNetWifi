document.addEventListener("DOMContentLoaded", function () {
    const config = window.DrinkForNetConfig || {};
    const fixedAccessMinutes = 25;
    const photos = Array.isArray(config.photos) && config.photos.length
        ? config.photos
        : ["minha-foto.jpg"];
    const socialUrls = [
        config.socialLinks && config.socialLinks.instagram,
        config.socialLinks && config.socialLinks.x,
        config.socialLinks && config.socialLinks.spotify
    ];
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    function setText(selector, value) {
        const element = $(selector);
        if (element && value) element.textContent = value;
    }

    setText(".profile-name", config.hostName);
    setText(".profile-nickname", config.nickname);
    setText(".brand-name", config.brandName);
    setText(".network-label", config.networkLabel);
    setText(".hero-label", config.heroLabel);
    setText(".hero-description", config.heroDescription);
    setText(".location-on-floor", config.locationOnFloor);
    setText(".location-backstage", config.locationBackstage);
    setText(".footer-offer", config.footerOffer);
    setText(".rule-description", config.ruleDescription);
    setText(".gallery-caption", config.galleryCaption);
    document.title = config.pageTitle || document.title;

    $$(".drink-rule").forEach((element) => {
        element.textContent = config.drinkRule || "01 bebida";
    });
    $$(".access-minutes").forEach((element) => {
        element.textContent = fixedAccessMinutes;
    });
    const description = $("meta[name='description']");
    if (description && config.metaDescription) description.content = config.metaDescription;

    $$(".social-link").forEach((link, index) => {
        if (!socialUrls[index]) {
            link.remove();
        } else {
            link.href = socialUrls[index];
        }
    });

    const profilePhoto = $("#profilePhoto");
    const gallery = $("#gallery");
    const galleryImage = $("#galleryImage");
    const galleryCounter = $("#galleryCounter");
    const galleryDots = $("#galleryDots");
    const openGallery = $("#openGallery");
    const galleryHint = $("#galleryHint");
    const closeGallery = $("#closeGallery");
    const galleryBackdrop = $("#galleryBackdrop");
    const previous = $("#galleryPrev");
    const next = $("#galleryNext");
    const photoCounter = $("#photoCounter");
    let currentPhoto = 0;
    let lastFocusedElement = null;

    function renderPhoto() {
        const photo = photos[currentPhoto];
        if (profilePhoto) profilePhoto.src = photo;
        if (galleryImage) {
            galleryImage.src = photo;
            galleryImage.alt = (config.hostName || "Pessoa anfitriã") + " — foto " + (currentPhoto + 1);
        }
        if (photoCounter) photoCounter.textContent = (currentPhoto + 1) + "/" + photos.length;
        if (galleryCounter) {
            galleryCounter.textContent = String(currentPhoto + 1).padStart(2, "0") + " / " + String(photos.length).padStart(2, "0");
        }
        if (galleryDots) {
            galleryDots.innerHTML = "";
            photos.forEach((photoName, index) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "gallery-dot" + (index === currentPhoto ? " is-active" : "");
                dot.setAttribute("aria-label", "Abrir foto " + (index + 1));
                dot.addEventListener("click", () => {
                    currentPhoto = index;
                    renderPhoto();
                });
                galleryDots.appendChild(dot);
            });
        }
    }

    function setGallery(open) {
        if (!gallery) return;
        gallery.classList.toggle("is-open", open);
        gallery.setAttribute("aria-hidden", String(!open));
        document.body.classList.toggle("gallery-open", open);
        if (open) {
            lastFocusedElement = document.activeElement;
            closeGallery.focus();
        } else if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function changePhoto(step) {
        currentPhoto = (currentPhoto + step + photos.length) % photos.length;
        renderPhoto();
    }

    [openGallery, galleryHint].forEach((button) => {
        if (button) button.addEventListener("click", () => setGallery(true));
    });
    if (closeGallery) closeGallery.addEventListener("click", () => setGallery(false));
    if (galleryBackdrop) galleryBackdrop.addEventListener("click", () => setGallery(false));
    if (previous) previous.addEventListener("click", () => changePhoto(-1));
    if (next) next.addEventListener("click", () => changePhoto(1));
    document.addEventListener("keydown", (event) => {
        if (!gallery || !gallery.classList.contains("is-open")) return;
        if (event.key === "Escape") setGallery(false);
        if (event.key === "ArrowLeft") changePhoto(-1);
        if (event.key === "ArrowRight") changePhoto(1);
    });
    renderPhoto();

    const form = $("#voucherForm");
    const voucher = $("#voucher");
    const state = $("#voucherState");
    if (form && voucher && state) {
        voucher.addEventListener("input", () => {
            state.textContent = "";
            voucher.setAttribute("aria-invalid", "false");
        });
        form.addEventListener("submit", () => {
            if (!voucher.value.trim()) {
                voucher.setAttribute("aria-invalid", "true");
                state.textContent = "Digite seu código para continuar.";
            }
        });
    }
});
