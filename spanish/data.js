/* Spanish vocabulary & phrase data. All content is plain, verified Spanish.
   Each lesson: { id, title, emoji, blurb, words:[{es, en, hint}] }  */
window.LESSONS = [
  {
    id: "greetings", title: "Greetings & Basics", emoji: "👋",
    blurb: "The essentials you'll use every day.",
    words: [
      { es: "hola", en: "hello", hint: "OH-lah" },
      { es: "adiós", en: "goodbye", hint: "ah-DYOHS" },
      { es: "buenos días", en: "good morning", hint: "BWEH-nohs DEE-ahs" },
      { es: "buenas tardes", en: "good afternoon", hint: "BWEH-nahs TAR-dehs" },
      { es: "buenas noches", en: "good night", hint: "BWEH-nahs NOH-chehs" },
      { es: "por favor", en: "please", hint: "por fah-VOR" },
      { es: "gracias", en: "thank you", hint: "GRAH-syahs" },
      { es: "de nada", en: "you're welcome", hint: "deh NAH-dah" },
      { es: "sí", en: "yes" },
      { es: "no", en: "no" },
      { es: "perdón", en: "sorry / excuse me", hint: "per-DOHN" },
      { es: "¿cómo estás?", en: "how are you?", hint: "KOH-moh ehs-TAHS" },
    ],
  },
  {
    id: "numbers", title: "Numbers 1–20", emoji: "🔢",
    blurb: "Count from one to twenty.",
    words: [
      { es: "uno", en: "one" }, { es: "dos", en: "two" }, { es: "tres", en: "three" },
      { es: "cuatro", en: "four" }, { es: "cinco", en: "five" }, { es: "seis", en: "six" },
      { es: "siete", en: "seven" }, { es: "ocho", en: "eight" }, { es: "nueve", en: "nine" },
      { es: "diez", en: "ten" }, { es: "once", en: "eleven" }, { es: "doce", en: "twelve" },
      { es: "trece", en: "thirteen" }, { es: "catorce", en: "fourteen" }, { es: "quince", en: "fifteen" },
      { es: "dieciséis", en: "sixteen" }, { es: "diecisiete", en: "seventeen" },
      { es: "dieciocho", en: "eighteen" }, { es: "diecinueve", en: "nineteen" }, { es: "veinte", en: "twenty" },
    ],
  },
  {
    id: "colors", title: "Colors", emoji: "🎨",
    blurb: "Describe the world around you.",
    words: [
      { es: "rojo", en: "red" }, { es: "azul", en: "blue" }, { es: "verde", en: "green" },
      { es: "amarillo", en: "yellow" }, { es: "naranja", en: "orange" }, { es: "morado", en: "purple" },
      { es: "rosa", en: "pink" }, { es: "negro", en: "black" }, { es: "blanco", en: "white" },
      { es: "gris", en: "grey" }, { es: "marrón", en: "brown" }, { es: "dorado", en: "gold" },
    ],
  },
  {
    id: "family", title: "Family", emoji: "👨‍👩‍👧",
    blurb: "Talk about the people closest to you.",
    words: [
      { es: "la familia", en: "family" }, { es: "la madre", en: "mother" }, { es: "el padre", en: "father" },
      { es: "el hermano", en: "brother" }, { es: "la hermana", en: "sister" }, { es: "el hijo", en: "son" },
      { es: "la hija", en: "daughter" }, { es: "el abuelo", en: "grandfather" }, { es: "la abuela", en: "grandmother" },
      { es: "el esposo", en: "husband" }, { es: "la esposa", en: "wife" }, { es: "el amigo", en: "friend (m)" },
      { es: "la amiga", en: "friend (f)" },
    ],
  },
  {
    id: "food", title: "Food & Drink", emoji: "🍽️",
    blurb: "Order like a local.",
    words: [
      { es: "el agua", en: "water" }, { es: "el café", en: "coffee" }, { es: "el pan", en: "bread" },
      { es: "la leche", en: "milk" }, { es: "el queso", en: "cheese" }, { es: "la carne", en: "meat" },
      { es: "el pollo", en: "chicken" }, { es: "el pescado", en: "fish" }, { es: "la fruta", en: "fruit" },
      { es: "la manzana", en: "apple" }, { es: "el huevo", en: "egg" }, { es: "el arroz", en: "rice" },
      { es: "la cerveza", en: "beer" }, { es: "el vino", en: "wine" },
    ],
  },
  {
    id: "verbs", title: "Common Verbs", emoji: "🏃",
    blurb: "The action words that power sentences.",
    words: [
      { es: "ser", en: "to be (permanent)" }, { es: "estar", en: "to be (state)" }, { es: "tener", en: "to have" },
      { es: "hacer", en: "to do / make" }, { es: "ir", en: "to go" }, { es: "querer", en: "to want" },
      { es: "poder", en: "to be able to" }, { es: "hablar", en: "to speak" }, { es: "comer", en: "to eat" },
      { es: "beber", en: "to drink" }, { es: "vivir", en: "to live" }, { es: "ver", en: "to see" },
      { es: "saber", en: "to know" }, { es: "decir", en: "to say" },
    ],
  },
  {
    id: "travel", title: "Travel & Directions", emoji: "✈️",
    blurb: "Find your way anywhere.",
    words: [
      { es: "el aeropuerto", en: "airport" }, { es: "el hotel", en: "hotel" }, { es: "la calle", en: "street" },
      { es: "el baño", en: "bathroom" }, { es: "izquierda", en: "left" }, { es: "derecha", en: "right" },
      { es: "recto", en: "straight ahead" }, { es: "el tren", en: "train" }, { es: "el autobús", en: "bus" },
      { es: "el coche", en: "car" }, { es: "el billete", en: "ticket" }, { es: "la playa", en: "beach" },
      { es: "¿dónde está?", en: "where is it?" },
    ],
  },
  {
    id: "time", title: "Days & Time", emoji: "📅",
    blurb: "Make plans and tell the time.",
    words: [
      { es: "lunes", en: "Monday" }, { es: "martes", en: "Tuesday" }, { es: "miércoles", en: "Wednesday" },
      { es: "jueves", en: "Thursday" }, { es: "viernes", en: "Friday" }, { es: "sábado", en: "Saturday" },
      { es: "domingo", en: "Sunday" }, { es: "hoy", en: "today" }, { es: "mañana", en: "tomorrow" },
      { es: "ayer", en: "yesterday" }, { es: "la hora", en: "the hour / time" }, { es: "ahora", en: "now" },
      { es: "siempre", en: "always" },
    ],
  },
];

/* Useful full phrases — shown in the Tutor's suggestions and as a bonus lesson. */
window.PHRASES = [
  { es: "Me llamo...", en: "My name is..." },
  { es: "Mucho gusto", en: "Nice to meet you" },
  { es: "No entiendo", en: "I don't understand" },
  { es: "¿Hablas inglés?", en: "Do you speak English?" },
  { es: "¿Cuánto cuesta?", en: "How much does it cost?" },
  { es: "La cuenta, por favor", en: "The check, please" },
  { es: "Estoy aprendiendo español", en: "I'm learning Spanish" },
  { es: "¿Puedes repetir, por favor?", en: "Can you repeat, please?" },
];
