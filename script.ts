const inputField = document.getElementById("input-textarea") as HTMLTextAreaElement;
const outputField = document.getElementById("output-textarea") as HTMLTextAreaElement;

const form = document.getElementById("find-replace-form") as HTMLFormElement;

const findField = document.getElementById("find-input") as HTMLInputElement;
const replaceField = document.getElementById("replace-input") as HTMLInputElement;

const caseSensitiveCheckbox = document.getElementById("case-sensitive-input") as HTMLInputElement;
const wholeWordCheckbox = document.getElementById("whole-word-input") as HTMLInputElement;

const dropArea = document.getElementById("file-drop-area") as HTMLElement;

function RunFindReplace(event: SubmitEvent) {
    event.preventDefault();

    const find = findField.value;
    const replace = replaceField.value;
    const input = inputField.value;

    //Nothing happens
    if (find.length <= 0) {
        outputField.value = input;
        return;
    }

    //Build regex query from checkboxes
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

    //Perform the regex
    const regex = new RegExp(regexContent, regexFlags);
    console.log(regex);
    const output = input.replaceAll(regex, replace);

    outputField.value = output;
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

inputField.addEventListener("drop", FileDropped);
inputField.addEventListener("dragover", DragOver)
form.addEventListener("submit", RunFindReplace)
