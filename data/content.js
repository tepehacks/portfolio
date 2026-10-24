// =====================================================================
//  TOUT LE CONTENU DU PORTFOLIO EST ICI.
//  Pour modifier le site, change seulement ce fichier.
//  Chaque texte existe en deux langues : { fr: "...", en: "..." }
// =====================================================================

window.CONTENT = {
  profile: {
    name: "Pierre-Alexandre Tepe",
    role: {
      fr: "Étudiant ingénieur en informatique · ESILV",
      en: "Computer Science engineering student · ESILV"
    },
    bio: {
      fr: "Passionné par le développement d'applications web, les algorithmes et les mathématiques appliquées. Curieux, rigoureux et déterminé à exceller dans l'informatique.",
      en: "Passionate about web application development, algorithms and applied mathematics. Curious, rigorous and determined to excel in computer science."
    },
    email: "tepe.pierrealexandre@gmail.com",
    github: "https://github.com/tepehacks",
    linkedin: "#", // TODO : colle ici l'URL de ton profil LinkedIn
    cv: "assets/cv.pdf"
  },

  // ---------------------------------------------------------------
  //  PROJETS EN VITRINE
  //  status : "done" | "wip" | "soon"   (badge affiché sur la carte)
  //  statusLabel : texte du badge à la place du statut (optionnel)
  //  demo   : aperçu animé, défini dans js/demos.js
  //           (garoit | taskly | kedzi | tvdisplay | gestion | intopdf | seloger)
  //  repo   : lien GitHub (laisser "" si le dépôt est privé)
  //  link   : lien vers le site en ligne (optionnel)
  //  featured : true = grande carte mise en avant
  // ---------------------------------------------------------------
  projects: [
    {
      name: "Gar'Oit",
      featured: true,
      status: "done",
      statusLabel: { fr: "Projet fil rouge", en: "Capstone project" },
      demo: "garoit",
      description: {
        fr: "Site de réservation de places de parking : carte interactive, tickets à l'heure, à la semaine ou au mois, comptes sécurisés (JWT) et espace admin avec statistiques. Relié à une maquette Arduino : capteurs infrarouges, barrière motorisée et écrans LCD qui affichent les places libres.",
        en: "Parking booking website: interactive map, hourly/weekly/monthly tickets, secure accounts (JWT) and an admin area with stats. Connected to an Arduino model: infrared sensors, motorised barrier and LCD screens showing free spots."
      },
      stack: ["JavaScript", "Node.js", "Express", "MySQL", "Leaflet", "Arduino"],
      repo: "",
      link: ""
    },
    {
      name: "Taskly",
      status: "done",
      demo: "taskly",
      description: {
        fr: "Gestionnaire de tâches collaboratif : tableaux kanban par projet, équipes et droits par membre, invitations par e-mail, commentaires et fichiers, archive quotidienne des tâches terminées avec export Excel, historique des actions et un agent IA qui clarifie les tâches.",
        en: "Collaborative task manager: kanban boards per project, teams and per-member permissions, email invitations, comments and files, daily archive of completed tasks with Excel export, action history and an AI agent that clarifies tasks."
      },
      stack: ["Python", "Django", "PostgreSQL", "JavaScript", "IA"],
      repo: "",
      link: ""
    },
    {
      name: "Kédzi",
      status: "wip",
      demo: "kedzi",
      description: {
        fr: "Plateforme de petites annonces au Togo : annonces avec photos, messagerie, offres de prix, rendez-vous, avis et score de confiance des vendeurs, signalements. Déployée avec Docker.",
        en: "Classifieds marketplace in Togo: listings with photos, messaging, price offers, appointments, reviews and seller trust scores, reporting. Deployed with Docker."
      },
      stack: ["Python", "Django", "Docker", "JavaScript"],
      repo: "",
      link: ""
    },
    {
      name: "TV Display",
      status: "done",
      demo: "tvdisplay",
      description: {
        fr: "Écran d'affichage pour la télé des locaux : planning de la semaine de toute l'équipe qui défile en continu (présentiel, télétravail, congés, école), anniversaires, annonces défilantes, absences de la semaine suivante et accueil personnalisé des visiteurs.",
        en: "Office TV display: the whole team's weekly schedule scrolling continuously (on-site, remote, leave, school), birthdays, scrolling announcements, next week's absences and a personalised visitor welcome."
      },
      stack: ["Python", "Django", "JavaScript", "PostgreSQL"],
      repo: "",
      link: ""
    },
    {
      name: "Gestion RH",
      status: "wip",
      statusLabel: { fr: "En amélioration", en: "Being improved" },
      demo: "gestion",
      description: {
        fr: "Application RH : employés, services et postes, plannings avec calcul automatique des heures travaillées (pauses déduites), absences à la journée ou à la demi-journée, filtres par période et accès limité de chaque employé à ses propres données.",
        en: "HR app: employees, departments and positions, schedules with automatic worked-hours calculation (breaks deducted), full or half-day absences, date-range filters, and each employee only sees their own data."
      },
      stack: ["Python", "Django", "SQL", "Jazzmin"],
      repo: "",
      link: ""
    },
    {
      name: "Into PDF",
      status: "done",
      demo: "intopdf",
      description: {
        fr: "Application de bureau qui convertit Word, Excel, PowerPoint, images et textes en PDF, en glisser-déposer. 100 % local : aucun fichier n'est envoyé en ligne. Windows et Mac.",
        en: "Desktop app that converts Word, Excel, PowerPoint, images and text files to PDF with drag & drop. 100% local: nothing is uploaded. Windows and Mac."
      },
      stack: ["Python", "VBScript", "Shell"],
      repo: "https://github.com/tepehacks/into_pdf",
      link: ""
    },
    {
      name: "Bot SeLoger",
      status: "wip",
      statusLabel: { fr: "Interface à venir", en: "UI coming soon" },
      demo: "seloger",
      description: {
        fr: "Bot qui automatise la recherche d'annonces SeLoger et l'envoi des messages de contact : collecte avec Selenium, extraction en parallèle, suivi des annonces contactées dans Excel.",
        en: "Bot that automates SeLoger listing searches and contact messages: Selenium scraping, parallel parsing, and tracking of contacted listings in Excel."
      },
      stack: ["Python", "Selenium", "BeautifulSoup"],
      repo: "https://github.com/tepehacks/bot_seloger1",
      link: ""
    }
  ],

  // ---------------------------------------------------------------
  //  LA MONTAGNE
  //  goal : le drapeau AU-DESSUS du personnage (ce que tu cherches)
  //  experiences : du PLUS ANCIEN au PLUS RÉCENT (bas → haut)
  //  Quand tu trouves ton alternance : ajoute-la à la fin de la liste
  //  et change le texte de "goal".
  // ---------------------------------------------------------------
  climb: {
    goal: {
      short: { fr: "Alternance Software Eng. / Data", en: "Work-study Software Eng. / Data" },
      when: { fr: "Octobre 2027", en: "October 2027" },
      title: { fr: "À la recherche d'une alternance : Software Engineering ou Data Analyst", en: "Looking for a work-study position: Software Engineering or Data Analyst" },
      details: {
        fr: "En software engineering ou en data analyse, à partir d'octobre 2027.",
        en: "In software engineering or data analysis, starting October 2027."
      }
    },
    experiences: [
      {
        company: "ALLTOO",
        role: { fr: "Volontaire · Développeur", en: "Volunteer · Developer" },
        dates: { fr: "Oct. 2024 – Mai 2025", en: "Oct 2024 – May 2025" },
        summary: {
          fr: "Conception et développement complet d'une plateforme RH : CRM en Python/Django et dashboards interactifs en JavaScript pour automatiser les processus RH.",
          en: "Designed and built a full HR platform: a Python/Django CRM and interactive JavaScript dashboards to automate HR processes."
        },
        stack: ["Python", "Django", "JavaScript"]
      },
      {
        company: "TRUSTIA",
        role: { fr: "Stagiaire Développeur Full-Stack", en: "Full-Stack Developer Intern" },
        dates: { fr: "Mai 2026 – Août 2026", en: "May 2026 – Aug 2026" },
        summary: {
          fr: "Application d'automatisation des dossiers d'entreprises du secteur électrique, et conception d'une IA de vérification.",
          en: "Built an app automating company files for the electrical sector, and designed a verification AI."
        },
        stack: ["JavaScript", "Python", "Django", "IA"]
      }
    ]
  },

  // ---------------------------------------------------------------
  //  FORMATION (du plus récent au plus ancien)
  // ---------------------------------------------------------------
  education: [
    {
      degree: { fr: "Bachelor Ingénierie et Numérique", en: "Bachelor in Engineering & Digital Technology" },
      school: "ESILV — École Supérieure d'Ingénieurs Léonard-de-Vinci",
      dates: { fr: "2025 – en cours", en: "2025 – present" },
      details: {
        fr: "Informatique, mathématiques et systèmes numériques.",
        en: "Computer science, mathematics and digital systems."
      }
    },
    {
      degree: { fr: "Double diplôme Ingénierie Digitale et Management", en: "Dual degree in Digital Engineering & Management" },
      school: "UTC Compiègne & EDHEC Business School Lille",
      dates: { fr: "2023 – 2024", en: "2023 – 2024" },
      details: {
        fr: "1ʳᵉ année du double diplôme UTC × EDHEC.",
        en: "First year of the UTC × EDHEC dual degree."
      }
    },
    {
      degree: { fr: "Baccalauréat général", en: "French Baccalaureate" },
      school: "Lycée Saint-Vincent de Paul",
      dates: { fr: "2019 – 2022", en: "2019 – 2022" },
      details: {
        fr: "Spécialités Mathématiques, Physique-Chimie et SES · mention Assez Bien.",
        en: "Majors in Mathematics, Physics-Chemistry and Economics · with honours."
      }
    }
  ],

  skills: ["Python", "Django", "JavaScript", "SQL", "C", "PHP", "Git"],

  languages: [
    { name: { fr: "Français", en: "French" }, level: { fr: "Langue maternelle", en: "Native" } },
    { name: { fr: "Anglais", en: "English" }, level: { fr: "C2 · bilingue", en: "C2 · fluent" } }
  ],

  interests: [
    { name: { fr: "Mathématiques", en: "Mathematics" }, text: { fr: "Une passion depuis tout petit, présente tout au long de mon parcours.", en: "A passion since childhood, all along my studies." } },
    { name: { fr: "Football", en: "Football" }, text: { fr: "3ᵉ tour de Coupe de France Seniors.", en: "3rd round of the French Cup (Seniors)." } },
    { name: { fr: "Lecture", en: "Reading" }, text: { fr: "Je lis souvent avant de dormir.", en: "I often read before going to sleep." } }
  ]
};

