(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم تكاملات ERPNext — ERPNext Integrations
   * ══════════════════════════════════════════
   */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang || "en";

  const isArabic = String(langValue).toLowerCase().startsWith("ar");

  /* ─────────────────────────────────────────
     ١. أزرار الوصول السريع (Browse Apps)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "Browse Apps", labelAr: "تصفح التطبيقات", route: "apps", color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Integrations",
      [
        [
          "Authentication",
          "🔐",
          [
            "Social Login",
            "LDAP Settings",
            "OAuth Client",
            "OAuth Provider Settings"
          ]
        ],
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
          "Communication Channels",
          "📡",
          [
            "Webhook",
            "SMS Settings",
            "Slack Webhook URL"
          ]
        ],
        [
          "Payments",
          "💳",
          [
            "Plaid Settings"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "LDAP Settings",
    "OAuth Provider Settings",
    "Dropbox Settings",
    "S3 Backup Settings",
    "Google Settings",
    "SMS Settings",
    "Slack Webhook URL",
    "Plaid Settings"
  ]);

  const treeDocs = new Set([]);

  // لا توجد تقارير في هذا القسم
  const reportNames = new Set([]);

  const customRoutes = {
    "Browse Apps": ["apps"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Integrations": "التكاملات",
    "Browse Apps": "تصفح التطبيقات",

    "Authentication": "المصادقة",
    "Social Login": "تسجيل الدخول الاجتماعي",
    "LDAP Settings": "إعدادات LDAP",
    "OAuth Client": "عميل OAuth",
    "OAuth Provider Settings": "إعدادات مزود OAuth",

    "Backup": "النسخ الاحتياطي",
    "Dropbox Settings": "إعدادات Dropbox",
    "S3 Backup Settings": "إعدادات النسخ الاحتياطي S3",
    "Google Drive": "جوجل درايف",

    "Google Services": "خدمات جوجل",
    "Google Settings": "إعدادات جوجل",
    "Google Contacts": "جهات اتصال جوجل",
    "Google Calendar": "تقويم جوجل",

    "Communication Channels": "قنوات الاتصال",
    "Webhook": "ويب هوك",
    "SMS Settings": "إعدادات الرسائل القصيرة",
    "Slack Webhook URL": "رابط ويب هوك Slack",

    "Payments": "المدفوعات",
    "Plaid Settings": "إعدادات Plaid"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Social Login": {
      icon: "🌐",
      summaryAr: "تفعيل تسجيل الدخول الموحد عبر حسابات التواصل الاجتماعي مثل Google وFacebook وGitHub وApple للمستخدمين.",
      summaryEn: "Enable unified single sign-on via social accounts like Google, Facebook, GitHub, and Apple for users.",
      stepsAr: ["اختيار موفر تسجيل الدخول المطلوب تفعيله", "إدخال معرف العميل (Client ID) والمفتاح السري", "تفعيل الموفر وحفظ الإعدادات لتمكين الدخول عبره"],
      stepsEn: ["Select social login provider to enable", "Enter Client ID and Client Secret credentials", "Enable provider and save to allow user login"]
    },
    "LDAP Settings": {
      icon: "🏢",
      summaryAr: "ربط النظام بخادم الدليل النشط LDAP / Active Directory للمصادقة المركزية وإدارة هويات مستخدمي المنشأة.",
      summaryEn: "Connect ERPNext to corporate LDAP / Active Directory server for centralized identity and user authentication.",
      stepsAr: ["إدخال عنوان خادم LDAP ومنفذ الاتصال المشفر SSL/TLS", "تحديد المسار الأساسي Base DN وبيانات حساب المدير", "اختبار الاتصال بالخادم وحفظ وتفعيل المصادقة المركزية"],
      stepsEn: ["Enter LDAP server URL and secure SSL/TLS port", "Define Base DN and admin binding credentials", "Test connection and save to enforce centralized login"]
    },
    "OAuth Client": {
      icon: "🔑",
      summaryAr: "إنشاء وإدارة بيانات اعتماد تطبيقات OAuth التي تسمح للأنظمة والخدمات الخارجية بالوصول لبيانات النظام بأمان.",
      summaryEn: "Generate and manage OAuth application credentials allowing external services secure API access to ERPNext.",
      stepsAr: ["إنشاء تطبيق OAuth جديد وتحديد اسم المنظومة الخارجية", "تحديد نوع الترخيص وروابط إعادة التوجيه Redirect URIs", "توليد معرف العميل والمفتاح السري واعتماد الصلاحيات المسموحة"],
      stepsEn: ["Create new OAuth application and designate system name", "Set grant type and authorized Redirect URIs", "Generate Client ID and Secret and define permission scopes"]
    },
    "OAuth Provider Settings": {
      icon: "🛡️",
      summaryAr: "إعدادات ERPNext كمزود رئيسي للهوية OAuth Provider لتمكين التطبيقات الخارجية من التحقق من المستخدمين.",
      summaryEn: "Configure ERPNext as a primary OAuth identity provider to let external applications authenticate users.",
      stepsAr: ["ضبط مدة صلاحية رموز الوصول (Access Tokens) ورموز التحديث", "تحديد نطاقات الصلاحيات الافتراضية الممنوحة للمستخدمين", "حفظ الإعدادات لتفعيل مزود الهوية الموحد"],
      stepsEn: ["Configure access token and refresh token expiry durations", "Define default identity scopes granted to users", "Save settings to activate OAuth identity server"]
    },

    "Dropbox Settings": {
      icon: "📦",
      summaryAr: "جدولة وتفعيل النسخ الاحتياطي التلقائي لقاعدة بيانات النظام والملفات المرفقة مباشرة إلى حساب Dropbox.",
      summaryEn: "Automate and schedule scheduled database and attached file backups directly to a corporate Dropbox account.",
      stepsAr: ["توليد رمز المصادقة من حساب Dropbox الخاص بالمنشأة", "تحديد تكرار النسخ الاحتياطي (يومي، أسبوعي) ومجلد الحفظ", "إجراء اختبار نسخ احتياطي تجريبي وحفظ الإعدادات"],
      stepsEn: ["Generate authorization access token from Dropbox account", "Set backup frequency (daily, weekly) and target folder", "Trigger test backup and save configuration"]
    },
    "S3 Backup Settings": {
      icon: "☁️",
      summaryAr: "أتمتة النسخ الاحتياطي المتقدم إلى خدمات التخزين السحابي Amazon S3 أو أي خادم متوافق مع بروتوكول S3.",
      summaryEn: "Advanced automated backups to Amazon Web Services (AWS) S3 bucket or any S3-compatible cloud storage.",
      stepsAr: ["إدخال مفتاح الوصول السري Access Key و Secret Key وحاوية S3 Bucket", "تحديد نقطة النهاية السحابية Endpoint والمنطقة الجغرافية", "اختبار رفع نسخة احتياطية وحفظ الإعدادات"],
      stepsEn: ["Enter AWS S3 Access Key, Secret Key, and target bucket name", "Specify cloud regional endpoint coordinates", "Test backup upload and save configuration"]
    },
    "Google Drive": {
      icon: "📁",
      summaryAr: "ربط النظام بحساب Google Drive لتخزين ومزامنة ملفات النسخ الاحتياطي والمستندات السحابية تلقائياً.",
      summaryEn: "Connect system to Google Drive to store scheduled system backups and synchronize cloud attachments.",
      stepsAr: ["ربط الحساب وتأكيد إذن الوصول إلى Google Drive", "تحديد تكرار النسخ الاحتياطي ومجلد الوجهة السحابي", "حفظ الإعدادات وتأكيد سريان المزامنة"],
      stepsEn: ["Authorize connection and grant Google Drive storage access", "Set sync frequency and target remote folder path", "Save settings to enable automated cloud backup"]
    },

    "Google Settings": {
      icon: "⚙️",
      summaryAr: "الضبط المركزي لخدمات Google السحابية؛ إدخال مفاتيح Google API ومعرفات العميل لربط التقويم وجهات الاتصال ودرايف.",
      summaryEn: "Master Google Cloud configuration: enter Google API Client ID and Secret to empower Contacts, Calendar, and Drive.",
      stepsAr: ["إنشاء مشروع في Google Cloud Console وتفعيل واجهات APIs المطلوبة", "نسخ Client ID و Client Secret وإدراجهما في الشاشة", "حفظ الإعدادات لتفعيل الربط مع كافة خدمات Google في النظام"],
      stepsEn: ["Create Google Cloud project and enable required Workspace APIs", "Paste OAuth Client ID and Secret credentials into fields", "Save configuration to unlock all Google integrations"]
    },
    "Google Contacts": {
      icon: "👤",
      summaryAr: "المزامنة التلقائية الثنائية لبيانات جهات اتصال العملاء والموردين بين ERPNext وجهات اتصال Google.",
      summaryEn: "Bi-directional synchronization of customer and vendor contacts between ERPNext and Google Contacts.",
      stepsAr: ["تفعيل مزامنة جهات الاتصال وربط حساب Google", "تحديد جهات الاتصال المراد مزامنتها (عملاء، موردين)", "حفظ ومزامنة الأسماء وأرقام الهواتف والبريد الإلكتروني"],
      stepsEn: ["Enable contact synchronization and connect Google user account", "Filter entity contacts to synchronize (Customers, Suppliers)", "Save and trigger instant contact synchronization"]
    },
    "Google Calendar": {
      icon: "📅",
      summaryAr: "مزامنة مواعيد الاجتماعات، المهام المجدولة، والفعاليات بين تقويم النظام وتقويم Google Calendar للموظفين.",
      summaryEn: "Synchronize meetings, tasks, and company events between ERPNext calendar and Google Calendar.",
      stepsAr: ["ربط تقويم المستخدم بحساب Google Calendar الشخصي أو المؤسسي", "تحديد تقويم الوجهة ومزامنة الفعاليات تلقائياً في الاتجاهين", "حفظ الإعدادات وتفعيل التنبيهات المسبقة للمواعيد"],
      stepsEn: ["Link user calendar to corporate Google Calendar profile", "Designate target calendar and enable two-way sync", "Save settings to receive reminders across mobile and desk"]
    },

    "Webhook": {
      icon: "📡",
      summaryAr: "إرسال بيانات وإشعارات برمجية فورية عبر HTTP POST/PUT إلى منصات وتطبيقات خارجية عند وقوع أحداث في النظام.",
      summaryEn: "Dispatch immediate automated webhook payloads to external endpoints upon document events (insert, submit, update).",
      stepsAr: ["اختيار المستند المراقب (مثل فاتورة مبيعات) وتحديد الحدث المشغل", "إدخال رابط نقطة النهاية Webhook URL وتحديد صيغة JSON", "حفظ وتفعيل الويب هوك لمزامنة البيانات في اللحظة الفعلية"],
      stepsEn: ["Select monitored DocType and trigger event (on submit/update)", "Enter destination target Webhook URL and JSON payload template", "Save and activate webhook for instant event dispatch"]
    },
    "SMS Settings": {
      icon: "💬",
      summaryAr: "تهيئة بوابة الرسائل النصية القصيرة SMS لإرسال إشعارات ورموز التحقق وفواتير العملاء تلقائياً.",
      summaryEn: "Configure SMS Gateway provider to send automated notifications, OTP codes, and client invoices via SMS.",
      stepsAr: ["إدخال رابط بوابة الرسائل النصية المعتمدة واسم المرسل (Sender ID)", "إدخال بيانات تسجيل الدخول أو مفتاح الـ API واسم البارامترات", "إجراء اختبار إرسال رسالة تجريبية والتأكد من وصولها وحفظ الإعدادات"],
      stepsEn: ["Enter approved SMS gateway URL and registered Sender ID", "Configure API credentials and phone/message parameters", "Send test SMS message to verify delivery and save"]
    },
    "Slack Webhook URL": {
      icon: "📣",
      summaryAr: "ربط النظام بقنوات وتنبيهات منصة Slack لإرسال رسائل آلية عند إنشاء طلبات جديدة أو اعتماد المستندات.",
      summaryEn: "Connect ERPNext to internal Slack channels to broadcast real-time bot alerts on system actions and approvals.",
      stepsAr: ["إنشاء Incoming Webhook في مساحة عمل Slack الخاصة بالمنشأة", "نسخ رابط الويب هوك وإدراجه في الشاشة", "حفظ الإعدادات وتحديد التنبيهات والأحداث المراد إرسالها للقنوات"],
      stepsEn: ["Generate Incoming Webhook URL in company Slack workspace", "Paste Webhook URL into configuration field", "Save settings and link to system notification alerts"]
    },

    "Plaid Settings": {
      icon: "💳",
      summaryAr: "ربط الحسابات البنكية للمنشأة عبر بروتوكول Plaid المصرفي لاستيراد الحركات وكشوف الحساب آلياً.",
      summaryEn: "Connect corporate bank accounts via Plaid banking gateway to automate transaction imports and bank feeds.",
      stepsAr: ["إدخال مفاتيح بيئة العمل Plaid Client ID و Secret Key", "تحديد البيئة (تجريبية Sandbox أو حية Production)", "ربط الحسابات المصرفية وتفعيل استيراد القيود البنكية التلقائي"],
      stepsEn: ["Enter Plaid Client ID and authorized Secret Key credentials", "Select target operating environment (Sandbox or Production)", "Link bank accounts and automate transaction synchronization"]
    }
  };

  /* ─────────────────────────────────────────
     ٦. دوال الترجمة والتهريب
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return arabicFallback[key] || (typeof window.__ === "function" ? window.__(key) : key);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ─────────────────────────────────────────
     ٧. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const isSettingDoc = singleDocs.has(itemName) || itemName.toLowerCase().includes("settings");

    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? ("إدارة ومتابعة " + title + " وتنفيذ العمليات المرتبطة بها.") : ("Manage and track " + itemName + "."));
    const rawSteps = desc ? (isArabic ? desc.stepsAr : desc.stepsEn) : null;
    const steps = (Array.isArray(rawSteps) && rawSteps.length > 0)
      ? rawSteps
      : (isArabic
          ? [
              "فتح شاشة " + title,
              "إدخال وتعبئة البيانات الأساسية المطلوبة",
              "مراجعة وتدقيق الحقول والتحقق من صحتها",
              "حفظ السجل واعتماد المستند"
            ]
          : [
              "Open " + itemName,
              "Fill in the required information and fields",
              "Review and verify mandatory values",
              "Save and submit the record"
            ]);

    const existing = root.querySelector(".erp-modal-overlay") || document.querySelector(".erp-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "erp-modal-overlay";
    overlay.setAttribute("dir", isArabic ? "rtl" : "ltr");

    const launchLabel = isSettingDoc
      ? (isArabic ? "فتح شاشة الإعدادات" : "Open Settings")
      : (isArabic ? "فتح الشاشة" : "Open Screen");

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "⚙️"}</span>
          <h3 class="erp-modal-title">${escapeHtml(title)}</h3>
        </div>
        <p class="erp-modal-summary">${escapeHtml(summary)}</p>

        <div class="erp-modal-steps is-shown" data-modal-steps>
          <ol class="erp-modal-steps-list">
            ${steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ol>
        </div>

        <div style="margin-top: 18px;">
          <button
            type="button"
            class="erp-quick-btn"
            data-modal-launch
            style="width: 100%; min-height: 42px;"
          >
            <span class="erp-quick-label">${escapeHtml(launchLabel)}</span>
          </button>
        </div>
      </div>
    `;

    root.appendChild(overlay);
    setTimeout(() => overlay.classList.add("is-visible"), 10);

    const closeModal = () => {
      overlay.classList.remove("is-visible");
      setTimeout(() => overlay.remove(), 280);
    };

    const closeBtn = overlay.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });

    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(itemName);
      });
    }
  }

  /* ─────────────────────────────────────────
     ٨. إنشاء أزرار الوصول السريع
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    quickActions.innerHTML = `
      <div class="erp-quick-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 20px;">
        ${quickActionButtons.map((btn, idx) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button
              type="button"
              class="erp-quick-btn"
              data-shortcut-idx="${idx}"
              style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px;"
            >
              <span class="erp-quick-label" style="display: flex; align-items: center; gap: 8px;">
                <span>${escapeHtml(label)}</span>
                <span class="erp-link-arrow" aria-hidden="true" style="font-size: 11px; opacity: 0.7;">↗</span>
              </span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btnEl = event.target.closest("[data-shortcut-idx]");
      if (!btnEl || !window.frappe) return;
      const idx = Number(btnEl.dataset.shortcutIdx);
      const item = quickActionButtons[idx];
      if (!item) return;

      if (item.route) {
        frappe.set_route(item.route);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ٩. إنشاء بطاقات الوحدات والمربعات
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

            const linksHtml = items.map(itemName => {
              const desc = itemDescriptions[itemName];
              const isReport = reportNames.has(itemName);
              const detailsLabel = isArabic ? "تفاصيل" : "Details";
              const infoBtn = (!isReport && desc)
                ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(itemName)}">${detailsLabel}</button>`
                : "";

              return `
                <div class="erp-link-row">
                  <button type="button" class="erp-link" data-route-name="${escapeHtml(itemName)}">
                    <span class="erp-link-text">${escapeHtml(translate(itemName))}</span>
                    <span class="erp-link-arrow" aria-hidden="true">${isArabic ? "←" : "→"}</span>
                  </button>
                  ${infoBtn}
                </div>`;
            }).join("");

            return `
              <article class="erp-card tone-${(sectionIndex + cardIndex) % 5}" data-erp-card>
                <button type="button" class="erp-card-heading" data-card-toggle aria-expanded="false">
                  <span class="erp-icon" aria-hidden="true">${icon}</span>
                  <span class="erp-card-title">${escapeHtml(translate(cardName))}</span>
                  <span class="erp-card-chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="erp-card-links">${linksHtml}</div>
              </article>`;
          }).join("");

        return `
          <section class="erp-module-section">
            <h2 class="erp-section-title">${escapeHtml(translate(sectionName))}</h2>
            <div class="erp-dashboard-grid">${cardsHtml}</div>
          </section>`;
      }).join("");
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "920033198",
    email: "apps@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneAr: "الهاتف الموحد",
      phoneEn: "Support Phone",
      emailAr: "البريد الإلكتروني",
      emailEn: "Email Support",
      websiteAr: "الموقع الإلكتروني",
      websiteEn: "Official Website"
    }
  };

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
      </div>`;
  }

  /* ─────────────────────────────────────────
     ١١. التوجيه وفتح الشاشات داخل النظام
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (customRoutes[name]) {
      frappe.set_route(customRoutes[name]);
      return;
    }
    if (reportNames.has(name)) {
      frappe.set_route("query-report", name);
      return;
    }
    if (singleDocs.has(name)) {
      frappe.set_route("Form", name);
      return;
    }
    if (treeDocs.has(name)) {
      frappe.set_route("Tree", name);
      return;
    }
    frappe.set_route("List", name);
  }

  /* ─────────────────────────────────────────
     ١٢. معالجة الأحداث والضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", event => {
    const infoBtn = event.target.closest("[data-info-item]");
    if (infoBtn) {
      event.preventDefault();
      event.stopPropagation();
      showInfoModal(infoBtn.dataset.infoItem);
      return;
    }

    const link = event.target.closest("[data-route-name]");
    if (link) {
      event.preventDefault();
      openRoute(link.dataset.routeName);
      return;
    }

    const toggle = event.target.closest("[data-card-toggle]");
    if (toggle) {
      const now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;

      const card = toggle.closest("[data-erp-card]");
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      if (card) {
        card.classList.toggle("is-collapsed", expanded);
      }
    }
  });

  /* ─────────────────────────────────────────
     ١٣. بدء التشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
