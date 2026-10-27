// Configurazione modificabile senza toccare il codice dell'app.
export default {
  segnalazioni: {
    // "github": apre una issue precompilata nel repository indicato.
    // "google-form": apre un Google Form precompilato (vedi README per trovare gli id dei campi).
    tipo: "github",
    repo: "Mattew-dev/dove-e-laula",
    etichetta: "segnalazione",
    url: "", // solo per google-form: https://docs.google.com/forms/d/e/.../viewform
    campoTitolo: "", // solo per google-form: es. "entry.123456"
    campoDettagli: "", // solo per google-form: es. "entry.654321"
  },
};
