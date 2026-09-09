// ==========================================
// DECODEX EDITOR
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const codeInput =
    document.getElementById("codeInput");

const runButton =
    document.getElementById("runButton");

const output =
    document.getElementById("output");

const explanation =
    document.getElementById("explanation");

const languageName =
    document.getElementById("languageName");

const fileName =
    document.getElementById("fileName");

const executionStatus =
    document.getElementById("executionStatus");

const changeLanguage =
    document.getElementById("changeLanguage");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// SELECTED LANGUAGE
// ==========================================

const selectedLanguage =
    localStorage.getItem("decodexLanguage") || "Java";

languageName.textContent =
    selectedLanguage;


// ==========================================
// FILE EXTENSIONS
// ==========================================

const fileExtensions = {

    "Java": "java",

    "Python": "py",

    "C": "c",

    "C++": "cpp",

    "JavaScript": "js"

};

const extension =
    fileExtensions[selectedLanguage] || "txt";

fileName.textContent =
    "main." + extension;


// ==========================================
// EMPTY CODE EDITOR
// ==========================================
// Decodex starts with a completely empty
// editor for every programming language.
// ==========================================

codeInput.value = "";


// ==========================================
// RUN CODE
// ==========================================

runButton.addEventListener(
    "click",
    async () => {

        const code =
            codeInput.value.trim();


        // ======================================
        // EMPTY CODE CHECK
        // ======================================

        if (!code) {

            showError(
                "Please enter some code before running."
            );

            return;

        }


        // ======================================
        // RUNNING STATE
        // ======================================

        runButton.disabled = true;

        runButton.innerHTML =
            "⏳ Running...";

        executionStatus.textContent =
            "Running";

        executionStatus.style.color =
            "#f0b84b";


        // ======================================
        // SHOW RUNNING MESSAGE
        // ======================================

        output.innerHTML = `

            <div class="program-status running">
                Running your ${escapeHTML(
                    selectedLanguage
                )} code...
            </div>

        `;


        // ======================================
        // SHOW AI LOADING
        // ======================================

        explanation.innerHTML = `

            <div class="ai-empty">

                <div class="ai-large-icon">
                    ✦
                </div>

                <h3>
                    Analyzing your code...
                </h3>

                <p>
                    Decodex AI is preparing
                    the execution-flow explanation.
                </p>

            </div>

        `;


        try {

            // ==================================
            // SEND CODE TO BACKEND
            // ==================================

            const response =
                await fetch(
                    "http://localhost:5000/api/run",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            language:
                                selectedLanguage,

                            code:
                                code

                        })

                    }
                );


            // ==================================
            // GET BACKEND RESPONSE
            // ==================================

            const data =
                await response.json();


            // ==================================
            // HANDLE BACKEND ERROR
            // ==================================

            if (!response.ok) {

                throw new Error(

                    data.error ||
                    "Something went wrong."

                );

            }


            // ==================================
            // PROGRAM ERROR
            // ==================================

            if (!data.success) {

                executionStatus.textContent =
                    "Error";

                executionStatus.style.color =
                    "#e66b7a";


                output.innerHTML = `

                    <div class="program-status error">
                        ✕ Program Error
                    </div>

                    <div class="program-output error-output">
                        ${escapeHTML(
                            cleanOutput(
                                data.error ||
                                "Unknown error."
                            )
                        )}
                    </div>

                `;


                // ------------------------------
                // ASK AI TO EXPLAIN ERROR
                // ------------------------------

                await getAIExplanation(

                    selectedLanguage,

                    code,

                    data.output || "",

                    data.error || ""

                );


                return;

            }


            // ==========================================
// SUCCESS
// ==========================================

executionStatus.textContent = "Executed";
executionStatus.style.color = "#35c987";

const programOutput =
    data.output || "Program finished with no output.";

output.innerHTML =
    '<div style="color:#35c987; margin-bottom:12px;">' +
        '✓ Program executed successfully' +
    '</div>' +

    '<div style="color:#c5ced9; white-space:pre-wrap; line-height:1.7;">' +
        escapeHTML(programOutput) +
    '</div>';


// ==========================================
// GET REAL AI EXPLANATION
// ==========================================

