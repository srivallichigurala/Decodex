// ==========================================
// DECODEX LANGUAGE SELECTION
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const languageCards =
    document.querySelectorAll(".language-card");

const selectionMessage =
    document.getElementById("selectionMessage");

const continueButton =
    document.getElementById("continueButton");


// ==========================================
// SELECTED LANGUAGE
// ==========================================

let selectedLanguage = null;


// ==========================================
// LANGUAGE CARD CLICK
// ==========================================

languageCards.forEach((card) => {

    card.addEventListener("click", () => {

        // --------------------------------------
        // REMOVE PREVIOUS SELECTION
        // --------------------------------------

        languageCards.forEach((item) => {

            item.classList.remove("selected");

        });


        // --------------------------------------
        // SELECT CURRENT LANGUAGE
        // --------------------------------------

        card.classList.add("selected");


        // --------------------------------------
        // GET LANGUAGE
        // --------------------------------------

        selectedLanguage =
            card.dataset.language;


        // --------------------------------------
        // UPDATE MESSAGE
        // --------------------------------------

        if (selectionMessage) {

            selectionMessage.textContent =
                selectedLanguage +
                " selected. Ready to code!";

            selectionMessage.style.color =
                "#a979ff";

        }


        // --------------------------------------
        // ENABLE CONTINUE BUTTON
        // --------------------------------------

        if (continueButton) {

            continueButton.disabled = false;

        }

    });

});


// ==========================================
// CONTINUE BUTTON
// ==========================================

continueButton.addEventListener(
    "click",
    () => {

        // --------------------------------------
        // CHECK LANGUAGE
        // --------------------------------------

        if (!selectedLanguage) {

            return;

        }


        // --------------------------------------
        // SAVE LANGUAGE
        // --------------------------------------

        localStorage.setItem(
            "decodexLanguage",
            selectedLanguage
        );


        // --------------------------------------
        // BUTTON FEEDBACK
        // --------------------------------------

        continueButton.disabled = true;

        continueButton.textContent =
            "Opening " +
            selectedLanguage +
            "...";


        // --------------------------------------
        // OPEN EDITOR
        // --------------------------------------

        setTimeout(() => {

            window.location.href =
                "editor.html";

        }, 400);

    }
);