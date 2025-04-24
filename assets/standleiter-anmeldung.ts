const standleiterFirstBauFaKInput: HTMLElement | null = document.getElementById("erste-baufak");
const standleiterWhichBauFaKInput: HTMLElement | null = document.getElementById("wievielte-baufak");
const standleiterBuddySelect: HTMLElement | null = document.getElementById("buddy");

if (standleiterFirstBauFaKInput instanceof HTMLInputElement && standleiterWhichBauFaKInput instanceof HTMLInputElement && standleiterBuddySelect instanceof HTMLSelectElement) {
    standleiterFirstBauFaKInput.addEventListener("change", () => {
        if (standleiterFirstBauFaKInput.checked) {
            standleiterWhichBauFaKInput.value = "1";
            standleiterWhichBauFaKInput.disabled = true;
            standleiterBuddySelect.selectedIndex = 1;
            standleiterBuddySelect.disabled = true;
        } else {
            standleiterWhichBauFaKInput.value = "1";
            standleiterWhichBauFaKInput.disabled = false;
            standleiterBuddySelect.disabled = false;
        }
    });
    standleiterFirstBauFaKInput.dispatchEvent(new Event("change"));
}


const standleiterAllergiesCheck: HTMLElement | null = document.getElementById("allergie-sonstige");
const standleiterAllergiesInput: HTMLElement | null = document.getElementById("allergien");
const standleiterAllergiesInputParent: HTMLElement | undefined | null = standleiterAllergiesInput?.parentElement?.parentElement;

if (standleiterAllergiesCheck instanceof HTMLInputElement && standleiterAllergiesInput instanceof HTMLInputElement && standleiterAllergiesInputParent instanceof HTMLElement) {
    standleiterAllergiesCheck.addEventListener("change", () => {
        standleiterAllergiesInputParent.hidden = !standleiterAllergiesCheck.checked;
        standleiterAllergiesInput.disabled = !standleiterAllergiesCheck.checked;
    });
    standleiterAllergiesCheck.dispatchEvent(new Event("change"));
}

const standleiterImmatrikulationParentDiv: HTMLElement | null = document.getElementById("div-immatrikulation");
const standleiterImmatrikulationUpload: HTMLElement | null = document.getElementById("immatrikulation");
const standleiterImmatrikulationUploadSelection: HTMLElement | null = document.getElementById("selection-immatrikulation");

if (standleiterImmatrikulationParentDiv instanceof HTMLElement && standleiterImmatrikulationUpload instanceof HTMLInputElement && standleiterImmatrikulationUploadSelection instanceof HTMLElement) {
    standleiterImmatrikulationParentDiv.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    standleiterImmatrikulationParentDiv.addEventListener("dragenter", (event) => {
        event.preventDefault();
    });
    standleiterImmatrikulationParentDiv.addEventListener("drop", (event) => {
        event.preventDefault();
        if (event.dataTransfer) {
            standleiterImmatrikulationUpload.files = event.dataTransfer.files;
            standleiterImmatrikulationUpload.dispatchEvent(new Event("change"));
        }
    });
    standleiterImmatrikulationUpload.addEventListener("change", (event) => {
        let file: File | undefined | null = standleiterImmatrikulationUpload.files?.item(0);
        if (!(file instanceof File)) {
            return;
        }
        if (10000000 < file.size) { // 10 MB
            alert("Die ausgewählte Datei ist zu groß!");
            event.preventDefault();
            return;
        }
        standleiterImmatrikulationUploadSelection.innerText = "Selected: " + file.name;
    })
}

document.querySelectorAll("input").forEach(element => {
    if (element instanceof HTMLInputElement) {
        const sibling: Element | null = element.nextElementSibling;
        element.addEventListener("focusout", () => {
            element.classList.add("invalid:outline-red-600", "invalid:outline-2", "invalid:-outline-offset-2", "peer");
            if (sibling && sibling.classList.contains("errorMessage")) {
                sibling.classList.add("peer-invalid:inline");
            }
        });
    }
});

document.querySelectorAll("select").forEach(element => {
    if (element instanceof HTMLSelectElement) {
        let sibling: Element | null | undefined = element.nextElementSibling?.nextElementSibling;
        element.addEventListener("focusout", () => {
            element.classList.add("invalid:outline-red-600", "invalid:outline-2", "invalid:-outline-offset-2", "peer");
            if (sibling && sibling.classList.contains("errorMessage")) {
                sibling.classList.add("peer-invalid:inline");
            }
        });
    }
});

const standleiterForm: HTMLElement | null = document.getElementById("registration");
const standleiterFeedbackDiv: HTMLElement | null = document.getElementById("feedback");
const standleiterSubmitButton: HTMLElement | null = document.getElementById("submit-btn");

async function sendData(formData: FormData, feedbackDiv: HTMLElement, button: HTMLButtonElement) {
    let response: Response = await fetch("/standleiter-registration", {
        method: "POST",
        body: formData
    });
    if (response.status == 200) {
        feedbackDiv.innerText = "Du hast dich erfolgreich angemeldet. Bitte überprüfe dein E-Mail Posteingang sowie auch Spam!";
        feedbackDiv.classList.remove("hidden", "bg-red-100", "border-red-500");
        feedbackDiv.classList.add("bg-emerald-100", "border-emerald-500");
        button.innerText = "Angemeldet";
        button.classList.remove("bg-primary", "disabled:opacity-50");
        button.classList.add("bg-emerald-500");
        return;
    }
    feedbackDiv.innerText = await response.text();
    feedbackDiv.classList.remove("hidden", "bg-emerald-100", "border-emerald-500");
    feedbackDiv.classList.add("bg-red-100", "border-red-500");
    button.disabled = false;
    return;
}

if (standleiterForm instanceof HTMLFormElement && standleiterFeedbackDiv instanceof HTMLElement && standleiterSubmitButton instanceof HTMLButtonElement) {
    standleiterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        sendData(new FormData(standleiterForm), standleiterFeedbackDiv, standleiterSubmitButton);
        standleiterSubmitButton.disabled = true;
    });
}