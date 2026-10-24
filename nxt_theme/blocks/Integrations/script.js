(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم التكاملات — ERPNext Workspace
   * ══════════════════════════════════════════
   *
   *  بطاقات التكاملات + توضيح + الفوتر.
   *  بدون إحصائيات وبدون أزرار اختصار.
   */


  /* ─────────────────────────────────────────
     ١. عناصر لوحة التحكم من HTML
  ───────────────────────────────────────── */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;


  /* ─────────────────────────────────────────
     ٢. معرفة لغة المستخدم الحالية
  ───────────────────────────────────────── */

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang ||
    "en";

  const isArabic = String(langValue).toLowerCase().startsWith("ar");


  /* ─────────────────────────────────────────
     ٣. إعدادات الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "0115110455",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneEn: "Phone",
      phoneAr: "الهاتف الموحد",
      emailEn: "Email",
      emailAr: "البريد الإلكتروني",
      websiteEn: "Website",
      websiteAr: "الموقع"
    }
  };


  /* ─────────────────────────────────────────
     ٤. بطاقات التكاملات
     (مطابقة للشاشة الفعلية)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Integrations",
      [
        [
          "Backup",
          "💾",
          [
            "Dropbox Settings",
            "S3 Backup Settings",
            "Google Drive"
          ]
        ],

        [
          "Google Services",
          "🔗",
          [
            "Google Settings",
            "Google Contacts",
            "Google Calendar",
            "Google Drive"
          ]
        ],

        [
          "Authentication",
          "🔐",
          [
            "Social Login Key",
            "LDAP Settings",
            "OAuth Client",
            "OAuth Provider Settings"
          ]
        ],

        [
          "Settings",
          "⚙️",
          [
            "Webhook",
            "Slack Webhook URL",
            "SMS Settings"
          ]
        ],

        [
          "Push Notifications",
          "🔔",
          [
            "Push Notification Settings"
          ]
        ]
      ]
    ]
  ];


  /* ─────────────────────────────────────────
     ٥. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Integrations": "التكاملات",

    "Backup": "النسخ الاحتياطي",
    "Dropbox Settings": "إعدادات Dropbox",
    "S3 Backup Settings": "إعدادات النسخ الاحتياطي S3",
    "Google Drive": "جوجل درايف",

    "Google Services": "خدمات جوجل",
    "Google Settings": "إعدادات جوجل",
    "Google Contacts": "جهات اتصال جوجل",
    "Google Calendar": "تقويم جوجل",

    "Authentication": "المصادقة",
    "Social Login Key": "مفتاح تسجيل الدخول الاجتماعي",
    "LDAP Settings": "إعدادات LDAP",
    "OAuth Client": "عميل OAuth",
    "OAuth Provider Settings": "إعدادات مزود OAuth",

    "Settings": "الإعدادات",
    "Webhook": "ويب هوك",
    "Slack Webhook URL": "رابط ويب هوك Slack",
    "SMS Settings": "إعدادات الرسائل القصيرة",

    "Push Notifications": "الإشعارات الفورية",
    "Push Notification Settings": "إعدادات الإشعارات الفورية"
  };


  /* ─────────────────────────────────────────
     ٦. المستندات التي تفتح كنموذج إعدادات
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Dropbox Settings",
    "S3 Backup Settings",
    "Google Settings",
    "LDAP Settings",
    "OAuth Provider Settings",
    "SMS Settings",
    "Slack Webhook URL",
    "Push Notification Settings"
  ]);

  const reportNames = new Set([]);


  /* ─────────────────────────────────────────
     ٧. أوصاف العناصر (توضيح فقط — بدون خطوات)
  ───────────────────────────────────────── */

  const itemDescriptions = {

    /* ═══ النسخ الاحتياطي ═══ */

    "Dropbox Settings": {
      icon: "📦",
      summaryAr:
        "إعداد النسخ الاحتياطي التلقائي لقاعدة البيانات والملفات إلى حساب Dropbox.",
      summaryEn:
        "Configure automatic database and file backups to a Dropbox account."
    },

    "S3 Backup Settings": {
      icon: "☁️",
      summaryAr:
        "إعداد النسخ الاحتياطي التلقائي إلى خدمة Amazon S3 أو أي خدمة متوافقة مع بروتوكول S3.",
      summaryEn:
        "Configure automatic backups to Amazon S3 or any S3-compatible storage service."
    },

    "Google Drive": {
      icon: "📁",
      summaryAr:
        "ربط النظام بحساب Google Drive لتخزين النسخ الاحتياطية أو مزامنة الملفات تلقائياً.",
      summaryEn:
        "Connect to a Google Drive account for storing backups or automatically syncing files."
    },

    /* ═══ خدمات جوجل ═══ */

    "Google Settings": {
      icon: "⚙️",
      summaryAr:
        "الإعدادات الرئيسية لربط ERPNext بخدمات Google مثل مفاتيح API ومعرفات التطبيق.",
      summaryEn:
        "Main settings for connecting ERPNext to Google services including API keys and application IDs."
    },

    "Google Contacts": {
      icon: "👤",
      summaryAr:
        "مزامنة جهات الاتصال بين ERPNext وحساب Google Contacts بشكل تلقائي ثنائي الاتجاه.",
      summaryEn:
        "Automatically sync contacts between ERPNext and Google Contacts bidirectionally."
    },

    "Google Calendar": {
      icon: "📅",
      summaryAr:
        "مزامنة الأحداث والمواعيد بين ERPNext وتقويم Google بشكل تلقائي.",
      summaryEn:
        "Automatically sync events and appointments between ERPNext and Google Calendar."
    },

    /* ═══ المصادقة ═══ */

    "Social Login Key": {
      icon: "🌐",
      summaryAr:
        "إعداد مفاتيح تسجيل الدخول عبر حسابات التواصل الاجتماعي مثل Google و Facebook و GitHub.",
      summaryEn:
        "Configure login keys for social accounts like Google, Facebook, and GitHub."
    },

    "LDAP Settings": {
      icon: "🏢",
      summaryAr:
        "ربط النظام بخادم LDAP (مثل Active Directory) للمصادقة المركزية وإدارة المستخدمين.",
      summaryEn:
        "Connect the system to an LDAP server (e.g., Active Directory) for centralized authentication and user management."
    },

    "OAuth Client": {
      icon: "🔑",
      summaryAr:
        "إنشاء وإدارة تطبيقات OAuth التي تسمح للأنظمة الخارجية بالوصول إلى بيانات ERPNext بشكل آمن.",
      summaryEn:
        "Create and manage OAuth applications that allow external systems to securely access ERPNext data."
    },

    "OAuth Provider Settings": {
      icon: "🛡️",
      summaryAr:
        "إعدادات ERPNext كمزود OAuth لتمكين الأنظمة الخارجية من المصادقة عبر حسابات ERPNext.",
      summaryEn:
        "Configure ERPNext as an OAuth provider to enable external systems to authenticate via ERPNext accounts."
    },

    /* ═══ الإعدادات ═══ */

    "Webhook": {
      icon: "🔔",
      summaryAr:
        "إنشاء إشعارات ويب هوك لإرسال بيانات تلقائياً إلى أنظمة خارجية عند حدوث أحداث معينة في ERPNext.",
      summaryEn:
        "Create webhooks to automatically send data to external systems when specific events occur in ERPNext."
    },

    "Slack Webhook URL": {
      icon: "💬",
      summaryAr:
        "ربط ERPNext بقنوات Slack لإرسال إشعارات وتنبيهات تلقائية عند حدوث أحداث معينة.",
      summaryEn:
        "Connect ERPNext to Slack channels for sending automatic notifications and alerts on specific events."
    },

    "SMS Settings": {
      icon: "📱",
      summaryAr:
        "إعداد بوابة الرسائل القصيرة (SMS Gateway) لإرسال رسائل نصية تلقائية من النظام.",
      summaryEn:
        "Configure SMS Gateway settings for sending automated text messages from the system."
    },

    /* ═══ الإشعارات الفورية ═══ */

    "Push Notification Settings": {
      icon: "📲",
      summaryAr:
        "إعداد الإشعارات الفورية (Push Notifications) لإرسال تنبيهات مباشرة إلى متصفحات وأجهزة المستخدمين.",
      summaryEn:
        "Configure push notifications to send real-time alerts to users' browsers and devices."
    }
  };


  /* ─────────────────────────────────────────
     ٨. دوال مساعدة
  ───────────────────────────────────────── */

  function translate(name) {
    if (!isArabic) return name;
    if (arabicFallback[name]) return arabicFallback[name];
    if (typeof window.__ === "function") return window.__(name);
    return name;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  /* ─────────────────────────────────────────
     ٩. مربع التفاصيل (Modal)
  ───────────────────────────────────────── */

  function showInfoModal(data) {
    const title = isArabic ? data.labelAr : data.labelEn;
    const summary = isArabic ? data.summaryAr : data.summaryEn;
    const steps = isArabic ? data.stepsAr : data.stepsEn;
    const hasSteps = Array.isArray(steps) && steps.length > 0;

    const showStepsText = isArabic ? "📖 عرض الخطوات" : "📖 Show Steps";
    const hideStepsText = isArabic ? "📖 إخفاء الخطوات" : "📖 Hide Steps";

    let stepsHtml = "";
    if (hasSteps) {
      stepsHtml = `
        <div class="erp-modal-steps" data-modal-steps>
          <ol class="erp-modal-steps-list">
            ${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>
      `;
    }

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="Close">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${data.icon}</span>
          <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
        </div>
        <p class="erp-modal-summary">${escapeHtml(summary)}</p>
        ${hasSteps ? `<button type="button" class="erp-modal-toggle-steps" data-toggle-steps>${showStepsText}</button>` : ""}
        ${stepsHtml}
      </div>
    `;

    root.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    function closeModal() {
      overlay.classList.remove("is-visible");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    }

    overlay.querySelector("[data-modal-close]").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

    const toggleBtn = overlay.querySelector("[data-toggle-steps]");
    const stepsContainer = overlay.querySelector("[data-modal-steps]");

    if (toggleBtn && stepsContainer) {
      toggleBtn.addEventListener("click", () => {
        const isShowing = stepsContainer.classList.contains("is-shown");
        if (isShowing) {
          stepsContainer.classList.remove("is-shown");
          toggleBtn.textContent = showStepsText;
        } else {
          stepsContainer.classList.add("is-shown");
          toggleBtn.textContent = hideStepsText;
        }
      });
    }
  }


  /* ─────────────────────────────────────────
     ١٠. إنشاء بطاقات التكاملات
  ───────────────────────────────────────── */

  function renderSections() {
    root.setAttribute("dir", isArabic ? "rtl" : "ltr");
    root.classList.toggle("erp-dashboard-rtl", isArabic);

    content.innerHTML = sections
      .map((section, sectionIndex) => {
        const sectionName = section[0];
        const sectionCards = section[1];

        const cardsHtml = sectionCards
          .map((card, cardIndex) => {
            const cardName = card[0];
            const icon = card[1];
            const items = card[2];

            const linksHtml = items
              .map((itemName) => {
                const desc = itemDescriptions[itemName];
                const detailsLabel = isArabic ? "تفاصيل" : "Details";
                const infoBtn = desc
                  ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(itemName)}">${detailsLabel}</button>`
                  : "";

                return `
                  <div class="erp-link-row">
                    <button type="button" class="erp-link" data-route-name="${escapeHtml(itemName)}">
                      <span class="erp-link-text">${escapeHtml(translate(itemName))}</span>
                      <span class="erp-link-arrow" aria-hidden="true">${isArabic ? "←" : "→"}</span>
                    </button>
                    ${infoBtn}
                  </div>
                `;
              })
              .join("");

            return `
              <article class="erp-card tone-${(sectionIndex + cardIndex) % 5}" data-erp-card>
                <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="false">
                  <span class="erp-icon" aria-hidden="true">${icon}</span>
                  <span class="erp-card-title">${escapeHtml(translate(cardName))}</span>
                  <span class="erp-card-chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="erp-card-links">${linksHtml}</div>
              </article>
            `;
          })
          .join("");

        return `
          <section class="erp-module-section">
            <h2 class="erp-section-title">${escapeHtml(translate(sectionName))}</h2>
            <div class="erp-dashboard-grid">${cardsHtml}</div>
          </section>
        `;
      })
      .join("");
  }


  /* ─────────────────────────────────────────
     ١١. إنشاء الفوتر
  ───────────────────────────────────────── */

  function renderFooter() {
    if (!footerEl) return;

    const labels = footerInfo.labels;
    const phoneLabel = isArabic ? labels.phoneAr : labels.phoneEn;
    const emailLabel = isArabic ? labels.emailAr : labels.emailEn;
    const websiteLabel = isArabic ? labels.websiteAr : labels.websiteEn;

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="tel:${footerInfo.phone}" class="erp-footer-link" dir="ltr">${escapeHtml(footerInfo.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerInfo.email}" class="erp-footer-link">${escapeHtml(footerInfo.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerInfo.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerInfo.website)}</a>
        </div>
      </div>
    `;
  }


  /* ─────────────────────────────────────────
     ١٢. فتح الخيار داخل ERPNext
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;

    if (reportNames.has(name)) {
      frappe.set_route("query-report", name);
      return;
    }

    if (singleDocs.has(name)) {
      frappe.set_route("Form", name);
      return;
    }

    frappe.set_route("List", name);
  }


  /* ─────────────────────────────────────────
     ١٣. أحداث الضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", (event) => {
    /* ① زر "تفاصيل" */
    const infoBtn = event.target.closest("[data-info-item]");
    if (infoBtn) {
      event.preventDefault();
      event.stopPropagation();
      const itemName = infoBtn.dataset.infoItem;
      const desc = itemDescriptions[itemName];
      if (desc) {
        showInfoModal({
          icon: desc.icon || "📄",
          labelAr: translate(itemName),
          labelEn: itemName,
          summaryAr: desc.summaryAr,
          summaryEn: desc.summaryEn,
          stepsAr: desc.stepsAr,
          stepsEn: desc.stepsEn
        });
      }
      return;
    }

    /* ② رابط خيار */
    const routeButton = event.target.closest("[data-route-name]");
    if (routeButton) {
      event.preventDefault();
      event.stopPropagation();
      openRoute(routeButton.dataset.routeName);
      return;
    }

    /* ③ عنوان البطاقة */
    const cardButton = event.target.closest("[data-card-toggle]");
    if (!cardButton) return;

    const now = Date.now();
    if (now - lastToggleTime < 400) return;
    lastToggleTime = now;

    const selectedCard = cardButton.closest("[data-erp-card]");
    if (!selectedCard) return;

    const shouldOpen = !selectedCard.classList.contains("is-open");

    content.querySelectorAll("[data-erp-card]").forEach((card) => {
      if (card !== selectedCard) {
        card.classList.remove("is-open");
        card.querySelector("[data-card-toggle]")?.setAttribute("aria-expanded", "false");
      }
    });

    if (shouldOpen) {
      selectedCard.classList.add("is-open");
      cardButton.setAttribute("aria-expanded", "true");
    } else {
      selectedCard.classList.remove("is-open");
      cardButton.setAttribute("aria-expanded", "false");
    }
  });


  /* ─────────────────────────────────────────
     ١٤. تشغيل
  ───────────────────────────────────────── */

  renderSections();
  renderFooter();
})();
