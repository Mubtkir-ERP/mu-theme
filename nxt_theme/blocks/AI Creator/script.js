(function () {
  if (!root_element) return;

  const dashboard = root_element.querySelector("[data-erp-dashboard]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const cardsGrid = root_element.querySelector("[data-cards-grid]");
  const footerContact = root_element.querySelector("[data-footer-contact]");
  const modalOverlay = root_element.querySelector("[data-modal-overlay]");
  const modalIcon = root_element.querySelector("[data-modal-icon]");
  const modalTitle = root_element.querySelector("[data-modal-title]");
  const modalSummary = root_element.querySelector("[data-modal-summary]");
  const modalStepsList = root_element.querySelector("[data-modal-steps-list]");
  const modalCloseBtn = root_element.querySelector("[data-modal-close]");
  const modalLaunchBtn = root_element.querySelector("[data-modal-launch]");
  const modalOpenLabel = root_element.querySelector("[data-modal-open-label]");
  const modalStepsBox = root_element.querySelector("[data-modal-steps]");
  const modalToggleSteps = root_element.querySelector("[data-modal-toggle-steps]");
  const modalToggleText = root_element.querySelector("[data-modal-toggle-text]");
  const modalStepsTitle = root_element.querySelector("[data-modal-steps-title]");

  const isArabic =
    document.documentElement.lang === "ar" ||
    (window.frappe && frappe.boot && frappe.boot.lang === "ar") ||
    document.documentElement.dir === "rtl";

  if (dashboard) {
    dashboard.setAttribute("dir", isArabic ? "rtl" : "ltr");
    dashboard.classList.toggle("erp-dashboard-rtl", isArabic);
  }
  if (modalOverlay) {
    modalOverlay.setAttribute("dir", isArabic ? "rtl" : "ltr");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNumber(val) {
    const n = Number(val) || 0;
    return n.toLocaleString("en-US");
  }

  async function safeCount(doctype, filters) {
    try {
      const r = await frappe.call({
        method: "frappe.client.get_count",
        args: { doctype, filters: filters || {} },
      });
      return Number(r && r.message) || 0;
    } catch (e) {
      return 0;
    }
  }

  const statsCards = [
    {
      id: "ai-sites",
      icon: "🌐",
      labelAr: "مواقع العملاء",
      labelEn: "Client Sites",
      fetch: () => safeCount("AI Client Site"),
    },
    {
      id: "ai-tasks",
      icon: "🤖",
      labelAr: "المهام الذكية",
      labelEn: "AI Tasks",
      fetch: () => safeCount("AI Task"),
    },
    {
      id: "ai-deployments",
      icon: "🚀",
      labelAr: "عمليات النشر",
      labelEn: "Deployments",
      fetch: () => safeCount("AI Deployment"),
    },
    {
      id: "ai-logs",
      icon: "📜",
      labelAr: "سجل العمليات",
      labelEn: "Action Logs",
      fetch: () => safeCount("AI Action Log"),
    },
  ];

  const shortcuts = [
    {
      name: "AI Creator Chat",
      labelAr: "واجهة المحادثة",
      labelEn: "AI Creator Chat",
      type: "page",
      route: "ai-creator-chat",
    },
    {
      name: "AI Client Site",
      labelAr: "مواقع العملاء",
      labelEn: "AI Client Site",
      type: "doctype",
      doctype: "AI Client Site",
      hasCount: true,
    },
    {
      name: "AI Task",
      labelAr: "المهام الذكية",
      labelEn: "AI Task",
      type: "doctype",
      doctype: "AI Task",
      hasCount: true,
    },
    {
      name: "AI Deployment",
      labelAr: "عمليات النشر",
      labelEn: "AI Deployment",
      type: "doctype",
      doctype: "AI Deployment",
      hasCount: true,
    },
    {
      name: "Remote Import",
      labelAr: "الاستيراد عن بُعد",
      labelEn: "Remote Import",
      type: "page",
      route: "remote-import",
    },
    {
      name: "AI Action Log",
      labelAr: "سجل العمليات",
      labelEn: "AI Action Log",
      type: "doctype",
      doctype: "AI Action Log",
      hasCount: true,
    },
  ];

  const cards = [
    {
      titleAr: "التشغيل",
      titleEn: "Operations",
      icon: "🤖",
      items: [
        {
          name: "AI Client Site",
          labelAr: "مواقع العملاء",
          labelEn: "AI Client Site",
          routeType: "List",
          target: "AI Client Site",
          summaryAr: "إدارة حسابات مواقع العملاء وبيانات الاتصال والربط عبر API.",
          summaryEn: "Manage client site accounts, API credentials, and connection status.",
          stepsAr: ["أضف موقع العميل وحدد الرابط ومفاتيح API", "اختبر الاتصال بالموقع", "اربط الموقع بجلسات ومهام الذكاء الاصطناعي"],
          stepsEn: ["Add client site URL and API credentials", "Test site connectivity", "Use site in AI sessions and tasks"],
        },
        {
          name: "AI Session",
          labelAr: "جلسات العمل",
          labelEn: "AI Session",
          routeType: "List",
          target: "AI Session",
          summaryAr: "جلسات العمل الذكية المقفلة على موقع عميل محدد لضمان عزل التعديلات.",
          summaryEn: "Dedicated AI work sessions locked to a single client site.",
          stepsAr: ["أنشئ جلسة عمل جديدة", "حدد موقع العميل المستهدف", "ابدأ المحادثة والتنفيذ ضمن الجلسة"],
          stepsEn: ["Create a new AI session", "Select the target client site", "Run chat and tasks safely inside the session"],
        },
        {
          name: "AI Task",
          labelAr: "المهام الذكية",
          labelEn: "AI Task",
          routeType: "List",
          target: "AI Task",
          summaryAr: "متابعة المهام التي يخططها وينفذها المساعد الذكي واعتمادها قبل التنفيذ.",
          summaryEn: "Track AI-planned tasks, execution plans, and approvals.",
          stepsAr: ["استعرض المهمة وخطة العمل المقترحة", "راجع التفاصيل والموافقات", "اعتمد المهمة للتنفيذ"],
          stepsEn: ["Review task and proposed execution plan", "Verify scope and approvals", "Approve task for execution"],
        },
        {
          name: "AI Deployment",
          labelAr: "عمليات النشر",
          labelEn: "AI Deployment",
          routeType: "List",
          target: "AI Deployment",
          summaryAr: "نشر التخصيصات والتعديلات الموحدة على عدة عملاء مع معاينة التوافق.",
          summaryEn: "Deploy unified customizations across multiple client sites with compatibility checks.",
          stepsAr: ["اختر القالب أو التخصيص المطلوب", "حدد المواقع المستهدفة", "نفّذ معاينة التوافق ثم ابدأ النشر"],
          stepsEn: ["Select template or customization", "Choose target client sites", "Run compatibility check and deploy"],
        },
        {
          name: "AI Import",
          labelAr: "الاستيراد الجماعي",
          labelEn: "AI Import",
          routeType: "List",
          target: "AI Import",
          summaryAr: "استيراد جماعي للبيانات من Excel/CSV مع ربط الحقول والمعاينة قبل الاعتماد.",
          summaryEn: "Bulk Excel/CSV data import with smart field mapping and preview.",
          stepsAr: ["ارفع ملف البيانات", "راجع خريطة الحقول", "نفّذ المعاينة ثم استورد البيانات"],
          stepsEn: ["Upload Excel/CSV file", "Review field mappings", "Preview and execute import"],
        },
      ],
    },
    {
      titleAr: "الاستيراد عن بُعد",
      titleEn: "Remote Import",
      icon: "📥",
      items: [
        {
          name: "Remote Import",
          labelAr: "صفحة الاستيراد عن بُعد",
          labelEn: "Remote Import",
          routeType: "Page",
          target: "remote-import",
          summaryAr: "واجهة تفاعلية لاستيراد البيانات عن بُعد مباشرة إلى حسابات العملاء.",
          summaryEn: "Interactive page for importing data remotely into client sites.",
          stepsAr: ["اختر موقع العميل", "حدد نوع المستند والملف", "ابدأ الاستيراد وتابع التقدم"],
          stepsEn: ["Select client site", "Choose target DocType and file", "Start import and monitor progress"],
        },
        {
          name: "AI Remote Import",
          labelAr: "سجلات الاستيراد عن بُعد",
          labelEn: "AI Remote Import",
          routeType: "List",
          target: "AI Remote Import",
          summaryAr: "متابعة جميع عمليات الاستيراد عن بُعد وحالاتها.",
          summaryEn: "Track all remote import jobs and their status.",
          stepsAr: ["افتح سجل الاستيراد", "تحقق من عدد الصفوف الناجحة والفاشلة", "عالج أي أخطاء إن وجدت"],
          stepsEn: ["Open remote import record", "Check succeeded/failed row counts", "Resolve any validation errors"],
        },
        {
          name: "AI Import Log",
          labelAr: "سجل نتائج الاستيراد",
          labelEn: "AI Import Log",
          routeType: "List",
          target: "AI Import Log",
          summaryAr: "سجل تفصيلي لنتائج وإحصائيات كل عملية استيراد.",
          summaryEn: "Detailed log of import results and statistics.",
          stepsAr: ["ابحث برقم العملية", "راجع ملخص النتائج والأخطاء"],
          stepsEn: ["Filter by import job", "Review detailed results and error logs"],
        },
        {
          name: "AI Import Mapping",
          labelAr: "خرائط ربط الأعمدة",
          labelEn: "AI Import Mapping",
          routeType: "List",
          target: "AI Import Mapping",
          summaryAr: "خرائط ربط الأعمدة المحفوظة لإعادة استخدامها في الاستيراد المتكرر.",
          summaryEn: "Saved column mapping templates for recurring imports.",
          stepsAr: ["أنشئ أو عدّل خريطة الربط", "اربط أعمدة الملف بحقول النظام"],
          stepsEn: ["Create or edit mapping template", "Map spreadsheet columns to DocType fields"],
        },
      ],
    },
    {
      titleAr: "التدقيق والمراجعة",
      titleEn: "Audit & Review",
      icon: "🛡️",
      items: [
        {
          name: "AI Action Log",
          labelAr: "سجل العمليات",
          labelEn: "AI Action Log",
          routeType: "List",
          target: "AI Action Log",
          summaryAr: "سجل تدقيق شامل لكل عملية نُفّذت على حسابات العملاء عبر المنصة.",
          summaryEn: "Complete audit trail of every action executed on client sites.",
          stepsAr: ["اختر الموقع أو المستخدم", "راجع تفاصيل العملية والوقت والنتيجة"],
          stepsEn: ["Filter by site or user", "Inspect action payload, timestamp, and outcome"],
        },
      ],
    },
    {
      titleAr: "مكتبة القوالب",
      titleEn: "Template Library",
      icon: "🧩",
      items: [
        {
          name: "AI Template",
          labelAr: "قوالب التخصيص",
          labelEn: "AI Template",
          routeType: "List",
          target: "AI Template",
          summaryAr: "مكتبة التخصيصات والقوالب الملتقطة من العملاء بنسخ مؤرّخة.",
          summaryEn: "Versioned library of customizations captured from client sites.",
          stepsAr: ["استعرض القوالب المتوفرة", "راجع النسخة والمحتوى", "انشر القالب على المواقع المطلوبة"],
          stepsEn: ["Browse saved templates", "Review version and contents", "Deploy template to target sites"],
        },
      ],
    },
    {
      titleAr: "الإعدادات",
      titleEn: "Settings",
      icon: "⚙️",
      items: [
        {
          name: "AI Settings",
          labelAr: "إعدادات AI Creator",
          labelEn: "AI Settings",
          routeType: "Form",
          target: "AI Settings",
          hideDetails: true,
          summaryAr: "ضبط مزوّد الذكاء الاصطناعي ومفاتيح الربط وسياسات المخاطر.",
          summaryEn: "Configure AI model provider, API keys, and risk policies.",
          stepsAr: ["حدد مزوّد النموذج", "أدخل مفاتيح API وسياسات الاعتماد", "احفظ الإعدادات"],
          stepsEn: ["Select AI model provider", "Enter API keys and approval policies", "Save settings"],
        },
      ],
    },
  ];

  function openItemRoute(item) {
    if (!window.frappe || !frappe.set_route) return;
    if (item.routeType === "Page") {
      frappe.set_route(item.target);
    } else if (item.routeType === "Form") {
      frappe.set_route("Form", item.target, item.target);
    } else {
      frappe.set_route("List", item.target);
    }
  }

  let activeModalItem = null;

  function openDetailsModal(item) {
    activeModalItem = item;
    if (!modalOverlay) return;
    if (modalIcon) modalIcon.textContent = item.icon || "🤖";
    if (modalTitle) modalTitle.textContent = isArabic ? item.labelAr : item.labelEn;
    if (modalSummary) modalSummary.textContent = isArabic ? item.summaryAr : item.summaryEn;
    if (modalOpenLabel) modalOpenLabel.textContent = isArabic ? "فتح الشاشة" : "Open Screen";
    if (modalStepsTitle) modalStepsTitle.textContent = isArabic ? "خطوات الاستخدام" : "Usage Steps";
    if (modalToggleText) modalToggleText.textContent = isArabic ? "إظهار الخطوات" : "Show Steps";
    if (modalStepsList) {
      const steps = (isArabic ? item.stepsAr : item.stepsEn) || [];
      modalStepsList.innerHTML = steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    }
    if (modalStepsBox) modalStepsBox.style.display = "block";
    modalOverlay.style.display = "flex";
    modalOverlay.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = "none";
    modalOverlay.setAttribute("aria-hidden", "true");
    activeModalItem = null;
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (modalLaunchBtn) {
    modalLaunchBtn.addEventListener("click", function () {
      if (activeModalItem) {
        const target = activeModalItem;
        closeModal();
        openItemRoute(target);
      }
    });
  }
  if (modalToggleSteps && modalStepsBox) {
    modalToggleSteps.addEventListener("click", function () {
      const visible = modalStepsBox.style.display !== "none";
      modalStepsBox.style.display = visible ? "none" : "block";
    });
  }

  function renderStats() {
    if (!statsSection) return;
    const htmlCards = statsCards
      .map(
        (c, idx) => `
      <div class="erp-stat-card overview-tone-${idx + 1}">
        <div class="erp-stat-icon">${c.icon}</div>
        <div class="erp-stat-info">
          <span class="erp-stat-value" data-ai-stat="${c.id}">0</span>
          <span class="erp-stat-label">${escapeHtml(isArabic ? c.labelAr : c.labelEn)}</span>
        </div>
      </div>`
      )
      .join("");

    statsSection.innerHTML = `
      <section class="erp-overview-container">
        <h2 class="erp-section-title">${isArabic ? "الإحصائيات" : "Statistics"}</h2>
        <div class="erp-stats-grid">${htmlCards}</div>
      </section>
    `;

    statsCards.forEach((c) => {
      Promise.resolve()
        .then(() => c.fetch())
        .then((val) => {
          const el = statsSection.querySelector(`[data-ai-stat="${c.id}"]`);
          if (el) el.textContent = formatNumber(val);
        })
        .catch(() => {});
    });
  }

  function renderShortcuts() {
    if (!quickActions) return;
    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(isArabic ? "اختصاراتك" : "Your Shortcuts")}</h2>
      <div class="erp-quick-grid">
        ${shortcuts
          .map(
            (btn, idx) => `
          <button type="button" class="erp-quick-btn" data-ai-shortcut="${idx}">
            <span class="erp-quick-label">${escapeHtml(isArabic ? btn.labelAr : btn.labelEn)}</span>
            ${btn.hasCount ? `<span class="erp-shortcut-count" data-ai-sc-count="${escapeHtml(btn.doctype)}">0</span>` : ""}
          </button>`
          )
          .join("")}
      </div>
    `;

    quickActions.querySelectorAll("[data-ai-shortcut]").forEach((el) => {
      el.addEventListener("click", function () {
        const idx = Number(el.getAttribute("data-ai-shortcut"));
        const sc = shortcuts[idx];
        if (!sc || !window.frappe || !frappe.set_route) return;
        if (sc.type === "page") {
          frappe.set_route(sc.route);
        } else {
          frappe.set_route("List", sc.doctype);
        }
      });
    });

    shortcuts
      .filter((s) => s.hasCount && s.doctype)
      .forEach((s) => {
        safeCount(s.doctype).then((cnt) => {
          const badge = quickActions.querySelector(`[data-ai-sc-count="${s.doctype}"]`);
          if (badge) badge.textContent = formatNumber(cnt);
        });
      });
  }

  function renderCards() {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = cards
      .map(
        (card, cIdx) => `
      <div class="erp-card">
        <div class="erp-card-heading">
          <div class="erp-card-title-wrap">
            <span class="erp-card-icon">${card.icon}</span>
            <h3 class="erp-card-title">${escapeHtml(isArabic ? card.titleAr : card.titleEn)}</h3>
          </div>
        </div>
        <div class="erp-card-links">
          ${card.items
            .map(
              (item, iIdx) => `
            <div class="erp-card-link-row">
              <button type="button" class="erp-card-link-btn" data-ai-card="${cIdx}" data-ai-item="${iIdx}">
                <span class="erp-link-text">${escapeHtml(isArabic ? item.labelAr : item.labelEn)}</span>
              </button>
              ${
                item.hideDetails
                  ? ""
                  : `<button type="button" class="erp-info-link" data-ai-info-card="${cIdx}" data-ai-info-item="${iIdx}">${isArabic ? "تفاصيل" : "Details"}</button>`
              }
            </div>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");

    cardsGrid.querySelectorAll("[data-ai-card]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const cIdx = Number(btn.getAttribute("data-ai-card"));
        const iIdx = Number(btn.getAttribute("data-ai-item"));
        const item = cards[cIdx] && cards[cIdx].items[iIdx];
        if (item) openItemRoute(item);
      });
    });

    cardsGrid.querySelectorAll("[data-ai-info-card]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const cIdx = Number(btn.getAttribute("data-ai-info-card"));
        const iIdx = Number(btn.getAttribute("data-ai-info-item"));
        const item = cards[cIdx] && cards[cIdx].items[iIdx];
        if (item) openDetailsModal({ ...item, icon: cards[cIdx].icon });
      });
    });
  }

  function renderFooter() {
    if (!footerContact) return;
    const ts = (window.frappe && frappe.boot && frappe.boot.theme_settings) || {};
    const phone = ts.phone || "+966126810486";
    const email = ts.email || "sales@mubtkir.com";
    const website = ts.website || "www.mubtkir.com";
    const cleanPhone = String(phone).replace(/[^0-9+]/g, "");
    const webHref = website.startsWith("http") ? website : `https://${website}`;

    footerContact.innerHTML = `
      <a class="erp-footer-item" href="https://wa.me/${cleanPhone.replace(/^\+/, "")}" target="_blank" rel="noopener">
        <span class="erp-footer-icon">📞</span>
        <span class="erp-footer-label">${isArabic ? "واتساب:" : "WhatsApp:"}</span>
        <span class="erp-footer-val" dir="ltr">${escapeHtml(phone)}</span>
      </a>
      <a class="erp-footer-item" href="mailto:${escapeHtml(email)}">
        <span class="erp-footer-icon">✉️</span>
        <span class="erp-footer-label">${isArabic ? "البريد الإلكتروني:" : "Email:"}</span>
        <span class="erp-footer-val" dir="ltr">${escapeHtml(email)}</span>
      </a>
      <a class="erp-footer-item" href="${escapeHtml(webHref)}" target="_blank" rel="noopener">
        <span class="erp-footer-icon">🌐</span>
        <span class="erp-footer-label">${isArabic ? "الموقع:" : "Website:"}</span>
        <span class="erp-footer-val" dir="ltr">${escapeHtml(website)}</span>
      </a>
    `;
  }

  renderStats();
  renderShortcuts();
  renderCards();
  renderFooter();
})();
