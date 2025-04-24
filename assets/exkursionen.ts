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

const exkursionsForm: HTMLElement | null = document.getElementById("exkursionen");
const exkursionsFeedbackDiv: HTMLElement | null = document.getElementById("feedback");
const exkursionsSubmitButton: HTMLElement | null = document.getElementById("submit-btn");

async function sendData(formData: FormData, feedbackDiv: HTMLElement, button: HTMLButtonElement) {
    let response: Response = await fetch("/exkursions-registration", {
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

if (exkursionsForm instanceof HTMLFormElement && exkursionsFeedbackDiv instanceof HTMLElement && exkursionsSubmitButton instanceof HTMLButtonElement) {
    exkursionsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        sendData(new FormData(exkursionsForm), exkursionsFeedbackDiv, exkursionsSubmitButton);
        exkursionsSubmitButton.disabled = true;
    });
}