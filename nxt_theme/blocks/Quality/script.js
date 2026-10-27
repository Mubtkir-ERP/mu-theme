(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة الجودة — ERPNext Quality
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
     ١. إحصائيات الجودة
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "goals",
      short: "GOAL",
      labelEn: "Quality Goals",
      labelAr: "أهداف الجودة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Quality Goal" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "inspections",
      short: "INSP",
      labelEn: "Inspections",
      labelAr: "عمليات فحص الجودة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Quality Inspection" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "non-conformances",
      short: "NCR",
      labelEn: "Non Conformances",
      labelAr: "حالات عدم المطابقة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Non Conformance",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "actions",
      short: "ACT",
      labelEn: "Quality Actions",
      labelAr: "الإجراءات التصحيحية",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Quality Action",
              filters: { status: "Open" }
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
    { doctype: "Quality Goal", labelEn: "Quality Goal", labelAr: "هدف الجودة" },
    { doctype: "Quality Procedure", labelEn: "Quality Procedure", labelAr: "إجراء الجودة" },
    { doctype: "Quality Inspection", labelEn: "Quality Inspection", labelAr: "فحص الجودة" },
    { doctype: "Quality Review", labelEn: "Quality Review", labelAr: "مراجعة الجودة" },
    { doctype: "Quality Action", labelEn: "Quality Action", labelAr: "إجراء الجودة" },
    { doctype: "Non Conformance", labelEn: "Non Conformance", labelAr: "عدم مطابقة" }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Goal and Procedure",
          "🎯",
          [
            "Quality Goal",
            "Quality Procedure",
            "Tree of Procedures"
          ]
        ],
        [
          "Feedback",
          "💬",
          [
            "Quality Feedback",
            "Quality Feedback Template"
          ]
        ],
        [
          "Meeting",
          "🤝",
          [
            "Quality Meeting"
          ]
        ],
        [
          "Review and Action",
          "🛡️",
          [
            "Non Conformance",
            "Quality Review",
            "Quality Action"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const treeDocs = new Set([
    "Tree of Procedures"
  ]);

  const reportNames = new Set([]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي)
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Goal and Procedure": "الأهداف والإجراءات",
    "Feedback": "الملاحظات والتقييمات",
    "Meeting": "الاجتماعات",
    "Review and Action": "المراجعة والإجراءات",

    "Quality Goal": "أهداف الجودة",
    "Quality Procedure": "إجراءات الجودة",
    "Tree of Procedures": "شجرة إجراءات الجودة",

    "Quality Feedback": "ملاحظات الجودة",
    "Quality Feedback Template": "قوالب ملاحظات الجودة",

    "Quality Meeting": "اجتماعات الجودة",

    "Non Conformance": "حالات عدم المطابقة",
    "Quality Review": "مراجعات الجودة",
    "Quality Action": "إجراءات الجودة التصحيحية"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Quality Goal": {
      icon: "🎯",
      summaryAr: "تحديد مستهدفات ومؤشرات الجودة الاستراتيجية (KPIs) ومتابعة نسب تحقيقها دورياً.",
      summaryEn: "Define strategic quality objectives and key performance indicators (KPIs) to track progress.",
      stepsAr: ["تسمية هدف الجودة ومجال تطبيقه", "تحديد مؤشر القياس والنسبة المستهدفة وتاريخ الإنجاز", "متابعة نسب التنفيذ الدورية واعتماد الإنجاز"],
      stepsEn: ["Name quality objective and operational scope", "Define measurable target percentage and completion deadline", "Monitor periodic progress and log achievement milestones"]
    },
    "Quality Procedure": {
      icon: "📋",
      summaryAr: "توثيق إجراءات ومعايير التشغيل القياسية (SOP) وخطوات العمل الإلزامية لضمان ضبط الجودة.",
      summaryEn: "Document standard operating procedures (SOPs) and mandatory process workflows for quality control.",
      stepsAr: ["كتابة عنوان الإجراء والعملية التابع لها", "إدخال خطوات العمل بالتسلسل والمسؤوليات والوثائق المرجعية", "اعتماد الإجراء وتعميمه على فرق العمل المعنية"],
      stepsEn: ["Define procedure title and process scope", "Detail step-by-step tasks, roles, and reference documents", "Submit procedure and publish standard operating guidelines"]
    },
    "Tree of Procedures": {
      icon: "🌲",
      summaryAr: "عرض هيكلي شجري ينظم كافة إجراءات وسياسات الجودة حسب الأقسام والعمليات التشغيلية.",
      summaryEn: "Hierarchical tree structure organizing all enterprise quality procedures by department and function.",
      stepsAr: ["استعراض فروع وهيكل الإجراءات المعتمدة", "إضافة إجراءات جديدة تحت القسم أو العملية المناسبة", "تعديل التسلسل الهرمي للملفات والإجراءات"],
      stepsEn: ["Explore structural tree of approved operating procedures", "Create new sub-procedures within relevant parent nodes", "Reorganize organizational procedure hierarchy"]
    },

    "Quality Feedback": {
      icon: "💬",
      summaryAr: "تسجيل وتقييم ملاحظات وانطباعات العملاء أو الموظفين حول جودة المنتجات والخدمات المقدمة.",
      summaryEn: "Collect, evaluate, and action customer and employee feedback concerning product or service quality.",
      stepsAr: ["تسجيل بيانات المستفيد وقالب التقييم المستخدم", "رصد التقييمات والملاحظات التفصيلية لكل معيار", "تحليل التغذية الراجعة وتحويل الملاحظات الحرجة إلى إجراءات تصحيحية"],
      stepsEn: ["Select respondent and feedback template", "Record ratings and qualitative comments across evaluation criteria", "Analyze feedback and escalate critical concerns to quality actions"]
    },
    "Quality Feedback Template": {
      icon: "📝",
      summaryAr: "تصميم استبيانات ونماذج قياس الجودة ورضا العملاء الموحدة متضمنة معايير ومقاييس التقييم.",
      summaryEn: "Standardized questionnaire templates establishing evaluation criteria and rating scales for feedback.",
      stepsAr: ["تسمية قالب التقييم وتحديد الغرض منه", "إضافة أسئلة ومعايير القياس (مقياس 1-5 أو نعم/لا)", "حفظ القالب واستخدامه في جولات الفحص واستطلاعات الرأي"],
      stepsEn: ["Title evaluation template and define intended audience", "Add survey questions, evaluation parameters, and rating scales", "Save template to standardize feedback collection across teams"]
    },

    "Quality Meeting": {
      icon: "🤝",
      summaryAr: "تنظيم وتوثيق محاضر اجتماعات لجان ومراجعات الجودة الدورية لمناقشة الأداء وحالات عدم المطابقة.",
      summaryEn: "Schedule and document quality management review meetings, committee decisions, and action items.",
      stepsAr: ["جدولة الاجتماع وتحديد جدول الأعمال والحضور", "تدوين المداولات والملاحظات ومحضر الاجتماع", "إسناد القرارات والتكليفات ومتابعة تنفيذها في الاجتماع اللاحق"],
      stepsEn: ["Schedule review meeting, agenda topics, and attendees", "Record discussion minutes and committee findings", "Assign action items and review status in subsequent sessions"]
    },

    "Non Conformance": {
      icon: "⚠️",
      summaryAr: "تسجيل وتوثيق أي حيود أو خلل أو عدم مطابقة في المنتجات أو العمليات أو المواد الخام الموردة.",
      summaryEn: "Log process deviations, defective products, or supplier material non-conformances for containment.",
      stepsAr: ["تسجيل تقرير عدم المطابقة وتحديد المنتج أو العملية المتأثرة", "تحديد السبب الجذري ومستوى الخطورة (بسيط/حرج)", "اتخاذ إجراء العزل الفوري والرفع لإدارة الجودة للبت فيه"],
      stepsEn: ["Log non-conformance report specifying affected product or process", "Determine root cause and severity level (minor/critical)", "Enforce immediate containment and escalate for corrective action"]
    },
    "Quality Review": {
      icon: "🔍",
      summaryAr: "مراجعة دورية منتظمة للأهداف والإجراءات ومؤشرات الجودة للتأكد من فاعلية نظام إدارة الجودة.",
      summaryEn: "Periodic formal audits and reviews assessing procedure compliance, goal achievements, and system health.",
      stepsAr: ["إنشاء المراجعة وتحديد نطاق التدقيق والفترة", "تقييم مؤشرات الأداء وحالات الحيود المرصودة", "توثيق التوصيات والتحسينات الواجب اعتمادها"],
      stepsEn: ["Initiate audit review covering specific operational period", "Evaluate performance metrics and logged deviations", "Document management recommendations and continuous improvement plans"]
    },
    "Quality Action": {
      icon: "🛡️",
      summaryAr: "اتخاذ وتتبع الإجراءات التصحيحية والوقائية (CAPA) لمعالجة الأسباب الجذرية ومنع تكرار الأخطاء في المنتجات.",
      summaryEn: "Corrective and preventive action (CAPA) tracking to eliminate root causes and prevent recurrence.",
      stepsAr: ["ربط الإجراء بحالة عدم المطابقة أو تقرير المراجعة", "تحديد خطة العمل التصحيحية والوقائية والمسؤولين عنها", "التحقق من إتمام التنفيذ وقياس فاعلية الحل قبل الإغلاق النهائي"],
      stepsEn: ["Link CAPA to triggering non-conformance or audit finding", "Define corrective steps, preventive measures, and owners", "Verify implementation and test long-term effectiveness prior to closure"]
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
