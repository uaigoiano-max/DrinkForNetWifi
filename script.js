document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       ELEMENTOS
    ========================================================= */

    const form =
        document.getElementById("voucherForm");

    const voucher =
        document.getElementById("voucher");

    const button =
        document.getElementById("submitButton");

    const voucherHelp =
        document.getElementById("voucherHelp");


    const gallery =
        document.getElementById("gallery");

    const galleryImage =
        document.getElementById("galleryImage");

    const openGallery =
        document.getElementById("openGallery");

    const closeGallery =
        document.getElementById("closeGallery");

    const galleryBackdrop =
        document.getElementById("galleryBackdrop");

    const galleryPrev =
        document.getElementById("galleryPrev");

    const galleryNext =
        document.getElementById("galleryNext");

    const galleryDots =
        document.getElementById("galleryDots");

    const galleryCounter =
        document.getElementById("galleryCounter");

    const photoCounter =
        document.getElementById("photoCounter");

    const photoDots =
        document.getElementById("photoDots");


    /* =========================================================
       FOTOS
    ========================================================= */

    const photos = [
        "minha-foto.jpg",
        "foto-2.jpg",
        "foto-3.jpg"
    ];


    let currentPhoto = 0;
    let lastFocusedElement = null;


    /* =========================================================
       INICIALIZAR INDICADOR DE FOTOS DO PERFIL
    ========================================================= */

    function initProfileDots() {

        if (!photoDots) {
            return;
        }

        photoDots.innerHTML = "";

        photos.forEach(
            function (photo, index) {

                const dot =
                    document.createElement("span");

                dot.className =
                    "photo-dot" +
                    (index === 0 ? " active" : "");

                photoDots.appendChild(dot);

            }
        );

        if (photoCounter) {

            photoCounter.textContent =
                "1/" + photos.length;

        }

    }

    initProfileDots();


    /* =========================================================
       ATUALIZAR GALERIA
    ========================================================= */

    function updateGallery() {

        if (!galleryImage) {
            return;
        }


        galleryImage.src =
            photos[currentPhoto];


        galleryImage.alt =
            "Thiago — foto " +
            (currentPhoto + 1);


        /* CONTADOR */

        if (galleryCounter) {

            galleryCounter.textContent =
                String(currentPhoto + 1).padStart(2, "0") +
                " / " +
                String(photos.length).padStart(2, "0");

        }


        /* DOTS */

        if (galleryDots) {

            galleryDots.innerHTML = "";


            photos.forEach(
                function (photo, index) {

                    const dot =
                        document.createElement("button");


                    dot.type = "button";

                    dot.className =
                        "gallery-dot";


                    dot.setAttribute(
                        "aria-label",
                        "Abrir foto " +
                        (index + 1)
                    );


                    if (
                        index === currentPhoto
                    ) {

                        dot.classList.add(
                            "active"
                        );

                    }


                    dot.addEventListener(
                        "click",
                        function () {

                            currentPhoto =
                                index;

                            updateGallery();

                        }
                    );


                    galleryDots.appendChild(
                        dot
                    );

                }
            );

        }

    }


    /* =========================================================
       ABRIR GALERIA
    ========================================================= */

    function openPhotoGallery() {

        if (!gallery) {
            return;
        }


        lastFocusedElement = document.activeElement;
        currentPhoto = 0;

        updateGallery();


        gallery.classList.add(
            "active"
        );


        gallery.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";

        if (closeGallery) {
            closeGallery.focus();
        }

    }


    /* =========================================================
       FECHAR GALERIA
    ========================================================= */

    function closePhotoGallery() {

        if (!gallery) {
            return;
        }


        gallery.classList.remove(
            "active"
        );


        gallery.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";

        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus === "function"
        ) {
            lastFocusedElement.focus();
        }

    }


    /* =========================================================
       PRÓXIMA FOTO
    ========================================================= */

    function nextPhoto() {

        currentPhoto++;


        if (
            currentPhoto >=
            photos.length
        ) {

            currentPhoto = 0;

        }


        updateGallery();

    }


    /* =========================================================
       FOTO ANTERIOR
    ========================================================= */

    function previousPhoto() {

        currentPhoto--;


        if (
            currentPhoto < 0
        ) {

            currentPhoto =
                photos.length - 1;

        }


        updateGallery();

    }


    /* =========================================================
       EVENTOS DA GALERIA
    ========================================================= */

    if (openGallery) {

        openGallery.addEventListener(
            "click",
            openPhotoGallery
        );

    }


    if (closeGallery) {

        closeGallery.addEventListener(
            "click",
            closePhotoGallery
        );

    }


    if (galleryBackdrop) {

        galleryBackdrop.addEventListener(
            "click",
            closePhotoGallery
        );

    }


    if (galleryNext) {

        galleryNext.addEventListener(
            "click",
            nextPhoto
        );

    }


    if (galleryPrev) {

        galleryPrev.addEventListener(
            "click",
            previousPhoto
        );

    }


    /* =========================================================
       TECLADO
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !gallery ||
                !gallery.classList.contains("active")
            ) {

                return;

            }


            if (
                event.key === "Escape"
            ) {

                closePhotoGallery();

            }


            if (
                event.key === "ArrowRight"
            ) {

                nextPhoto();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                previousPhoto();

            }

            if (event.key === "Tab") {
                const focusableElements = [
                    closeGallery,
                    galleryPrev,
                    galleryNext
                ].filter(function (element) {
                    return element && !element.disabled;
                });

                if (galleryDots) {
                    galleryDots.querySelectorAll("button").forEach(
                        function (dot) {
                            focusableElements.push(dot);
                        }
                    );
                }

                if (!focusableElements.length) {
                    return;
                }

                const firstFocusable = focusableElements[0];
                const lastFocusable =
                    focusableElements[focusableElements.length - 1];

                if (
                    event.shiftKey &&
                    document.activeElement === firstFocusable
                ) {
                    event.preventDefault();
                    lastFocusable.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastFocusable
                ) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            }

        }
    );


    /* =========================================================
       SWIPE MOBILE
    ========================================================= */

    let touchStartX = 0;

    let touchEndX = 0;


    if (galleryImage) {

        galleryImage.addEventListener(
            "touchstart",
            function (event) {

                touchStartX =
                    event.changedTouches[0].screenX;

            },
            {
                passive: true
            }
        );


        galleryImage.addEventListener(
            "touchend",
            function (event) {

                touchEndX =
                    event.changedTouches[0].screenX;


                const distance =
                    touchEndX -
                    touchStartX;


                if (distance < -50) {

                    nextPhoto();

                }


                if (distance > 50) {

                    previousPhoto();

                }

            },
            {
                passive: true
            }
        );

    }


    /* =========================================================
       VOUCHER
    ========================================================= */

    if (voucher) {

        voucher.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .toUpperCase()
                        .replace(/\s/g, "");

                this.setAttribute(
                    "aria-invalid",
                    "false"
                );

                if (voucherHelp) {
                    voucherHelp.textContent =
                        "Digite o código para liberar o Wi‑Fi.";
                    voucherHelp.classList.remove("error");
                }

            }
        );

    }


    /* =========================================================
       ENVIO DO FORMULÁRIO
    ========================================================= */

    if (form) {

        form.addEventListener(
            "invalid",
            function () {
                if (voucher) {
                    voucher.setAttribute(
                        "aria-invalid",
                        "true"
                    );
                }

                if (voucherHelp) {
                    voucherHelp.textContent =
                        "Informe o código de acesso antes de continuar.";
                    voucherHelp.classList.add("error");
                }
            },
            true
        );

        form.addEventListener(
            "submit",
            function (event) {

                const code =
                    voucher.value.trim();

                if (!code) {
                    event.preventDefault();

                    if (voucher) {
                        voucher.setAttribute(
                            "aria-invalid",
                            "true"
                        );
                        voucher.focus();
                    }

                    if (voucherHelp) {
                        voucherHelp.textContent =
                            "Informe o código de acesso antes de continuar.";
                        voucherHelp.classList.add("error");
                    }

                    return;
                }

                if (button) {

                    button.classList.add(
                        "loading"
                    );


                    const buttonText =
                        button.querySelector(
                            "span"
                        );


                    if (buttonText) {

                        buttonText.textContent =
                            "VALIDANDO...";

                    }


                    button.disabled =
                        true;

                }

            }
        );

    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    updateGallery();

});