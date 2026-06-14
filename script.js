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
const matchCountLabel = document.getElementById("change-count");
const chainButton = document.getElementById("chain-button");
const copyButton = document.getElementById("copy-button");
const dropArea = document.getElementById("file-drop-area");
function RunFindReplace(event) {
    event.preventDefault();
    let regex;
    const input = inputField.value;
    const rawFind = findField.value;
    if (rawFind.length <= 0 || input.length <= 0) {
        outputField.value = input;
        UpdateOutputButtonState();
        matchCountLabel.textContent = "Nothing Changed";
        return;
    }
    if (regexCheckbox.checked) {
        const match = rawFind.match(/^\/(.*)\/([gimsuy]*)$/);
        if (match) {
            const pattern = match[1];
            const flags = match[2];
            try {
                regex = new RegExp(pattern, flags);
            }
            catch (error) {
                regexError.hidden = false;
                throw error;
            }
        }
        else {
            try {
                regex = new RegExp(rawFind, MakeRegexFlags());
            }
            catch (error) {
                regexError.hidden = false;
                throw error;
            }
        }
    }
    else {
        let find = EscapeRegex(rawFind);
        find = UnescapeNewLines(find);
        let regexContent;
        if (wholeWordCheckbox.checked) {
            regexContent = '\\b(' + find + ')\\b';
        }
        else {
            regexContent = '(' + find + ')';
        }
        regex = new RegExp(regexContent, MakeRegexFlags());
    }
    let replace = replaceField.value;
    replace = UnescapeNewLines(replace);
    try {
        const output = input.replaceAll(regex, replace);
        outputField.value = output;
        regexError.hidden = true;
        const matchCount = (input.match(regex) || []).length;
        matchCountLabel.textContent = "Replacements: " + matchCount;
        UpdateOutputButtonState();
    }
    catch (error) {
        regexError.hidden = false;
        throw error;
    }
}
function MakeRegexFlags() {
    let regexFlags;
    if (caseSensitiveCheckbox.checked) {
        regexFlags = 'gm';
    }
    else {
        regexFlags = 'gmi';
    }
    return regexFlags;
}
function UnescapeNewLines(input) {
    return input.replace("\\n", "\n");
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
function Dirty() {
    regexError.hidden = true;
    matchCountLabel.textContent = "";
}
function UpdateInterfaceForRegex() {
    if (regexCheckbox.checked) {
        findLabel.textContent = "Regular Expression:";
        wholeWordCheckbox.disabled = true;
        wholeWordCheckbox.checked = false;
    }
    else {
        findLabel.textContent = "Find:";
        wholeWordCheckbox.disabled = false;
    }
}
function UpdateOutputButtonState() {
    const hasOutput = outputField.value != "";
    chainButton.disabled = !hasOutput;
    copyButton.disabled = !hasOutput;
}
function ChainOutput() {
    if (!outputField.value) {
        return;
    }
    inputField.value = outputField.value;
    outputField.value = "";
    findField.value = "";
    replaceField.value = "";
    Dirty();
    UpdateOutputButtonState();
}
function CopyOutput() {
    if (!outputField.value) {
        return;
    }
    navigator.clipboard.writeText(outputField.value).then(function () {
        copyButton.textContent = "Copied!";
        setTimeout(function () {
            copyButton.textContent = "Copy";
        }, 1000);
    });
}
regexCheckbox.addEventListener("change", function () {
    UpdateInterfaceForRegex();
});
inputField.addEventListener("input", Dirty);
form.addEventListener("input", Dirty);
inputField.addEventListener("drop", FileDropped);
inputField.addEventListener("dragover", DragOver);
form.addEventListener("submit", RunFindReplace);
UpdateInterfaceForRegex();
UpdateOutputButtonState();