await getAIExplanation(
    selectedLanguage,
    code,
    data.output || "",
    ""
);


            // ==================================
            // CLEAN OUTPUT
            // ==================================

            const cleanedOutput =
                cleanOutput(
                    data.output
                );


            // ==================================
            // DISPLAY OUTPUT
            // ==================================

            output.innerHTML = `

                <div class="program-status success">
                    ✓ Program executed successfully
                </div>

                <div class="program-output">
                    ${escapeHTML(
                        cleanedOutput
                    )}
                </div>

            `;


            // ==================================
            // GET AI EXPLANATION
            // ==================================

            await getAIExplanation(

                selectedLanguage,

                code,

                data.output || "",

                ""

            );

        }


        // ======================================
        // CONNECTION / SYSTEM ERROR
        // ======================================

        catch (error) {

            console.error(
                "Decodex execution error:",
                error
            );


            executionStatus.textContent =
                "Connection Error";

            executionStatus.style.color =
                "#e66b7a";


            output.innerHTML = `

                <div class="program-status error">
                    ✕ ${escapeHTML(
                        error.message
                    )}
                </div>

                <div class="connection-message">
                    Make sure the Decodex backend
                    is running.
                </div>

            `;


            explanation.innerHTML = `

                <div class="ai-empty">

                    <div class="ai-large-icon">
                        ⚠
                    </div>

                    <h3>
                        AI unavailable
                    </h3>

                    <p>
                        The backend could not be reached.
                    </p>

                </div>

            `;

        }


        // ======================================
        // RESET BUTTON
        // ======================================

        finally {

            runButton.disabled = false;

            runButton.innerHTML =
                "<span>▶</span> Run Code";

        }

    }
);


// ==========================================
// CLEAN PROGRAM OUTPUT
// ==========================================

function cleanOutput(text) {

    if (
        text === null ||
        text === undefined ||
        String(text).trim() === ""
    ) {

        return "Program finished with no output.";

    }


    return String(text)

        // Normalize Windows line endings
        .replace(/\r\n/g, "\n")

        // Normalize old Mac line endings
        .replace(/\r/g, "\n")

        // Remove spaces at the beginning/end
        .trim()

        // Remove unnecessary consecutive
        // blank lines
        .replace(/\n[ \t]*\n+/g, "\n");

}


// ==========================================
// AI EXPLANATION
// ==========================================

async function getAIExplanation(

    language,
    code,
    programOutput,
    programError

) {

    // ======================================
    // SHOW AI LOADING
    // ======================================

    explanation.innerHTML = `

        <div class="ai-empty">

            <div class="ai-large-icon">
                ✦
            </div>

            <h3>
                Decodex AI is analyzing...
            </h3>

            <p>
                Understanding the execution flow
                in simple English.
            </p>

        </div>

    `;


    try {

        // ==================================
        // SEND TO AI BACKEND
        // ==================================

        const response =
            await fetch(
                "http://localhost:5000/api/explain",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        language:
                            language,

                        code:
                            code,

                        output:
                            programOutput,

                        error:
                            programError

                    })

                }
            );


        // ==================================
        // GET AI RESPONSE
        // ==================================

        const data =
            await response.json();


        // ==================================
        // AI REQUEST ERROR
        // ==================================

        if (!response.ok) {

            throw new Error(

                data.error ||
                "AI explanation failed."

            );

        }


        // ==================================
        // DISPLAY AI RESULT
        // ==================================

        explanation.innerHTML = `

            <div class="ai-result">

                <div class="ai-title">

                    <span>✦</span>

                    Decodex AI

                </div>

                <div class="ai-text">

                    ${formatAIText(
                        data.explanation
                    )}

                </div>

            </div>

        `;

    }


    // ======================================
    // AI ERROR
    // ======================================

    catch (error) {

        console.error(
            "AI explanation error:",
            error
        );


        explanation.innerHTML = `

            <div class="ai-empty">

                <div class="ai-large-icon">
                    ⚠
                </div>

                <h3>
                    AI explanation unavailable
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// ==========================================
// FORMAT AI RESPONSE
// ==========================================

function formatAIText(text) {

    if (!text) {

        return `
            <p>
                No explanation was generated.
            </p>
        `;

    }


    return escapeHTML(text)

        .replace(
            /\n/g,
            "<br>"
        )

        .replace(
            /EXECUTION FLOW:/gi,
            "<strong>EXECUTION FLOW:</strong>"
        )

        .replace(
            /KEY CONCEPTS:/gi,
            "<br><strong>KEY CONCEPTS:</strong>"
        )

        .replace(
            /FINAL RESULT:/gi,
            "<br><strong>FINAL RESULT:</strong>"
        )

        .replace(
            /ERROR EXPLANATION:/gi,
            "<br><strong>ERROR EXPLANATION:</strong>"
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text == null
            ? ""
            : String(text);

    return div.innerHTML;

}


// ==========================================
// ERROR DISPLAY
// ==========================================

function showError(message) {

    executionStatus.textContent =
        "Error";

    executionStatus.style.color =
        "#e66b7a";


    output.innerHTML = `

        <div class="program-status error">
            ✕ ${escapeHTML(message)}
        </div>

    `;


    explanation.innerHTML = `

        <div class="ai-empty">

            <div class="ai-large-icon">
                ⚠
            </div>

            <h3>
                Nothing to explain
            </h3>

            <p>
                Enter some code and try again.
            </p>

        </div>

    `;

}


// ==========================================
// CHANGE LANGUAGE
// ==========================================

changeLanguage.addEventListener(
    "click",
    () => {

        window.location.href =
            "language.html";

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "decodexUser"
        );

        localStorage.removeItem(
            "decodexLanguage"
        );

        window.location.href =
            "index.html";

    }
);