export enum StatusGruppe {
    VERTRETER = "A: Vertreterinnen, Vertreter und Mitglieder der Fachschaften",
    EHEMALIGE = "B: Ehemalige",
    GAESTE = "C: Gäste"
}

export interface RegistrationData {
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
    readonly immatbescheinigung: ArrayBuffer;
    immatbescheinigungId?: string;
    readonly kommentar: string;
    readonly datenschutz: boolean;
    readonly teilnahmegebuehr: boolean;
}