const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { explainCode } = require("./ai");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Decodex backend is running!"

    });

});


// ==========================================
// RUN CODE
// ==========================================

app.post("/api/run", (req, res) => {

    const { language, code } = req.body;


    // --------------------------------------
    // CHECK LANGUAGE
    // --------------------------------------

    if (!language) {

        return res.status(400).json({

            success: false,

            error: "Language is required."

        });

    }


    // --------------------------------------
    // CHECK CODE
    // --------------------------------------

    if (!code || !code.trim()) {

        return res.status(400).json({

            success: false,

            error: "Please enter some code."

        });

    }


    console.log("");
    console.log("================================");
    console.log("DECODEX CODE EXECUTION");
    console.log("================================");
    console.log("Language:", language);
    console.log("");


    // --------------------------------------
    // SELECT LANGUAGE
    // --------------------------------------

    switch (language) {

        case "Python":

            runPython(code, res);

            break;


        case "JavaScript":

            runJavaScript(code, res);

            break;


        case "Java":

            runJava(code, res);

            break;


        case "C":

            runC(code, res);

            break;


        case "C++":

            runCpp(code, res);

            break;


        default:

            return res.status(400).json({

                success: false,

                error: "Unsupported programming language."

            });

    }

});


// ==========================================
// PYTHON
// ==========================================

function runPython(code, res) {

    const filePath =
        createTempFile(
            "decodex_",
            ".py",
            code
        );


    const pythonCommand =
        process.platform === "win32"
            ? "python"
            : "python3";


    execFile(

        pythonCommand,

        [filePath],

        {

            timeout: 5000,

            maxBuffer:
                1024 * 1024

        },

        (error, stdout, stderr) => {


            cleanupFile(filePath);


            // --------------------------------
            // ERROR
            // --------------------------------

            if (error) {

                return res.json({

                    success: false,

                    output:
                        stdout || "",

                    error:
                        stderr ||
                        error.message

                });

            }


            // --------------------------------
            // SUCCESS
            // --------------------------------

            return res.json({

                success: true,

                output: stdout,

                error: null

            });

        }

    );

}


// ==========================================
// JAVASCRIPT
// ==========================================

function runJavaScript(code, res) {

    const filePath =
        createTempFile(
            "decodex_",
            ".js",
            code
        );


    execFile(

        "node",

        [filePath],

        {

            timeout: 5000,

            maxBuffer:
                1024 * 1024

        },

        (error, stdout, stderr) => {


            cleanupFile(filePath);


            // --------------------------------
            // ERROR
            // --------------------------------

            if (error) {

                return res.json({

                    success: false,

                    output:
                        stdout || "",

                    error:
                        stderr ||
                        error.message

                });

            }


            // --------------------------------
            // SUCCESS
            // --------------------------------

            return res.json({

                success: true,

                output: stdout,

                error: null

            });

        }

    );

}


// ==========================================
// JAVA
// ==========================================

function runJava(code, res) {

    const folder =
        createTempFolder();


    const sourcePath =
        path.join(
            folder,
            "Main.java"
        );


    fs.writeFileSync(

        sourcePath,

        code,

        "utf8"

    );


    // --------------------------------------
    // COMPILE JAVA
    // --------------------------------------

    execFile(

        "javac",

        [sourcePath],

        {

            timeout: 5000,

            maxBuffer:
                1024 * 1024

        },

        (compileError, stdout, stderr) => {


            // --------------------------------
            // COMPILATION ERROR
            // --------------------------------

            if (compileError) {

                cleanupFolder(folder);

                return res.json({

                    success: false,

                    output: "",

                    error:
                        stderr ||
                        compileError.message

                });

            }


            // --------------------------------
            // RUN JAVA
            // --------------------------------

            execFile(

                "java",

                [

                    "-cp",

                    folder,

                    "Main"

                ],

                {

                    timeout: 5000,

                    maxBuffer:
                        1024 * 1024

                },

                (runError, output, runStderr) => {


                    cleanupFolder(folder);


                    // ------------------------
                    // RUNTIME ERROR
                    // ------------------------

                    if (runError) {

                        return res.json({

                            success: false,

                            output:
                                output || "",

                            error:
                                runStderr ||
                                runError.message

                        });

                    }


                    // ------------------------
                    // SUCCESS
                    // ------------------------

                    return res.json({

                        success: true,

                        output: output,

                        error: null

                    });

                }

            );

        }

    );

}


// ==========================================
// C
// ==========================================

