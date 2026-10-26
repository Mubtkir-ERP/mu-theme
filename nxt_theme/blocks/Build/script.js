(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم البناء والتطوير — ERPNext Build
   * ══════════════════════════════════════════
   *
   *  يحتوي:
   *    ● أزرار اختصارات سريعة (تحت الشعار)
   *    ● بطاقات المكونات (قابلة للطي + توضيح)
   *    ● الفوتر
   *
   *  بدون إحصائيات.
   */


  /* ─────────────────────────────────────────
     ١. عناصر لوحة التحكم
  ───────────────────────────────────────── */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;


  /* ─────────────────────────────────────────
     ٢. معرفة لغة المستخدم
  ───────────────────────────────────────── */

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang ||
    "en";

  const isArabic = String(langValue).toLowerCase().startsWith("ar");


  /* ─────────────────────────────────────────
     ٣. أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      doctype: "DocType",
      icon: "🧩",
      labelEn: "DocType",
      labelAr: "نوع المستند",
      color: "#2563eb"
    },
    {
      doctype: "Customize Form",
      icon: "🎨",
      labelEn: "Customize Form",
      labelAr: "تخصيص النموذج",
      color: "#16a34a"
    },
    {
      doctype: "Report",
      icon: "📊",
      labelEn: "Report",
      labelAr: "تقرير",
      color: "#ea580c"
    },
    {
      doctype: "Client Script",
      icon: "📜",
      labelEn: "Client Script",
      labelAr: "سكريبت العميل",
      color: "#7c3aed"
    }
  ];


  /* ─────────────────────────────────────────
     ٤. إعدادات الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "0115110455",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com",
    labels: {
      phoneEn: "Phone", phoneAr: "الهاتف الموحد",
      emailEn: "Email", emailAr: "البريد الإلكتروني",
      websiteEn: "Website", websiteAr: "الموقع"
    }
  };


  /* ─────────────────────────────────────────
     ٥. بطاقات المكونات
  ───────────────────────────────────────── */

  const sections = [
    [
      "Components to build your app",
      [
        [
          "Models",
          "🧩",
          ["DocType", "Workflow"]
        ],

        [
          "Views",
          "👁️",
          ["Report", "Print Format", "Workspace", "Dashboard", "Dashboard Chart"]
        ],

        [
          "Customization",
          "🎨",
          ["Customize Form", "Custom Field", "Custom Translation", "Navbar Settings"]
        ],

        [
          "Scripting",
          "💻",
          ["Server Script", "Client Script", "Scheduled Job Type"]
        ],

        [
          "Modules",
          "📦",
          ["Module Def", "Module Onboarding"]
        ],

        [
          "Packages",
          "📁",
          ["Package", "Package Import"]
        ],

        [
          "System Logs",
          "📋",
          ["Background Jobs", "Scheduled Jobs Logs", "Error Logs", "Communication Logs", "Activity Log"]
        ]
      ]
    ]
  ];


  /* ─────────────────────────────────────────
     ٦. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Components to build your app": "مكونات بناء التطبيق",

    "Models": "النماذج",
    "DocType": "نوع المستند",
    "Workflow": "سير العمل",

    "Views": "العروض",
    "Report": "تقرير",
    "Print Format": "تنسيق الطباعة",
    "Workspace": "مساحة العمل",
    "Dashboard": "لوحة المعلومات",
    "Dashboard Chart": "رسم بياني للوحة المعلومات",

    "Customization": "التخصيص",
    "Customize Form": "تخصيص النموذج",
    "Custom Field": "حقل مخصص",
    "Custom Translation": "ترجمة مخصصة",
    "Navbar Settings": "إعدادات شريط التنقل",

    "Scripting": "البرمجة",
    "Server Script": "سكريبت الخادم",
    "Client Script": "سكريبت العميل",
    "Scheduled Job Type": "نوع المهمة المجدولة",

    "Modules": "الوحدات",
    "Module Def": "تعريف الوحدة",
    "Module Onboarding": "إعداد الوحدة",

    "Packages": "الحزم",
    "Package": "حزمة",
    "Package Import": "استيراد حزمة",

    "System Logs": "سجلات النظام",
    "Background Jobs": "المهام الخلفية",
    "Scheduled Jobs Logs": "سجلات المهام المجدولة",
    "Error Logs": "سجلات الأخطاء",
    "Communication Logs": "سجلات الاتصالات",
    "Activity Log": "سجل النشاط",

    "System Settings": "إعدادات النظام",
    "Print Format Builder": "منشئ تنسيق الطباعة"
  };


  /* ─────────────────────────────────────────
     ٧. المستندات الخاصة
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "System Settings",
    "Navbar Settings"
  ]);

  const reportNames = new Set([]);


  /* ─────────────────────────────────────────
     ٨. أوصاف العناصر (توضيح فقط — بدون خطوات)
  ───────────────────────────────────────── */

  const itemDescriptions = {

    /* ═══ النماذج ═══ */

    "DocType": {
      icon: "🧩",
      summaryAr: "الجدول الأساسي في Frappe — يُعرّف هيكل البيانات والحقول والصلاحيات وسير العمل لكل مستند في النظام.",
      summaryEn: "The core building block in Frappe — defines data structure, fields, permissions, and workflow for every document in the system."
    },

    "Workflow": {
      icon: "🔄",
      summaryAr: "إنشاء مسارات اعتماد وسير عمل للمستندات مع تحديد المراحل والصلاحيات والانتقالات بين الحالات.",
      summaryEn: "Create approval workflows for documents with defined stages, permissions, and state transitions."
    },

    /* ═══ العروض ═══ */

    "Report": {
      icon: "📊",
      summaryAr: "إنشاء تقارير مخصصة (Query Report أو Script Report) لعرض وتحليل البيانات بأشكال مختلفة.",
      summaryEn: "Create custom reports (Query Report or Script Report) to display and analyze data in various formats."
    },

    "Print Format": {
      icon: "🖨️",
      summaryAr: "تصميم قوالب طباعة مخصصة للفواتير والعروض وغيرها باستخدام HTML/Jinja أو المحرر المرئي.",
      summaryEn: "Design custom print templates for invoices, quotes, and more using HTML/Jinja or the visual editor."
    },

    "Workspace": {
      icon: "🏠",
      summaryAr: "إنشاء وتخصيص مساحات العمل (الصفحات الرئيسية) التي تظهر في القائمة الجانبية لتنظيم الوصول السريع.",
      summaryEn: "Create and customize workspaces (landing pages) that appear in the sidebar for quick access organization."
    },

    "Dashboard": {
      icon: "📈",
      summaryAr: "إنشاء لوحات معلومات تعرض رسوم بيانية ومؤشرات أداء من بيانات النظام في صفحة واحدة.",
      summaryEn: "Create dashboards displaying charts and KPIs from system data on a single page."
    },

    "Dashboard Chart": {
      icon: "📉",
      summaryAr: "إنشاء رسوم بيانية فردية (خطية، دائرية، أعمدة) يمكن إضافتها إلى لوحات المعلومات أو مساحات العمل.",
      summaryEn: "Create individual charts (line, pie, bar) that can be added to dashboards or workspaces."
    },

    /* ═══ التخصيص ═══ */

    "Customize Form": {
      icon: "🎨",
      summaryAr: "تعديل النماذج الموجودة بدون كتابة كود — إضافة/إخفاء/إعادة ترتيب الحقول وتغيير خصائصها.",
      summaryEn: "Modify existing forms without code — add/hide/reorder fields and change their properties."
    },

    "Custom Field": {
      icon: "➕",
      summaryAr: "إضافة حقول مخصصة إلى أي مستند موجود في النظام دون تعديل الكود الأصلي.",
      summaryEn: "Add custom fields to any existing document in the system without modifying the original code."
    },

    "Custom Translation": {
      icon: "🌍",
      summaryAr: "إضافة أو تعديل ترجمات مخصصة للنصوص الظاهرة في واجهة النظام بأي لغة.",
      summaryEn: "Add or modify custom translations for interface text in any language."
    },

    "Navbar Settings": {
      icon: "📌",
      summaryAr: "تخصيص شريط التنقل العلوي — إضافة روابط وأيقونات وتغيير الشعار وعناصر القائمة.",
      summaryEn: "Customize the top navigation bar — add links, icons, change logo, and menu items."
    },

    /* ═══ البرمجة ═══ */

    "Server Script": {
      icon: "🖥️",
      summaryAr: "كتابة سكريبتات Python تعمل على الخادم لتنفيذ منطق مخصص عند أحداث معينة (قبل الحفظ، بعد الاعتماد، API).",
      summaryEn: "Write Python scripts that run on the server for custom logic on specific events (before save, after submit, API)."
    },

    "Client Script": {
      icon: "📜",
      summaryAr: "كتابة سكريبتات JavaScript تعمل في المتصفح لتخصيص سلوك النماذج وإضافة تفاعلات مرئية.",
      summaryEn: "Write JavaScript scripts that run in the browser to customize form behavior and add visual interactions."
    },

    "Scheduled Job Type": {
      icon: "⏰",
      summaryAr: "إنشاء مهام مجدولة تعمل تلقائياً في أوقات محددة (كل دقيقة، كل ساعة، يومياً) لتنفيذ عمليات دورية.",
      summaryEn: "Create scheduled jobs that run automatically at specified intervals (every minute, hourly, daily) for periodic operations."
    },

    /* ═══ الوحدات ═══ */

    "Module Def": {
      icon: "📦",
      summaryAr: "تعريف وحدات (Modules) جديدة في النظام لتنظيم المستندات والتقارير تحت أقسام محددة.",
      summaryEn: "Define new modules in the system to organize documents and reports under specific sections."
    },

    "Module Onboarding": {
      icon: "🚀",
      summaryAr: "إنشاء خطوات إعداد أولية تظهر للمستخدم عند فتح وحدة لأول مرة لتسهيل البدء.",
      summaryEn: "Create initial setup steps shown to users when opening a module for the first time for easy onboarding."
    },

    /* ═══ الحزم ═══ */

    "Package": {
      icon: "📁",
      summaryAr: "تجميع التخصيصات (DocTypes، سكريبتات، تقارير) في حزمة واحدة قابلة للتصدير والنقل بين المواقع.",
      summaryEn: "Bundle customizations (DocTypes, scripts, reports) into a single package exportable and transferable between sites."
    },

    "Package Import": {
      icon: "📥",
      summaryAr: "استيراد حزمة تخصيصات من موقع آخر وتطبيقها على الموقع الحالي.",
      summaryEn: "Import a customization package from another site and apply it to the current site."
    },

    /* ═══ سجلات النظام ═══ */

    "Background Jobs": {
      icon: "⚙️",
      summaryAr: "عرض ومراقبة المهام الخلفية الجارية والمكتملة والفاشلة في النظام (Redis Queue).",
      summaryEn: "View and monitor running, completed, and failed background jobs in the system (Redis Queue)."
    },

    "Scheduled Jobs Logs": {
      icon: "📅",
      summaryAr: "عرض سجلات تنفيذ المهام المجدولة مع حالة النجاح أو الفشل ووقت التنفيذ.",
      summaryEn: "View scheduled job execution logs with success/failure status and execution time."
    },

    "Error Logs": {
      icon: "❌",
      summaryAr: "عرض سجلات الأخطاء البرمجية (Tracebacks) التي حدثت في النظام لتتبع المشاكل وإصلاحها.",
      summaryEn: "View error tracebacks that occurred in the system for debugging and troubleshooting."
    },

    "Communication Logs": {
      icon: "📧",
      summaryAr: "عرض سجلات جميع الاتصالات (إيميلات، رسائل) المرسلة والمستقبلة عبر النظام.",
      summaryEn: "View logs of all communications (emails, messages) sent and received through the system."
    },

    "Activity Log": {
      icon: "📝",
      summaryAr: "عرض سجل نشاطات المستخدمين في النظام — تسجيل دخول، تعديل مستندات، حذف، وغيرها.",
      summaryEn: "View user activity log — logins, document edits, deletions, and other actions."
    }
  };


  /* ─────────────────────────────────────────
     ٩. دوال مساعدة
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
     ١٠. مربع التفاصيل (Modal)
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
        </div>`;
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
      </div>`;

    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));

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
        stepsContainer.classList.toggle("is-shown");
        toggleBtn.textContent = isShowing ? showStepsText : hideStepsText;
      });
    }
  }


  /* ─────────────────────────────────────────
     ١١. إنشاء أزرار الاختصارات
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصارات سريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map((btn) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn" data-new-doc="${escapeHtml(btn.doctype)}" style="--btn-color: ${btn.color}">
              <span class="erp-quick-icon" aria-hidden="true">${btn.icon}</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>`;

    quickActions.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-new-doc]");
      if (!btn) return;
      const doctype = btn.dataset.newDoc;
      if (window.frappe && typeof frappe.new_doc === "function") {
        frappe.new_doc(doctype);
      }
    });
  }


  /* ─────────────────────────────────────────
     ١٢. إنشاء بطاقات المكونات
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

            const linksHtml = items.map((itemName) => {
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
     ١٣. إنشاء الفوتر
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
      </div>`;
  }


  /* ─────────────────────────────────────────
     ١٤. فتح الخيار داخل ERPNext
  ───────────────────────────────────────── */

  function openRoute(name) {
    if (!window.frappe || typeof frappe.set_route !== "function") return;
    if (reportNames.has(name)) { frappe.set_route("query-report", name); return; }
    if (singleDocs.has(name)) { frappe.set_route("Form", name); return; }
    frappe.set_route("List", name);
  }


  /* ─────────────────────────────────────────
     ١٥. أحداث الضغط
  ───────────────────────────────────────── */

  let lastToggleTime = 0;

  content.addEventListener("click", (event) => {
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

    const routeButton = event.target.closest("[data-route-name]");
    if (routeButton) {
      event.preventDefault();
      event.stopPropagation();
      openRoute(routeButton.dataset.routeName);
      return;
    }

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
     ١٦. تشغيل
  ───────────────────────────────────────── */

  renderQuickActions();
  renderSections();
  renderFooter();
})();
