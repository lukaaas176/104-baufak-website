const firstBauFaKInput: HTMLElement | null = document.getElementById("erste-baufak");
const whichBauFaKInput: HTMLElement | null = document.getElementById("wievielte-baufak");
const buddySelect: HTMLElement | null = document.getElementById("buddy");

if (firstBauFaKInput instanceof HTMLInputElement && whichBauFaKInput instanceof HTMLInputElement && buddySelect instanceof HTMLSelectElement) {
    firstBauFaKInput.addEventListener("change", () => {
        if (firstBauFaKInput.checked) {
            whichBauFaKInput.value = "1";
            whichBauFaKInput.disabled = true;
            buddySelect.selectedIndex = 1;
            buddySelect.disabled = true;
        } else {
            whichBauFaKInput.value = "1";
            whichBauFaKInput.disabled = false;
            buddySelect.disabled = false;
        }
    });
    firstBauFaKInput.dispatchEvent(new Event("change"));
}

const statusGroupSelect: HTMLElement | null = document.getElementById("statusgruppe");
const registrationFeeLabel: HTMLElement | null = document.getElementById("label-teilnahmegebuehr");
const fees: number[] = [50, 100, 150];
const registrationFeeLabelTemplate: string = "Ich habe die Teilnahmegebühr von %% € zur Kenntnis genommen und überweise diese bis zum 15.5.2025. Für eine Rechnung melde ich mich rechtzeitig unter baufakfinanzen.fsbgu@ed.tum.de";
const sleepingToggle: HTMLElement | null = document.getElementById("schlafplatz");
const sleepingSelect: HTMLElement | null = document.getElementById("schlafplatz-auswahl");
const sleepingPreferencesInput: HTMLElement | null = document.getElementById("schlafplatz-personen");

if (sleepingToggle instanceof HTMLInputElement && sleepingSelect instanceof HTMLSelectElement && sleepingPreferencesInput instanceof HTMLInputElement && statusGroupSelect instanceof HTMLSelectElement) {
    sleepingToggle.addEventListener("change", () => {
        sleepingSelect.disabled = !sleepingToggle.checked;
        sleepingSelect.dispatchEvent(new Event("change"));
        statusGroupSelect.dispatchEvent(new Event("change"));
    });
    sleepingSelect.addEventListener("change", () => {
        sleepingPreferencesInput.disabled = sleepingSelect.selectedIndex != 1 || sleepingSelect.disabled;
    });
    sleepingToggle.checked = true;
    sleepingToggle.dispatchEvent(new Event("change"));
    sleepingSelect.dispatchEvent(new Event("change"));
}

if (statusGroupSelect instanceof HTMLSelectElement && registrationFeeLabel instanceof HTMLElement && sleepingToggle instanceof HTMLInputElement) {
    statusGroupSelect.addEventListener("change", () => {
        let price = fees[statusGroupSelect.selectedIndex];
        if (statusGroupSelect.selectedIndex == 1 && !sleepingToggle.checked) {
            price -= 10;
        }
        registrationFeeLabel.innerText = registrationFeeLabelTemplate.replace("%%", price.toString());
    });
    statusGroupSelect.dispatchEvent(new Event("change"));
}


const allergiesCheck: HTMLElement | null = document.getElementById("allergie-sonstige");
const allergiesInput: HTMLElement | null = document.getElementById("allergien");
const allergiesInputParent: HTMLElement | undefined | null = allergiesInput?.parentElement?.parentElement;

if (allergiesCheck instanceof HTMLInputElement && allergiesInput instanceof HTMLInputElement && allergiesInputParent instanceof HTMLElement) {
    allergiesCheck.addEventListener("change", () => {
        allergiesInputParent.hidden = !allergiesCheck.checked;
        allergiesInput.disabled = !allergiesCheck.checked;
    });
    allergiesCheck.dispatchEvent(new Event("change"));
}

const immatrikulationParentDiv: HTMLElement | null = document.getElementById("div-immatrikulation");
const immatrikulationUpload: HTMLElement | null = document.getElementById("immatrikulation");
const immatrikulationUploadSelection: HTMLElement | null = document.getElementById("selection-immatrikulation");

if (immatrikulationParentDiv instanceof HTMLElement && immatrikulationUpload instanceof HTMLInputElement && immatrikulationUploadSelection instanceof HTMLElement) {
    immatrikulationParentDiv.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    immatrikulationParentDiv.addEventListener("dragenter", (event) => {
        event.preventDefault();
    });
    immatrikulationParentDiv.addEventListener("drop", (event) => {
        event.preventDefault();
        if (event.dataTransfer) {
            immatrikulationUpload.files = event.dataTransfer.files;
            immatrikulationUpload.dispatchEvent(new Event("change"));
        }
    });
    immatrikulationUpload.addEventListener("change", (event) => {
        let file: File | undefined | null = immatrikulationUpload.files?.item(0);
        if (!(file instanceof File)) {
            return;
        }
        if (10000000 < file.size) { // 10 MB
            alert("Die ausgewählte Datei ist zu groß!");
            event.preventDefault();
            return;
        }
        immatrikulationUploadSelection.innerText = "Selected: " + file.name;
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