function runC(code, res) {

    const folder =
        createTempFolder();


    const sourcePath =
        path.join(
            folder,
            "main.c"
        );


    const executableName =
        process.platform === "win32"
            ? "main.exe"
            : "main";


    const executablePath =
        path.join(
            folder,
            executableName
        );


    fs.writeFileSync(

        sourcePath,

        code,

        "utf8"

    );


    // --------------------------------------
    // COMPILE C
    // --------------------------------------

    execFile(

        "gcc",

        [

            sourcePath,

            "-o",

            executablePath

        ],

        {

            timeout: 5000,

            maxBuffer:
                1024 * 1024

        },

        (compileError, stdout, stderr) => {


            // --------------------------------
            // COMPILATION ERROR
            // --------------------------------

            if (compileError) {

                cleanupFolder(folder);

                return res.json({

                    success: false,

                    output: "",

                    error:
                        stderr ||
                        compileError.message

                });

            }


            // --------------------------------
            // RUN C
            // --------------------------------

            execFile(

                executablePath,

                [],

                {

                    timeout: 5000,

                    maxBuffer:
                        1024 * 1024

                },

                (runError, output, runStderr) => {


                    cleanupFolder(folder);


                    // ------------------------
                    // RUNTIME ERROR
                    // ------------------------

                    if (runError) {

                        return res.json({

                            success: false,

                            output:
                                output || "",

                            error:
                                runStderr ||
                                runError.message

                        });

                    }


                    // ------------------------
                    // SUCCESS
                    // ------------------------

                    return res.json({

                        success: true,

                        output: output,

                        error: null

                    });

                }

            );

        }

    );

}


// ==========================================
// C++
// ==========================================

function runCpp(code, res) {

    const folder =
        createTempFolder();


    const sourcePath =
        path.join(
            folder,
            "main.cpp"
        );


    const executableName =
        process.platform === "win32"
            ? "main.exe"
            : "main";


    const executablePath =
        path.join(
            folder,
            executableName
        );


    fs.writeFileSync(

        sourcePath,

        code,

        "utf8"

    );


    // --------------------------------------
    // COMPILE C++
    // --------------------------------------

    execFile(

        "g++",

        [

            sourcePath,

            "-o",

            executablePath

        ],

        {

            timeout: 5000,

            maxBuffer:
                1024 * 1024

        },

        (compileError, stdout, stderr) => {


            // --------------------------------
            // COMPILATION ERROR
            // --------------------------------

            if (compileError) {

                cleanupFolder(folder);

                return res.json({

                    success: false,

                    output: "",

                    error:
                        stderr ||
                        compileError.message

                });

            }


            // --------------------------------
            // RUN C++
            // --------------------------------

            execFile(

                executablePath,

                [],

                {

                    timeout: 5000,

                    maxBuffer:
                        1024 * 1024

                },

                (runError, output, runStderr) => {


                    cleanupFolder(folder);


                    // ------------------------
                    // RUNTIME ERROR
                    // ------------------------

                    if (runError) {

                        return res.json({

                            success: false,

                            output:
                                output || "",

                            error:
                                runStderr ||
                                runError.message

                        });

                    }


                    // ------------------------
                    // SUCCESS
                    // ------------------------

                    return res.json({

                        success: true,

                        output: output,

                        error: null

                    });

                }

            );

        }

    );

}


// ==========================================
// AI EXPLANATION
// ==========================================

app.post("/api/explain", async (req, res) => {

    const {

        language,

        code,

        output,

        error

    } = req.body;


    // --------------------------------------
    // CHECK INPUT
    // --------------------------------------

    if (!language || !code) {

        return res.status(400).json({

            success: false,

            error:
                "Language and code are required."

        });

    }


    console.log("");
    console.log("================================");
    console.log("DECODEX AI");
    console.log("================================");
    console.log("Generating explanation...");
    console.log("");


    try {

        const explanation =
            await explainCode(

                language,

                code,

                output || "",

                error || ""

            );


        return res.json({

            success: true,

            explanation:
                explanation

        });

    }

    catch (err) {

        console.error(
            "AI Error:",
            err
        );


        return res.status(500).json({

            success: false,

            error:
                "Unable to generate AI explanation."

        });

    }

});


// ==========================================
// CREATE TEMP FILE
// ==========================================

function createTempFile(
    prefix,
    extension,
    code
) {

    const fileName =

        prefix +

        Date.now() +

        "_" +

        Math.random()
            .toString(36)
            .substring(2) +

        extension;


    const filePath =

        path.join(

            os.tmpdir(),

            fileName

        );


    fs.writeFileSync(

        filePath,

        code,

        "utf8"

    );


    return filePath;

}


// ==========================================
// CREATE TEMP FOLDER
// ==========================================

function createTempFolder() {

    const folder =

        fs.mkdtempSync(

            path.join(

                os.tmpdir(),

                "decodex_"

            )

        );


    return folder;

}


// ==========================================
// DELETE TEMP FILE
// ==========================================

function cleanupFile(filePath) {

    try {

        if (
            fs.existsSync(
                filePath
            )
        ) {

            fs.unlinkSync(
                filePath
            );

        }

    }

    catch (error) {

        console.log(
            "Unable to delete temporary file."
        );

    }

}


// ==========================================
// DELETE TEMP FOLDER
// ==========================================

function cleanupFolder(folder) {

    try {

        if (
            fs.existsSync(
                folder
            )
        ) {

            fs.rmSync(

                folder,

                {

                    recursive: true,

                    force: true

                }

            );

        }

    }

    catch (error) {

        console.log(
            "Unable to delete temporary folder."
        );

    }

}


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "       DECODEX BACKEND"
        );

        console.log(
            "================================"
        );

        console.log("");

        console.log(
            `Server running on port ${PORT}`
        );

        console.log("");

    }
);