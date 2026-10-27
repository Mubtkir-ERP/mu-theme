(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الدعم الفني وخدمة العملاء — ERPNext Support
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
     ١. إحصائيات الدعم الفني
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-issues",
      short: "OPEN",
      labelEn: "Open Tickets",
      labelAr: "التذاكر المفتوحة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Issue",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "work-in-progress",
      short: "PROG",
      labelEn: "In Progress",
      labelAr: "قيد المعالجة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Issue",
              filters: { status: "Replied" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "maintenance-visits",
      short: "VISIT",
      labelEn: "Maintenance Visits",
      labelAr: "زيارات الصيانة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Maintenance Visit" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "resolved-issues",
      short: "DONE",
      labelEn: "Resolved Tickets",
      labelAr: "التذاكر المغلقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Issue",
              filters: { status: "Closed" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الاختصارات السريعة (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { doctype: "Issue", labelEn: "Issue", labelAr: "تذكرة دعم" },
    { doctype: "Maintenance Visit", labelEn: "Maintenance Visit", labelAr: "زيارة صيانة" },
    { doctype: "Service Level Agreement", labelEn: "Service Level Agreement", labelAr: "اتفاقية مستوى الخدمة" }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Issues",
          "🎫",
          [
            "Issue",
            "Issue Type",
            "Issue Priority"
          ]
        ],
        [
          "Maintenance",
          "🛠️",
          [
            "Maintenance Schedule",
            "Maintenance Visit"
          ]
        ],
        [
          "Service Level Agreement",
          "📜",
          [
            "Service Level Agreement"
          ]
        ],
        [
          "Warranty",
          "🛡️",
          [
            "Warranty Claim",
            "Serial No"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Support Settings"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "First Response Time for Issues"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Support Settings"
  ]);

  const treeDocs = new Set([]);

  const reportNames = new Set([
    "First Response Time for Issues"
  ]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي مع اعتماد 'منتج/منتجات')
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Issues": "تذاكر الدعم والشكاوى",
    "Maintenance": "الصيانة",
    "Service Level Agreement": "اتفاقيات مستوى الخدمة (SLA)",
    "Warranty": "الضمان والأرقام التسلسلية",
    "Settings": "الإعدادات",
    "Reports": "التقارير",

    "Issue": "تذاكر الدعم",
    "Issue Type": "أنواع التذاكر",
    "Issue Priority": "أولويات التذاكر",

    "Maintenance Schedule": "جدول الصيانة",
    "Maintenance Visit": "زيارات الصيانة",

    "Warranty Claim": "مطالبات الضمان",
    "Serial No": "الأرقام التسلسلية للمنتجات",

    "Support Settings": "إعدادات الدعم الفني",
    "First Response Time for Issues": "وقت الاستجابة الأول للتذاكر"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Issue": {
      icon: "🎫",
      summaryAr: "تسجيل تذاكر وبلاغات الدعم الفني والشكاوى الواردة من العملاء ومتابعة مسار حلها حتى الإغلاق.",
      summaryEn: "Support ticket management: record client inquiries, defects, priority levels, and resolution status.",
      stepsAr: ["تسجيل التذكرة وتحديد العميل والموضوع والنوع والأولوية", "إسناد التذكرة لفريق أو مهندس الدعم الفني المختص", "التواصل مع العميل وتوثيق الحل وإغلاق التذكرة بعد تأكيد الرضا"],
      stepsEn: ["Create ticket linked to customer, category, and priority", "Assign ticket to specialized support engineer", "Communicate resolution steps and close ticket after customer confirmation"]
    },
    "Issue Type": {
      icon: "🏷️",
      summaryAr: "تصنيف وتوصيف أنواع مشاكل واستفسارات الدعم (أعطال فنية، برمجية، استفسار، شكوى فواتير) لتوجيهها للقسم المختص.",
      summaryEn: "Categorize support issues (technical, billing, inquiry, hardware defect) to automate department routing.",
      stepsAr: ["إدخال مسمى نوع التذكرة وإضافة وصف مختصر", "ربطه بمجموعة الدعم الفني المسؤولة افتراضياً", "استخدامه في فلترة وتحليل مصادر الشكاوى المتكررة"],
      stepsEn: ["Name ticket category and provide description", "Assign default support group or technician tier", "Analyze recurring issue trends by category"]
    },
    "Issue Priority": {
      icon: "⚡",
      summaryAr: "تحديد مستويات أولوية وأهمية التذاكر (عاجل جداً، مرتفع، متوسط، منخفض) لضبط أوقات الاستجابة والحل.",
      summaryEn: "Define issue severity levels (critical, high, medium, low) to enforce response and resolution SLAs.",
      stepsAr: ["تسمية مستوى الأولوية وتحديد وزنه وترتيبه", "ربطه بأزمنة الاستجابة القصوى المسموحة", "تطبيقه على التذاكر لترتيب أولويات فرق الدعم الفني"],
      stepsEn: ["Name priority level and define escalation weight", "Associate priority with SLA turnaround expectations", "Sort incoming ticket queues based on assigned priority"]
    },

    "Maintenance Schedule": {
      icon: "🗓️",
      summaryAr: "إدارة خطط وجداول الصيانة الوقائية والدورية للمنتجات والأجهزة الموردة للعملاء لتقليل الأعطال.",
      summaryEn: "Preventive and periodic maintenance scheduling for delivered customer products and equipment.",
      stepsAr: ["اختيار العميل وتحديد المنتجات المشمولة بالصيانة", "تحديد جدول الزيارات الميدانية وتواريخ الاستحقاق", "توليد أوامر وزيارات الصيانة آلياً قبل حلول الموعد"],
      stepsEn: ["Select customer and specify covered product equipment", "Define visit frequency and calendar schedule", "Auto-generate maintenance visits prior to service due dates"]
    },
    "Maintenance Visit": {
      icon: "🧰",
      summaryAr: "توثيق زيارات الدعم الفني والصيانة الميدانية في موقع العميل وتسجيل قطع الغيار والمنتجات البديلة المستهلكة.",
      summaryEn: "Document on-site customer service visits, technician labor logs, diagnostics, and replaced parts.",
      stepsAr: ["إنشاء الزيارة وتحديد المهندس المكلف وتاريخ الزيارة", "تسجيل الفحوصات الفنية وقطع الغيار والمنتجات المستهلكة", "اعتماد توقيع العميل على محضر إتمام الزيارة"],
      stepsEn: ["Create visit record linked to ticket or schedule", "Log technical diagnostics, repair actions, and consumed product parts", "Obtain client digital signature and complete visit report"]
    },

    "Service Level Agreement": {
      icon: "📜",
      summaryAr: "اتفاقيات مستوى الخدمة (SLA)؛ تحديد أوقات الاستجابة الأولى القصوى والمدد الزمنية لحل التذاكر حسب الأولوية.",
      summaryEn: "Service Level Agreements (SLAs): define guaranteed first response and resolution timeframes per priority.",
      stepsAr: ["تسمية اتفاقية مستوى الخدمة وتحديد ساعات العمل الرسمية", "ضبط الحد الأقصى لساعات الاستجابة الأولى وساعات الحل لكل أولوية", "ربط الاتفاقية بفئات العملاء أو عقود الدعم الفني"],
      stepsEn: ["Name SLA policy and define business hours / holidays", "Set maximum allowed response and resolution hours per priority tier", "Assign SLA policy to customer groups, tiers, or contracts"]
    },

    "Warranty Claim": {
      icon: "🛡️",
      summaryAr: "استقبال والتحقق من مطالبات الضمان للمنتجات المباعة وفحص سريان فترة الضمان ومبررات الاستبدال.",
      summaryEn: "Register and validate product warranty claims against serial numbers and warranty validity terms.",
      stepsAr: ["تسجيل المطالبة وتحديد العميل والمنتج والرقم التسلسلي", "التحقق من سريان فترة الضمان وشروط الاستحقاق النظامية", "اعتماد قرار الإصلاح المجاني، الاستبدال، أو رفض المطالبة مع ذكر السبب"],
      stepsEn: ["Register claim linked to customer and product serial number", "Validate active warranty coverage and policy terms", "Approve complimentary repair, product replacement, or issue documented rejection"]
    },
    "Serial No": {
      icon: "🔢",
      summaryAr: "إدارة سجلات الأرقام التسلسلية الفريدة لكل منتج تم تصنيعه أو شراؤه أو بيعه وتتبع تاريخ صيانته وضمانه.",
      summaryEn: "Unique serial number tracking per individual product unit, tracking warranty status and service history.",
      stepsAr: ["توليد أو إدخال الرقم التسلسلي الخاص بكل منتج", "ربطه برقم فاتورة الشراء أو أمر تصنيع المنتج", "استعراض السجل الكامل لحركات وضمان وصيانة هذا المنتج"],
      stepsEn: ["Generate or enter individual product serial number", "Link serial record to purchase receipt or manufacturing work order", "Track lifetime transaction, delivery, warranty, and repair timeline for unit"]
    },

    "Support Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة لمنظومة الدعم الفني؛ تشمل ربط صندوق البريد الموحد لتوليد التذاكر آلياً، وقواعد التصعيد.",
      summaryEn: "Support module configuration: support email inbox sync, automatic ticket creation, and escalation workflows.",
      stepsAr: ["ضبط ربط البريد الإلكتروني الموحد للدعم الفني (Support Email)", "تحديد اتفاقية مستوى الخدمة (SLA) الافتراضية للنظام", "تفعيل قواعد التصعيد التلقائي عند تأخر الاستجابة وحفظ الإعدادات"],
      stepsEn: ["Configure incoming support mailbox for auto-ticket creation", "Set global default Service Level Agreement (SLA)", "Enable automated escalation notifications for breached response times and save"]
    }
  };

  /* ─────────────────────────────────────────
     ٧. الدوال المساعدة
  ───────────────────────────────────────── */

  function translate(key) {
    if (!isArabic) return key;
    return translations[key] || key;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(isArabic ? "ar-SA" : "en-US");
  }

  /* ─────────────────────────────────────────
     ٨. نافذة التفاصيل المنبثقة (Info Modal القياسية)
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
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

    overlay.innerHTML = `
      <div class="erp-modal-box">
        <button type="button" class="erp-modal-close" data-modal-close aria-label="${isArabic ? "إغلاق" : "Close"}">✕</button>
        <div class="erp-modal-header">
          <span class="erp-modal-icon">${desc?.icon || "📄"}</span>
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
            <span class="erp-quick-label">${isArabic ? "فتح الشاشة" : "Open Screen"}</span>
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
     ٩. إنشاء بطاقات الإحصائيات
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    statsSection.innerHTML = `
      <div class="erp-stats-grid">
        ${statsCards.map(c => `
          <div class="erp-stat-card" data-stat-id="${c.id}">
            <div class="erp-stat-icon">${c.short}</div>
            <div class="erp-stat-info">
              <span class="erp-stat-label">${escapeHtml(isArabic ? c.labelAr : c.labelEn)}</span>
              <span class="erp-stat-value" data-stat-value>—</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    statsCards.forEach(c => {
      c.fetch().then(val => {
        const el = statsSection.querySelector(`[data-stat-id="${c.id}"] [data-stat-value]`);
        if (el) {
          el.textContent = formatNumber(val);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الاختصارات السريعة
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "اختصارات سريعة" : "Quick Actions";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
        ${quickActionButtons.map(btn => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}">
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      frappe.new_doc(btn.dataset.btnAction);
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الوحدات والمربعات
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
     ١٢. إنشاء الفوتر
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
     ١٣. التوجيه وفتح الشاشات داخل النظام
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
    if (treeDocs.has(name)) {
      frappe.set_route("Tree", name);
      return;
    }
    frappe.set_route("List", name);
  }

  /* ─────────────────────────────────────────
     ١٤. معالجة الأحداث والضغط
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
     ١٥. بدء التشغيل
  ───────────────────────────────────────── */

  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();
})();
