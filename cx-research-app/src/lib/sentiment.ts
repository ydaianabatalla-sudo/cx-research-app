// Industry-agnostic sentiment + theme categorization.
// Spanish-first but easily extensible.

import { Sentiment } from "./types";

export interface ThemeDef {
  keywords: string[];
  color: string;
}

export const TAXONOMY: Record<string, ThemeDef> = {
  "Product / Service Quality": {
    keywords: [
      "funciona","no funciona","calidad","cumple","no cumple","defecto","defectuoso",
      "servicio","producto","lo prometido","esperaba","malo","excelente","bueno","pesimo","perfecto","impecable"
    ],
    color: "#4ade80"
  },
  "Ease of use / UX": {
    keywords: [
      "facil","facilisimo","intuitiva","intuitivo","complicado","confuso","no entiendo",
      "clara","clarisima","encontrar","perdido","pasos","clicks","simple","sencillo","complejo"
    ],
    color: "#22d3ee"
  },
  "Speed & Performance": {
    keywords: [
      "rapido","rapida","lento","lenta","demora","tardo","tarda","tardan","instantaneo",
      "cuelga","cae","caida","error","lag","rapidisima","perdi tiempo","corte","interrumpido"
    ],
    color: "#60a5fa"
  },
  "Support": {
    keywords: [
      "soporte","agente","atencion","respondieron","contestaron","chat","mail","bot","humano",
      "resolvieron","escale","escalo","llamar","llamada","atendieron","derivaron","call center","representante"
    ],
    color: "#f472b6"
  },
  "Price / Value": {
    keywords: [
      "precio","caro","barato","abusivo","justo","vale la pena","no vale","sorpresa","cargo",
      "comision","costo","plan","tarifa","aumento","aumentaron","sube","subieron"
    ],
    color: "#fbbf24"
  },
  "Trust & Security": {
    keywords: [
      "confianza","confio","seguro","seguridad","fraude","robo","robaron","hackeo","datos",
      "protegido","sospechoso","miedo","transparente","dudoso","engaño","engañada","engañaron"
    ],
    color: "#a78bfa"
  },
  "Communication": {
    keywords: [
      "aviso","avisaron","no me avisaron","notificacion","informacion","comunicacion","sorpresa",
      "mail","sms","whatsapp","comunicado","enteraron","enterar","informaron"
    ],
    color: "#34d399"
  },
  "Product Features": {
    keywords: [
      "falta","agregar","quiero que","deberian","no tienen","le falta","le faltan",
      "funcionalidad","funcion","integracion","integraciones","opciones","feature"
    ],
    color: "#c084fc"
  },
  "Onboarding / First experience": {
    keywords: [
      "alta","registro","activacion","instalacion","primer uso","empezar","esperando",
      "validar","aprobacion","rechazo","rechazaron","contratar","contratacion"
    ],
    color: "#fb923c"
  },
  "Reliability / Consistency": {
    keywords: [
      "siempre","nunca","a veces","depende","inconsistente","estable","fallas",
      "caidas","caidas constantes","cuando lo necesito","intermitente"
    ],
    color: "#f87171"
  },
  "Billing / Administrative": {
    keywords: [
      "factura","facturacion","cobro","cobraron","debito","error en cobro","baja",
      "cancelar","cancelacion","contrato","renovacion","plazo","vencimiento","recargo"
    ],
    color: "#fde047"
  },
  "Emotional / Relationship": {
    keywords: [
      "me siento","me hace sentir","escuchado","ignorado","valorado","descartado",
      "frustrado","frustrada","contento","feliz","harto","harta","decepcionado","decepcionada"
    ],
    color: "#fb7185"
  }
};

const POSITIVE = [
  "excelente","mejor","perfecta","perfecto","increible","recomendable","recomiendo",
  "encanta","encantadora","rapido","rapida","facil","facilisimo","clara","clarisima",
  "intuitiva","intuitivo","confio","satisfecho","satisfecha","gracias","impecable",
  "util","utilisima","genial","cumple","resolvio"
];

const NEGATIVE = [
  "pesimo","pesima","horrible","malisimo","malisima","terrible","frustrante","frustrado",
  "frustrada","dificil","complicado","confuso","lento","lenta","cae","cuelga","no funciona",
  "no entiendo","engaño","engañada","robo","robaron","perdi","tarde","tarda","tardaron",
  "sorpresa","abusivo","queja","denuncia","reintegro","enojado","enojada","molesta",
  "molesto","miedo","preocupado","preocupada","decepcion","decepcionada","decepcionado"
];

export function normalize(text: string | null | undefined): string {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function categorize(comment: string | null | undefined): string[] {
  if (!comment) return [];
  const norm = normalize(comment);
  const cats: string[] = [];
  for (const [name, def] of Object.entries(TAXONOMY)) {
    if (def.keywords.some(k => norm.includes(normalize(k)))) {
      cats.push(name);
    }
  }
  return cats;
}

export function detectSentiment(comment: string | null | undefined): Sentiment {
  if (!comment) return "neutral";
  const norm = normalize(comment);
  let pos = 0;
  let neg = 0;
  POSITIVE.forEach(w => { if (norm.includes(normalize(w))) pos++; });
  NEGATIVE.forEach(w => { if (norm.includes(normalize(w))) neg++; });
  if (pos > 0 && neg > 0) return "mixed";
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

export function themeColor(name: string): string {
  return TAXONOMY[name]?.color ?? "#60a5fa";
}
