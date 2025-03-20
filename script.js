"use strict";
const inputField = document.getElementById("input-textarea");
const outputField = document.getElementById("output-textarea");
const form = document.getElementById("find-replace-form");
const findLabel = document.getElementById("find-label");
const findField = document.getElementById("find-input");
const replaceField = document.getElementById("replace-input");
const caseSensitiveCheckbox = document.getElementById("case-sensitive-input");
const wholeWordCheckbox = document.getElementById("whole-word-input");
const regexCheckbox = document.getElementById("regex-input");
const regexError = document.getElementById("regex-error");
const dropArea = document.getElementById("file-drop-area");
function RunFindReplace(event) {
    event.preventDefault();
    let regex;
    const input = inputField.value;
    const rawFind = findField.value;
    if (rawFind.length <= 0 || input.length <= 0) {
        outputField.value = input;
        return;
    }
    if (regexCheckbox.checked) {
        const match = rawFind.match(/^\/(.*)\/([gimsuy]*)$/);
        if (match) {
            const pattern = match[1];
            const flags = match[2];
            regex = new RegExp(pattern, flags);
        }
        else {
            regex = new RegExp(rawFind);
        }
    }
    else {
        let find = EscapeRegex(rawFind);
        let regexFlags;
        if (caseSensitiveCheckbox.checked) {
            regexFlags = 'g';
        }
        else {
            regexFlags = 'ig';
        }
        let regexContent;
        if (wholeWordCheckbox.checked) {
            regexContent = '\\b(' + find + ')\\b';
        }
        else {
            regexContent = '(' + find + ')';
        }
        regex = new RegExp(regexContent, regexFlags);
    }
    const replace = replaceField.value;
    try {
        const output = input.replaceAll(regex, replace);
        outputField.value = output;
        regexError.hidden = true;
    }
    catch (error) {
        regexError.hidden = false;
        throw error;
    }
}
function EscapeRegex(s) {
    return s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
function FileDropped(event) {
    event.preventDefault();
    if (event.dataTransfer == null) {
        return;
    }
    inputField.value = "";
    if (event.dataTransfer.items) {
        [...event.dataTransfer.items].forEach((item, i) => {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file != null) {
                    file.text().then(GotFileText);
                }
            }
        });
    }
    else {
        [...event.dataTransfer.files].forEach((file, i) => {
            file.text().then(GotFileText);
        });
    }
}
function GotFileText(text) {
    inputField.value += text;
}
function DragOver(event) {
    event.preventDefault();
}
regexCheckbox.addEventListener("change", function () {
    if (regexCheckbox.checked) {
        findLabel.textContent = "Regular Expression:";
    }
    else {
        findLabel.textContent = "Find:";
    }
});
inputField.addEventListener("drop", FileDropped);
inputField.addEventListener("dragover", DragOver);
form.addEventListener("submit", RunFindReplace);
