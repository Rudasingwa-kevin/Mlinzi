import { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext(null);

const translations = {
  en: {
    home: "Home",
    reportAbuse: "Report Abuse",
    login: "Login",
    logout: "Logout",
    cases: "Cases",
    analytics: "Analytics",
    admin: "Admin",
    heroTitle: "Protecting Children Online",
    heroSubtitle: "Mlinzi helps children in Rwanda report online abuse and get support safely and anonymously.",
    reportNow: "Report Abuse",
    howItWorks: "How It Works",
    step1Title: "Upload",
    step1Desc: "Take a screenshot of the harmful message",
    step2Title: "Analyze",
    step2Desc: "Our AI checks if it is harmful",
    step3Title: "Protect",
    step3Desc: "Get advice and connect to help",
    safetyMessage: "Your safety comes first. You are not alone.",
    analysisResults: "Analysis Results",
    riskLevel: "Risk Level",
    confidence: "Confidence",
    category: "Category",
    whatToDo: "What You Should Do",
    extractedText: "Extracted Text",
    counselorHelp: "Would you like help from a trained child protection counselor?",
    stayAnonymous: "Keep this anonymous",
    connectCounselor: "Connect me to a counselor",
    reportAnother: "Report Another",
    backToHome: "Back to Home",
    thankYou: "Thank you for speaking up. Your report helps protect other children too.",
    district: "District",
    selectDistrict: "Select your district",
    preferredContact: "Preferred contact method",
    phoneCall: "Phone call",
    sms: "SMS",
    whatsapp: "WhatsApp",
    email: "Email",
    bestTime: "Best time to contact",
    bestTimePlaceholder: "e.g., Morning, After school, Anytime",
    areYouSafe: "Are you currently safe?",
    submitReferral: "Submit Referral",
    contactEncrypted: "Your contact information is encrypted and only shared with your assigned counselor.",
    counselDashboard: "Counselor Dashboard",
    manageReferrals: "Manage referrals and support children in need",
    myCases: "My Cases",
    unclaimed: "Unclaimed",
    newCases: "New Cases",
    inReview: "In Review",
    unclaimedCases: "Unclaimed",
    allStatuses: "All Statuses",
    new: "New",
    underReview: "Under Review",
    resolved: "Resolved",
    refresh: "Refresh",
    noCases: "No cases found",
    noMyCases: "You don't have any assigned cases yet.",
    noUnclaimed: "All cases have been claimed.",
    claim: "Claim",
    viewDetails: "View Details",
    nationalDashboard: "National Dashboard",
    evidenceInsights: "Evidence-driven insights for policy and decision makers",
    totalReports: "Total Reports Submitted",
    escalatedToCounselors: "escalated to counselors",
    highSeverity: "High Severity",
    referrals: "Referrals",
    avgResponse: "Avg Response",
    bySeverity: "By Severity",
    byCategory: "By Category",
    byDistrict: "By District",
    referralStatus: "Referral Status",
    monthlyTrend: "Monthly Trend",
    dataSummary: "Data Summary",
    dataSummaryText: "This dashboard provides an overview of all reports submitted through Mlinzi. Data is updated in real-time as new reports are received. All data is anonymous and aggregated to protect children's privacy. Use these insights to inform policy decisions and allocate resources where they are needed most.",
    safetyAdvice: "SAFETY ADVICE",
    safetyTip1: "Do not reply to the harmful message",
    safetyTip2: "Block the person sending it",
    safetyTip3: "Take a screenshot as evidence",
    safetyTip4: "Tell a trusted adult",
    safetyTip5: "You are not alone - help is available",
    accessibility: "Accessibility",
    highContrast: "High Contrast",
    largeText: "Large Text",
    language: "Language",
  },
  fr: {
    home: "Accueil",
    reportAbuse: "Signaler un abus",
    login: "Connexion",
    logout: "Déconnexion",
    cases: "Cas",
    analytics: "Analytique",
    admin: "Admin",
    heroTitle: "Protéger les enfants en ligne",
    heroSubtitle: "Mlinzi aide les enfants au Rwanda à signaler les abus en ligne et à obtenir un soutien en toute sécurité et anonymement.",
    reportNow: "Signaler un abus",
    howItWorks: "Comment ça marche",
    step1Title: "Télécharger",
    step1Desc: "Prenez une capture d'écran du message nocif",
    step2Title: "Analyser",
    step2Desc: "Notre IA vérifie si c'est nocif",
    step3Title: "Protéger",
    step3Desc: "Obtenez des conseils et connectez-vous à l'aide",
    safetyMessage: "Votre sécurité passe en premier. Vous n'êtes pas seul.",
    analysisResults: "Résultats de l'analyse",
    riskLevel: "Niveau de risque",
    confidence: "Confiance",
    category: "Catégorie",
    whatToDo: "Ce que vous devriez faire",
    extractedText: "Texte extrait",
    counselorHelp: "Aimeriez-vous de l'aide d'un conseiller en protection de l'enfance?",
    stayAnonymous: "Rester anonyme",
    connectCounselor: "Me connecter à un conseiller",
    reportAnother: "Signaler un autre",
    backToHome: "Retour à l'accueil",
    thankYou: "Merci de parler. Votre rapport aide à protéger d'autres enfants aussi.",
    district: "District",
    selectDistrict: "Sélectionnez votre district",
    preferredContact: "Méthode de contact préférée",
    phoneCall: "Appel téléphonique",
    sms: "SMS",
    whatsapp: "WhatsApp",
    email: "E-mail",
    bestTime: "Meilleur moment pour vous contacter",
    bestTimePlaceholder: "ex., Matin, Après l'école, N'importe quand",
    areYouSafe: "Êtes-vous en sécurité actuellement?",
    submitReferral: "Soumettre le referral",
    contactEncrypted: "Vos informations de contact sont cryptées et partagées uniquement avec votre conseiller assigné.",
    counselDashboard: "Tableau de bord du conseiller",
    manageReferrals: "Gérer les referrals et soutenir les enfants dans le besoin",
    myCases: "Mes cas",
    unclaimed: "Non réclamés",
    newCases: "Nouveaux cas",
    inReview: "En revue",
    unclaimedCases: "Non réclamés",
    allStatuses: "Tous les statuts",
    new: "Nouveau",
    underReview: "En revue",
    resolved: "Résolu",
    refresh: "Rafraîchir",
    noCases: "Aucun cas trouvé",
    noMyCases: "Vous n'avez pas encore de cas assignés.",
    noUnclaimed: "Tous les cas ont été réclamés.",
    claim: "Réclamer",
    viewDetails: "Voir les détails",
    nationalDashboard: "Tableau de bord national",
    evidenceInsights: "Aperçus fondés sur des preuves pour les décideurs politiques",
    totalReports: "Total des rapports soumis",
    escalatedToCounselors: "escaladés aux conseillers",
    highSeverity: "Haute gravité",
    referrals: "Referrals",
    avgResponse: "Temps de réponse moyen",
    bySeverity: "Par gravité",
    byCategory: "Par catégorie",
    byDistrict: "Par district",
    referralStatus: "Statut des referrals",
    monthlyTrend: "Tendance mensuelle",
    dataSummary: "Résumé des données",
    dataSummaryText: "Ce tableau de bord fournit un aperçu de tous les rapports soumis via Mlinzi. Les données sont mises à jour en temps réel. Toutes les données sont anonymes et agrégées pour protéger la vie privée des enfants.",
    safetyAdvice: "CONSEILS DE SÉCURITÉ",
    safetyTip1: "Ne répondez pas au message nocif",
    safetyTip2: "Bloquez la personne qui l'envoie",
    safetyTip3: "Prenez une capture d'écran comme preuve",
    safetyTip4: "Parlez-en à un adulte de confiance",
    safetyTip5: "Vous n'êtes pas seul - de l'aide est disponible",
    accessibility: "Accessibilité",
    highContrast: "Contraste élevé",
    largeText: "Grand texte",
    language: "Langue",
  },
  rw: {
    home: "Ahabanza",
    reportAbuse: "Menya ikibazo",
    login: "Injira",
    logout: "Sohoka",
    cases: "Ibyiciro",
    analytics: "Isesengura",
    admin: "Umuyobozi",
    heroTitle: "Kurinda abana kuri internet",
    heroSubtitle: "Mlinzi yobora abana mu Rwanda gutangaza uburundi bwo kuri internet kandi bakabona ubufasha neza.",
    reportNow: "Menya ikibazo",
    howItWorks: "Uburyo bikorwa",
    step1Title: "Kubika",
    step1Desc: "Fota urupapuro rwoherejwe",
    step2Title: "Kugereranya",
    step2Desc: "AI yacu irasuzuma niba ari ibibazo",
    step3Title: "Kurinda",
    step3Desc: "Shakisha ubufasha utandukane",
    safetyMessage: "Uhumyunyu bwawe bwambere. Ntawari wenyine.",
    analysisResults: "Ibipimo vy'isesengura",
    riskLevel: "Urwego rwo kutera inkunga",
    confidence: "Ishimwe",
    category: "Urwego",
    whatToDo: "Iyo ushobora gukora",
    extractedText: "Inyandiko yakusenywe",
    counselorHelp: "Ushaka ubufasha bwa muganga?",
    stayAnonymous: "Guma utitazwe",
    connectCounselor: "Ndi mu muganga",
    reportAnother: "Menya undi",
    backToHome: "Subira ahabanza",
    thankYou: "Urakoze gutangaza. Rapporto yawe yobora abana abandi.",
    district: "Akarike",
    selectDomain: "Hitamwo akarike yawe",
    preferredContact: "Uburyo bwo gutumiza ubutumwa",
    phoneCall: "Itariki",
    sms: "SMS",
    whatsapp: "WhatsApp",
    email: "Email",
    bestTime: "Igihe gitandukanye",
    bestTimePlaceholder: "urugero: Mu gitondo, Nyuma y'isomo",
    areSafe: "Uri mu buzima neza ubu?",
    submitReferral: "Ohereza rapporto",
    contactEncrypted: "Amakuru yawe afite uburindi kandi ategerezwa muganga wemewe gusa.",
  },
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "rw", label: "Kinyarwanda" },
];

export function AccessibilityProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("mlinzi_lang") || "en";
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("mlinzi_contrast") === "true";
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem("mlinzi_largetext") === "true";
  });

  useEffect(() => {
    localStorage.setItem("mlinzi_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("mlinzi_contrast", highContrast);
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("mlinzi_largetext", largeText);
    document.documentElement.classList.toggle("large-text", largeText);
  }, [largeText]);

  function t(key) {
    return translations[language]?.[key] || translations.en[key] || key;
  }

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        t,
        languages: LANGUAGES,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
