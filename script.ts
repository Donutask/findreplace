const inputField = document.getElementById("input-textarea") as HTMLTextAreaElement;
const outputField = document.getElementById("output-textarea") as HTMLTextAreaElement;

const form = document.getElementById("find-replace-form") as HTMLFormElement;

const findLabel = document.getElementById("find-label") as HTMLLabelElement;
const findField = document.getElementById("find-input") as HTMLInputElement;
const replaceField = document.getElementById("replace-input") as HTMLInputElement;

const caseSensitiveCheckbox = document.getElementById("case-sensitive-input") as HTMLInputElement;
const wholeWordCheckbox = document.getElementById("whole-word-input") as HTMLInputElement;
const regexCheckbox = document.getElementById("regex-input") as HTMLInputElement;

const regexError = document.getElementById("regex-error") as HTMLElement;

const dropArea = document.getElementById("file-drop-area") as HTMLElement;

function RunFindReplace(event: SubmitEvent) {
    event.preventDefault();

    let regex: RegExp;

    const input = inputField.value;
    const rawFind = findField.value;

    //Nothing happens if not finding anything or no input
    if (rawFind.length <= 0 || input.length <= 0) {
        outputField.value = input;
        return;
    }

    if (regexCheckbox.checked) {
        //Treat string as regular expression.
        //To do this, use a regular expression to split the pattern and the flags.
        const match = rawFind.match(/^\/(.*)\/([gimsuy]*)$/);

        if (match) {
            const pattern = match[1];
            const flags = match[2];

            regex = new RegExp(pattern, flags);
        } else {
            //Not in form /pattern/flags still try, but will probably throw an error
            regex = new RegExp(rawFind);
        }
    } else {
        //Build regex query from find input and checkboxes
        let find = EscapeRegex(rawFind);

        let regexFlags: string;
        if (caseSensitiveCheckbox.checked) {
            regexFlags = 'g';
        } else {
            regexFlags = 'ig';
        }
        let regexContent: string;
        if (wholeWordCheckbox.checked) {
            regexContent = '\\b(' + find + ')\\b';
        } else {
            regexContent = '(' + find + ')';
        }

        regex = new RegExp(regexContent, regexFlags);
    }

    const replace = replaceField.value;

    //Perform the regex
    try {
        const output = input.replaceAll(regex, replace);
        outputField.value = output;
        regexError.hidden = true;
    } catch (error) {
        regexError.hidden = false;
        throw error;
    }
}

function EscapeRegex(s: string) {
    return s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
function FileDropped(event: DragEvent) {
    // Prevent files from being opened
    event.preventDefault();

    if (event.dataTransfer == null) {
        return;
    }

    //clear input
    inputField.value = "";

    if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the files
        [...event.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                const file = item.getAsFile();

                if (file != null) {
                    file.text().then(GotFileText);
                }
            }
        });
    } else {
        // Use DataTransfer interface to access the files
        [...event.dataTransfer.files].forEach((file, i) => {
            file.text().then(GotFileText);
        });
    }
}

function GotFileText(text: string) {
    inputField.value += text;
}

function DragOver(event: DragEvent) {
    // Prevent file from being opened
    event.preventDefault();
}

regexCheckbox.addEventListener("change", function () {
    if (regexCheckbox.checked) {
        findLabel.textContent = "Regular Expression:"
    } else {
        findLabel.textContent = "Find:"
    }
});
inputField.addEventListener("drop", FileDropped);
inputField.addEventListener("dragover", DragOver)
form.addEventListener("submit", RunFindReplace)