// Textes fixes de l'interface
window.UI = {
  fr: {
    navProjects: "Projets", navClimb: "Parcours", navEducation: "Formation", navContact: "Contact",
    open: "À la recherche d'une alternance",
    seeProjects: "Voir mes projets", downloadCv: "Télécharger mon CV",
    projectsTitle: "Projets", projectsLead: "Une sélection de ce que j'ai construit.",
    climbTitle: "À l'ascension de Mont Alternance", climbLead: "Mon parcours professionnel, camp après camp.",
    educationTitle: "Formation", skillsTitle: "Compétences", languagesTitle: "Langues", interestsTitle: "À côté du code",
    contactTitle: "On en parle ? Contactez-moi", contactLead: "Je cherche une alternance en software engineering ou en data analyse à partir d'octobre 2027. Écris-moi, je réponds vite.",
    code: "Code", live: "Voir le site", private: "Dépôt privé",
    status: { done: "Terminé", wip: "En cours", soon: "Bientôt" },
    contactMe: "Me contacter", youAreHere: "Moi, aujourd'hui", prev: "Projet précédent", next: "Projet suivant",
    footer: "Hébergé sur GitHub Pages."
  },
  en: {
    navProjects: "Projects", navClimb: "Journey", navEducation: "Education", navContact: "Contact",
    open: "Looking for a work-study position",
    seeProjects: "See my projects", downloadCv: "Download my CV",
    projectsTitle: "Projects", projectsLead: "A selection of things I've built.",
    climbTitle: "Climbing Mount Work-Study", climbLead: "My professional journey, camp after camp.",
    educationTitle: "Education", skillsTitle: "Skills", languagesTitle: "Languages", interestsTitle: "Beyond code",
    contactTitle: "Let's talk? Contact me", contactLead: "I'm looking for a work-study position in software engineering or data analysis starting October 2027. Drop me a line, I reply fast.",
    code: "Code", live: "Live site", private: "Private repo",
    status: { done: "Done", wip: "In progress", soon: "Soon" },
    contactMe: "Contact me", youAreHere: "Me, today", prev: "Previous project", next: "Next project",
    footer: "Hosted on GitHub Pages."
  }
};
