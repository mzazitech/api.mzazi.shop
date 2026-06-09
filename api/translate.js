// Vercel Serverless — Text Translation
// GET /api/translate?text=Hello+World&lang=es
// GET /api/translate?text=Bonjour&from=fr&lang=en
// Supports 100+ languages. Uses MyMemory (free, no key, 1000 words/day)

const LANGUAGES = {
  af:"Afrikaans",am:"Amharic",ar:"Arabic",az:"Azerbaijani",be:"Belarusian",
  bg:"Bulgarian",bn:"Bengali",bs:"Bosnian",ca:"Catalan",ceb:"Cebuano",
  co:"Corsican",cs:"Czech",cy:"Welsh",da:"Danish",de:"German",el:"Greek",
  en:"English",eo:"Esperanto",es:"Spanish",et:"Estonian",eu:"Basque",
  fa:"Persian",fi:"Finnish",fr:"French",fy:"Frisian",ga:"Irish",gd:"Scots Gaelic",
  gl:"Galician",gu:"Gujarati",ha:"Hausa",haw:"Hawaiian",he:"Hebrew",hi:"Hindi",
  hmn:"Hmong",hr:"Croatian",ht:"Haitian Creole",hu:"Hungarian",hy:"Armenian",
  id:"Indonesian",ig:"Igbo",is:"Icelandic",it:"Italian",ja:"Japanese",jw:"Javanese",
  ka:"Georgian",kk:"Kazakh",km:"Khmer",kn:"Kannada",ko:"Korean",ku:"Kurdish",
  ky:"Kyrgyz",la:"Latin",lb:"Luxembourgish",lo:"Lao",lt:"Lithuanian",
  lv:"Latvian",mg:"Malagasy",mi:"Maori",mk:"Macedonian",ml:"Malayalam",
  mn:"Mongolian",mr:"Marathi",ms:"Malay",mt:"Maltese",my:"Myanmar",
  ne:"Nepali",nl:"Dutch",no:"Norwegian",ny:"Chichewa",or:"Odia",pa:"Punjabi",
  pl:"Polish",ps:"Pashto",pt:"Portuguese",ro:"Romanian",ru:"Russian",
  rw:"Kinyarwanda",sd:"Sindhi",si:"Sinhala",sk:"Slovak",sl:"Slovenian",
  sm:"Samoan",sn:"Shona",so:"Somali",sq:"Albanian",sr:"Serbian",st:"Sesotho",
  su:"Sundanese",sv:"Swedish",sw:"Swahili",ta:"Tamil",te:"Telugu",tg:"Tajik",
  th:"Thai",tk:"Turkmen",tl:"Filipino",tr:"Turkish",tt:"Tatar",ug:"Uyghur",
  uk:"Ukrainian",ur:"Urdu",uz:"Uzbek",vi:"Vietnamese",xh:"Xhosa",yi:"Yiddish",
  yo:"Yoruba",zh:"Chinese",zu:"Zulu",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { text, lang, from = "auto" } = req.query;

  if (!text) {
    return res.status(400).json({
      error: "Missing ?text= parameter",
      example: "/api/translate?text=Hello+World&lang=es",
      languages: Object.entries(LANGUAGES).map(([code, name]) => ({ code, name })),
    });
  }
  if (!lang) {
    return res.status(400).json({
      error: "Missing ?lang= parameter (target language code)",
      example: "/api/translate?text=Hello&lang=es",
      availableLanguages: "Add ?lang=es for Spanish, ?lang=fr for French, etc.",
    });
  }

  const targetLang = lang.toLowerCase();
  if (!LANGUAGES[targetLang]) {
    return res.status(400).json({
      error: `Unknown language code: ${lang}`,
      hint: "Use standard ISO 639-1 codes like es, fr, de, zh, ar, sw",
    });
  }

  try {
    const langPair = from === "auto" ? `autodetect|${targetLang}` : `${from}|${targetLang}`;
    const apiRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );

    if (!apiRes.ok) throw new Error(`Translation API error: ${apiRes.status}`);
    const data = await apiRes.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation failed");
    }

    const translated = data.responseData.translatedText;
    const detectedFrom = data.responseData.detectedLanguage || from;

    return res.status(200).json({
      original: text,
      translated,
      from: detectedFrom === "autodetect" ? "auto" : detectedFrom,
      fromName: LANGUAGES[detectedFrom] || detectedFrom,
      to: targetLang,
      toName: LANGUAGES[targetLang],
      confidence: data.responseData.match,
    });
  } catch (err) {
    return res.status(500).json({ error: "Translation failed", message: err.message });
  }
};
