enum StatusGruppe {
    VERTRETER = "A: Vertreterinnen, Vertreter und Mitglieder der Fachschaften",
    EHEMALIGE = "B: Ehemalige",
    GAESTE = "C: Gäste"
}

interface RegistrationData {
    readonly vorname: string;
    readonly nachname: string;
    readonly email: string;
    readonly telefon: string;
    readonly hochschule: string;
    readonly statusGruppe: StatusGruppe;
    readonly ersteBaufak: boolean;
    readonly wievielteBaufak: number;
    readonly bauhelm: boolean;
    readonly sicherheitsschuhe: boolean;
    readonly deutschlandticket: boolean;
    readonly anreisezeitpunkt: string;
    readonly anreisezeitpunktKommentar: string;
    readonly anreisemittel: string;
    readonly abreisezeitpunkt: string;
    readonly abreisezeitpunktKommentar: string;
    readonly abreisemittel: string;
    readonly schlafplatz: boolean;
    readonly kommentarSchlafplatz: string;
    readonly schlafplatzAuswahl: string;
    readonly schlafplatzPersonen: string;
    readonly ernaehrung: string;
    readonly allergieLaktose: boolean;
    readonly allergieUniversitaet: boolean;
    readonly allergieGluten: boolean;
    readonly allergieNuesse: boolean;
    readonly allergieArchitekten: boolean;
    readonly allergieSoja: boolean;
    readonly allergien: string;
    readonly tshirt: string;
    readonly buddy: string;
    readonly immatbescheinigung: File;
    readonly kommentar: string;
    readonly datenschutz: boolean;
    readonly teilnahmegebuehr: boolean;
}

function getAsString(formData: {[k: string]: string | File}, validationErrors: Map<string, string>, name: string, humanName: string): string {
    let entry: string | File = formData[name];
    if (entry == null || entry instanceof File) {
        validationErrors.set(name, humanName + " hat keine gültige Eingabe");
        return "";
    }
    return entry as string;
}

function getStatusGruppe(formData: {[k: string]: string | File}, validationErrors: Map<string, string>): StatusGruppe {
    switch (getAsString(formData, validationErrors, "statusgruppe", "Statusgruppe")) {
        case StatusGruppe.VERTRETER:
            return StatusGruppe.VERTRETER;
        case StatusGruppe.EHEMALIGE:
            return StatusGruppe.EHEMALIGE;
        case StatusGruppe.GAESTE:
            return StatusGruppe.GAESTE;
        default:
            validationErrors.set("statusgruppe", "Die Statusgruppe hat keine gültige Auswahl");
            return null;
    }
}

function checkNotEmpty(formData: {[k: string]: string | File}, validationErrors: Map<string, string>, name: string, humanName: string): string {
    let entry: string = getAsString(formData, validationErrors, name, humanName);
    if (entry.trim().length == 0) {
        validationErrors.set(name, humanName + " darf nicht leer sein!");
    }
    return entry;
}

function checkEmail(formData: {[k: string]: string | File}, validationErrors: Map<string, string>): string {
    let entry: string = checkNotEmpty(formData, validationErrors, "email", "Die E-Mail");
    if (!entry.match(/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,}$/)) {
        validationErrors.set("email", "Die E-Mail hat ein ungültiges Format!");
    }
    return entry;
}

