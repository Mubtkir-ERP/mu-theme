(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة وتقييم الأداء — Performance Workspace
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
     ١. أزرار الوصول السريع (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "Appraisal", labelAr: "تقييمات الأداء", doctype: "Appraisal", hasCount: true, countSuffixEn: "Pending", countSuffixAr: "معلق", color: "#f59e0b" },
    { labelEn: "Employee Performance Feedback", labelAr: "ملاحظات الأداء", doctype: "Employee Performance Feedback", hasCount: true, color: "#64748b" },
    { labelEn: "Goal", labelAr: "الأهداف الفردية", doctype: "Goal", hasCount: true, color: "#10b981" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Transactions",
      [
        [
          "Masters",
          "🎯",
          [
            "Appraisal Template",
            "KRA",
            "Employee Feedback Criteria"
          ]
        ],
        [
          "Appraisal",
          "⭐",
          [
            "Appraisal",
            "Appraisal Cycle",
            "Employee Performance Feedback",
            "Goal"
          ]
        ],
        [
          "Energy Points",
          "⚡",
          [
            "Energy Point Rule",
            "Energy Point Settings",
            "Energy Point Log"
          ]
        ],
        [
          "Promotion",
          "📈",
          [
            "Employee Promotion"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Appraisal Overview"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Energy Point Settings"
  ]);

  const treeDocs = new Set([]);

  // التقارير المستثناة من زر التفاصيل
  const reportNames = new Set([
    "Appraisal Overview"
  ]);

  const customRoutes = {};

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Your Shortcuts": "اختصاراتك السريعة",
    "Masters & Transactions": "البيانات والمعاملات الرئيسية",

    "Masters": "البيانات الأساسية والمعايير",
    "Appraisal Template": "قالب تقييم الأداء",
    "KRA": "مجالات النتائج الرئيسية (KRA)",
    "Employee Feedback Criteria": "معايير تقييم الموظف",

    "Appraisal": "تقييم الأداء",
    "Appraisal Cycle": "دورة تقييم الأداء",
    "Employee Performance Feedback": "تقييم وملاحظات أداء الموظف",
    "Goal": "الأهداف الفردية والمهنية",

    "Energy Points": "نقاط الطاقة والتحفيز",
    "Energy Point Rule": "قواعد نقاط الطاقة",
    "Energy Point Settings": "إعدادات نقاط الطاقة",
    "Energy Point Log": "سجل حركات نقاط الطاقة",

    "Promotion": "الترقيات الوظيفية",
    "Employee Promotion": "ترقية الموظف",

    "Reports": "التقارير",
    "Appraisal Overview": "نظرة عامة على تقييمات الأداء"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Appraisal Template": {
      icon: "📋",
      summaryAr: "تصميم وتحديد أوزان ونسب عناصر التقييم ومعايير الأداء ومجالات النتائج KRA لكل فئة وظيفية.",
      summaryEn: "Design performance appraisal forms, weighting ratios, and scoring rubrics per role.",
      stepsAr: ["إنشاء قالب تقييم وتحديد المسمى الوظيفي المستهدف", "إضافة مجالات النتائج (KRAs) ومعايير التقييم والوزن النسبي", "حفظ القالب لاستخدامه في دورات التقييم الدورية"],
      stepsEn: ["Create appraisal template mapped to target designation", "Add Key Result Areas (KRAs), rating metrics, and weights", "Save template to govern annual/periodic appraisal cycles"]
    },
    "KRA": {
      icon: "🎯",
      summaryAr: "تعريف مجالات النتائج الرئيسية (Key Result Areas) ومؤشرات الإنجاز الأساسية لقياس إنتاجية الموظف.",
      summaryEn: "Define Key Result Areas (KRAs) and critical productivity benchmarks for employee roles.",
      stepsAr: ["إدخال مسمى مجال النتيجة والوصف الإداري للمستهدف", "تحديد معايير قياس النجاح والإنجاز", "حفظ KRA لربطها بقوالب التقييم والأهداف الفردية"],
      stepsEn: ["Enter KRA title and narrative expectation description", "Define success criteria and milestone measurement criteria", "Save KRA to integrate into performance forms and goals"]
    },
    "Employee Feedback Criteria": {
      icon: "⭐",
      summaryAr: "تحديد معايير تقييم الكفاءات السلوكية والمهنية (العمل الجماعي، القيادة، حل المشكلات، الالتزام).",
      summaryEn: "Define 360-degree competency feedback metrics (teamwork, leadership, problem solving).",
      stepsAr: ["إدخال اسم معيار التقييم السلوكي أو المهني", "تحديد مقياس الدرجات وشرح مستويات الأداء (ضعيف، ممتاز)", "حفظ المعيار لاستخدامه في استطلاعات التقييم 360 درجة"],
      stepsEn: ["Enter feedback metric title and competency definition", "Configure rating scale definitions (Needs Improvement to Exceptional)", "Save criterion to evaluate peers and subordinates"]
    },

    "Appraisal": {
      icon: "⭐",
      summaryAr: "نموذج تقييم الأداء الدوري للموظف؛ رصد درجات الإنجاز الذاتي وتقييم المدير المباشر والدرجة النهائية.",
      summaryEn: "Periodic employee appraisal document logging self-ratings, supervisor scores, and final rating.",
      stepsAr: ["فتح سجل التقييم المرتبط بالموظف ودورة التقييم الحالية", "رصد درجات تقييم الأهداف ومجالات النتائج KRA", "اعتماد التقييم وحساب النسبة الإجمالية وترحيلها لملف الموظف"],
      stepsEn: ["Open active appraisal form for target employee and cycle", "Score achievements against assigned goals and KRA weights", "Submit appraisal to calculate composite rating and archive"]
    },
    "Appraisal Cycle": {
      icon: "🔄",
      summaryAr: "إدارة وإطلاق دورات تقييم الأداء (سنوية، نصف سنوية، ربع سنوية) وتحديد المواعيد النهائية للتقييم.",
      summaryEn: "Manage organizational appraisal campaign cycles (annual, quarterly) and submission deadlines.",
      stepsAr: ["إنشاء دورة تقييم وتحديد الشركة والسنة المالية وفترة التقييم", "تحديد تاريخ بدء وانتهاء تقديم التقييمات الذاتية وتغذية المديرين", "إطلاق الدورة لتوليد نماذج التقييم تلقائياً لكافة الموظفين"],
      stepsEn: ["Create appraisal cycle defining fiscal dates and review period", "Set submission cut-off deadlines for self and manager ratings", "Launch cycle to generate appraisal forms across eligible staff"]
    },
    "Employee Performance Feedback": {
      icon: "💬",
      summaryAr: "توثيق التقييمات الراجعة وملاحظات الأداء الدورية (360 درجة) من الزملاء والمرؤوسين والمديرين.",
      summaryEn: "Log ongoing performance feedback, peer reviews, and supervisor check-in coaching notes.",
      stepsAr: ["إنشاء نموذج تغذية راجعة واختيار الموظف والمقيم", "رصد الملاحظات ونقاط القوة وفرص التحسين والتطوير", "حفظ التغذية لدمجها تلقائياً في التقييم النهائي للموظف"],
      stepsEn: ["Create feedback record selecting employee and reviewer", "Document constructive feedback, strengths, and coaching opportunities", "Save feedback to integrate into performance review dossiers"]
    },
    "Goal": {
      icon: "🏆",
      summaryAr: "تحديد ومتابعة الأهداف الذكية (OKRs / Goals) الفردية للموظف ونسب الإنجاز المحققة مرحلياً.",
      summaryEn: "Set and track employee Individual SMART Goals / OKRs and progressive milestone percentage.",
      stepsAr: ["إنشاء هدف جديد للموظف وتحديد العنوان والمستهدف الكمي", "تحديد تاريخ الاستحقاق والوزن النسبي للهدف", "تحديث نسبة الإنجاز دورياً حتى تحقيق الهدف بالكامل"],
      stepsEn: ["Create SMART goal specifying quantitative target and KPIs", "Set completion due date and assigned weight percentage", "Update progress percentage progressively until full achievement"]
    },

    "Energy Point Rule": {
      icon: "⚡",
      summaryAr: "بناء قواعد منح نقاط التحفيز التلقائية (Energy Points) للموظفين عند إنجاز المهام وإغلاق الطلبات.",
      summaryEn: "Configure gamified energy point automation rules awarded upon task and document completions.",
      stepsAr: ["إنشاء قاعدة نقاط وتحديد المستند والحدث المشغل (مثل إغلاق تذكرة دعم)", "تحديد عدد النقاط الممنوحة وشروط الاستحقاق", "تفعيل القاعدة لبدء احتساب النقاط للموظفين تلقائياً"],
      stepsEn: ["Create rule, selecting monitored DocType and trigger condition", "Set point allocation value and employee user reference field", "Enable rule to auto-award points upon successful actions"]
    },
    "Energy Point Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الضبط العام لنظام نقاط الطاقة والتحفيز؛ تفعيل لوحة الشرف، وحدود النقاط اليومية وسياسات التقدير.",
      summaryEn: "Global gamification settings: leaderboards, daily point caps, point transfer policies, and badges.",
      stepsAr: ["تفعيل أو تعطيل نظام نقاط الطاقة على مستوى المنشأة", "تحديد الحد الأقصى للنقاط الممكن منحها بين الزملاء", "تفعيل لوحة المتصدرين وتحديث الإعدادات"],
      stepsEn: ["Enable or disable system-wide gamification features", "Configure daily peer-to-peer appreciation point limits", "Enable desk leaderboard and save preferences"]
    },
    "Energy Point Log": {
      icon: "📋",
      summaryAr: "سجل تاريخي يوثق كافة النقاط الممنوحة والمخصومة للموظفين وتفاصيل العمليات المرتبطة بها.",
      summaryEn: "Ledger recording all points awarded, deducted, or transferred per employee transaction.",
      stepsAr: ["استعراض حركات النقاط لمتابعة تفاعل ونشاط الموظفين", "التحقق من أسباب منح النقاط والمستندات المشغلة", "مراجعة لوحة المتصدرين وتكريم الموظفين الأكثر تميزاً"],
      stepsEn: ["Review audit trail of earned and awarded incentive points", "Verify triggering transaction context and performance reasons", "Monitor organization leaderboard to reward top performers"]
    },

    "Employee Promotion": {
      icon: "📈",
      summaryAr: "توثيق واعتماد الترقية الوظيفية للموظف وتعديل المسمى والدرجة والراتب مع حفظ الأرشيف التاريخي.",
      summaryEn: "Process official employee promotions, salary revisions, and grade/designation elevation.",
      stepsAr: ["إنشاء معاملة ترقية جديدة وتحديد الموظف المرشح", "تحديد المسمى الوظيفي الجديد والدرجة وسلم الراتب المعدل", "اعتماد الترقية لتحديث بطاقة الموظف وهيكل راتبه تلقائياً"],
      stepsEn: ["Initiate promotion record linked to eligible employee", "Specify new designation, revised salary grade, and effective date", "Submit promotion to dynamically update employee master record"]
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

  function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(isArabic ? "ar-SA" : "en-US");
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

    const title = isArabic ? "اختصاراتك السريعة" : "Your Shortcuts";

    quickActions.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-quick-grid">
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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(245, 158, 11, 0.12); color: #d97706;">...</span>` : ""}
            </button>`;
        }).join("")}
      </div>
    `;

    // جلب أعداد المستندات للأزرار
    quickActionButtons.forEach(btn => {
      if (btn.hasCount && btn.doctype && window.frappe) {
        frappe.call({
          method: "frappe.client.get_count",
          args: { doctype: btn.doctype },
          callback: r => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) {
              const val = formatNumber(r.message || 0);
              const suffix = btn.countSuffixEn ? (isArabic ? (" " + btn.countSuffixAr) : (" " + btn.countSuffixEn)) : "";
              el.textContent = val + suffix;
            }
          },
          error: () => {
            const el = quickActions.querySelector(`[data-badge-for="${btn.doctype}"]`);
            if (el) el.textContent = "0";
          }
        });
      }
    });

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