function parseRegistration(formData: {[k: string]: string | File}): RegistrationData | Map<string, string> {
    let validationErrors: Map<string, string> = new Map();
    let data: RegistrationData = null;
    
    let statusGruppe: StatusGruppe = getStatusGruppe(formData, validationErrors);
    let ersteBauFaK: boolean = "erste-baufak" in formData;
    let wievielteBaufak = parseInt(checkNotEmpty(formData, validationErrors, "wievielte-baufak", "Die wievielte BauFaK"));
    if (wievielteBaufak == Number.NaN || wievielteBaufak < 1) {
        validationErrors.set("wievielte-baufak", "Die wievielte BauFaK ist keine gültige Zahl");
    }
    if (ersteBauFaK && wievielteBaufak != 1) {
        validationErrors.set("wievielte-baufak", "Da spielt jemand mit dem Formular ;)");
    }
    if (!("datenschutz" in formData)) {
        validationErrors.set("datenschutz", "Der Datenschutz muss akzeptiert werden!");
    }
    if (!("teilnahmegebuehr" in formData)) {
        validationErrors.set("teilnahmegebuehr", "Die Teilnahmegebühr muss akzeptiert werden!");
    }
    data = {
        vorname: checkNotEmpty(formData, validationErrors, "vorname", "Der Vorname"),
        nachname: checkNotEmpty(formData, validationErrors, "nachname", "Der Nachname"),
        email: checkEmail(formData, validationErrors),
        telefon: checkNotEmpty(formData, validationErrors, "telefon", "Die Telefonnummer"),
        hochschule: checkNotEmpty(formData, validationErrors, "hochschule", "Die Hochschule"),
        statusGruppe: statusGruppe,
        ersteBaufak: ersteBauFaK,
        wievielteBaufak: wievielteBaufak,
        bauhelm: "bauhelm" in formData,
        sicherheitsschuhe: "sicherheitsschuhe" in formData,
        deutschlandticket: "deutschlandticket" in formData,
        anreisezeitpunkt: checkNotEmpty(formData, validationErrors, "anreisezeitpunkt", "Der Anreisezeitpunkt"),
        anreisezeitpunktKommentar: getAsString(formData, validationErrors, "anreisezeitpunkt-kommentar", "Die genaue Zeit der Anreise"),
        anreisemittel: checkNotEmpty(formData, validationErrors, "anreisemittel", "Das Anreisemittel"),
        abreisezeitpunkt: checkNotEmpty(formData, validationErrors, "abreisezeitpunkt", "Der Abreisezeitpunkt"),
        abreisezeitpunktKommentar: getAsString(formData, validationErrors, "abreisezeitpunkt-kommentar", "Die genaue Zeit der Abreise"),
        abreisemittel: checkNotEmpty(formData, validationErrors, "abreisemittel", "Das Abreisemittel"),
        schlafplatz: "schlafplatz" in formData,
        kommentarSchlafplatz: getAsString(formData, validationErrors, "schlafplatz-kommentar", "Der Kommentar zum Schlafplatz"),
        schlafplatzAuswahl: getAsString(formData, validationErrors, "schlafplatz-auswahl", "Die Zimmerpartnerpräferenz"),
        schlafplatzPersonen: getAsString(formData, validationErrors, "schlafplatz-personen", "Die Zimmerpartner"),
        ernaehrung: checkNotEmpty(formData, validationErrors, "ernaehrung", "Die Ernährungsform"),
        allergieLaktose: "allergie-laktose" in formData,
        allergieUniversitaet: "allergie-universitaet" in formData,
        allergieGluten: "allergie-gluten" in formData,
        allergieNuesse: "allergie-nuesse" in formData,
        allergieArchitekten: "allergie-architekten" in formData,
        allergieSoja: "allergie-soja" in formData,
        allergien: getAsString(formData, validationErrors, "allergien", "Die sonstigen Allergien"),
        tshirt: checkNotEmpty(formData, validationErrors, "tshirt", "Das T-Shirt"),
        buddy: checkNotEmpty(formData, validationErrors, "buddy", "Das Buddyprogramm"),
        immatbescheinigung: null,
        kommentar: getAsString(formData, validationErrors, "kommentar", "Der Kommentar"),
        datenschutz: "datenschutz" in formData,
        teilnahmegebuehr: "teilnahmegebuehr" in formData
    };
    
    if (0 < validationErrors.size)
        return validationErrors;
    else
        return data;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let formData: {[k: string]: string | File} = await context.request.formData().then(Object.fromEntries);
    console.log(JSON.stringify(formData));
    let body: RegistrationData | Map<string, string> = parseRegistration(formData);
    if (body instanceof Map) {
        return Response.json(Object.fromEntries(body), { status: 400 });
    }
    
    return Response.json(body);
};