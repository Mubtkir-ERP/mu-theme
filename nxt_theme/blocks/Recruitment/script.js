(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم التوظيف والتعيين — Recruitment Workspace
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
     ١. أزرار الوصول السريع والبطاقات العلوية
  ───────────────────────────────────────── */

  const quickActionButtons = [
    { labelEn: "Interviews (This Week)", labelAr: "المقابلات (هذا الأسبوع)", doctype: "Interview", isList: true, color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Jobs",
          "💼",
          [
            "Staffing Plan",
            "Job Requisition",
            "Job Opening",
            "Job Applicant",
            "Job Offer",
            "Employee Referral"
          ]
        ],
        [
          "Interviews",
          "🎙️",
          [
            "Interview Type",
            "Interview Round",
            "Interview",
            "Interview Feedback"
          ]
        ],
        [
          "Appointment",
          "📜",
          [
            "Appointment Letter Template",
            "Appointment Letter"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Recruitment Analytics"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([]);

  const treeDocs = new Set([]);

  // التقارير المستثناة من زر التفاصيل
  const reportNames = new Set([
    "Recruitment Analytics"
  ]);

  const customRoutes = {};

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Masters & Reports": "البيانات والتقارير",
    "Interviews (This Week)": "المقابلات (هذا الأسبوع)",

    "Jobs": "الوظائف والفرص",
    "Staffing Plan": "خطة التوظيف السنوية",
    "Job Requisition": "طلب استقطاب وظيفي",
    "Job Opening": "الوظائف الشاغرة",
    "Job Applicant": "المتقدمون للوظائف",
    "Job Offer": "عروض العمل",
    "Employee Referral": "ترشيحات وتوصيات الموظفين",

    "Interviews": "المقابلات الشخصية",
    "Interview Type": "نوع المقابلة",
    "Interview Round": "جولة المقابلة",
    "Interview": "المقابلة الشخصية",
    "Interview Feedback": "تقييم وملاحظات المقابلة",

    "Appointment": "التعيين ومباشرة العمل",
    "Appointment Letter Template": "قالب خطاب التعيين",
    "Appointment Letter": "خطاب التعيين",

    "Reports": "التقارير",
    "Recruitment Analytics": "تحليلات وإحصاءات التوظيف"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Staffing Plan": {
      icon: "📋",
      summaryAr: "تخطيط الاحتياج الوظيفي السنوي وتحديد الميزانية والشواغر المعتمدة لكل قسم وإدارة.",
      summaryEn: "Annual workforce staffing budget and headcount planning per department and designation.",
      stepsAr: ["اختيار الشركة والسنة المالية وتحديد الأقسام المستهدفة", "تحديد عدد الشواغر المعتمدة والميزانية التقديرية للرواتب", "اعتماد الخطة لتكون مرجعاً لطلبات وإعلانات التوظيف"],
      stepsEn: ["Select company and fiscal year for headcount plan", "Define authorized vacancies and estimated payroll budget", "Submit staffing plan to govern future job openings"]
    },
    "Job Requisition": {
      icon: "📝",
      summaryAr: "طلب داخلي يقدمه مدير القسم لطلب استقطاب وتعيين موظف جديد لشغل شاغر معتمد.",
      summaryEn: "Internal department request to initiate recruitment for an approved job vacancy.",
      stepsAr: ["تحديد القسم والمسمى الوظيفي وسبب طلب التوظيف", "تحديد المؤهلات والخبرات المطلوبة والعدد", "إرسال الطلب لاعتماد إدارة الموارد البشرية والبدء في الإعلان"],
      stepsEn: ["Specify department, required designation, and hiring justification", "Define qualifications, experience years, and candidate count", "Submit requisition for HR approval to trigger job opening"]
    },
    "Job Opening": {
      icon: "📢",
      summaryAr: "إدارة ونشر الوظائف الشاغرة وتحديد الشروط والمزايا ونشرها على بوابة التوظيف الإلكترونية.",
      summaryEn: "Manage open job vacancies, specifications, perks, and publish to career portal.",
      stepsAr: ["إنشاء إعلان وظيفة شاغرة وربطه بخطة التوظيف", "كتابة متطلبات الوظيفة وتحديد تاريخ إغلاق التقديم", "تفعيل ونشر الوظيفة لاستقبال السير الذاتية"],
      stepsEn: ["Create job opening linked to approved staffing plan", "Outline qualifications, competencies, and application deadline", "Publish vacancy to job board to capture applicant resumes"]
    },
    "Job Applicant": {
      icon: "👤",
      summaryAr: "سجل بيانات المتقدمين للوظائف وفرز وتصنيف السير الذاتية ومتابعة مراحل التقييم والقبول.",
      summaryEn: "Candidate applicant tracking repository: manage resumes, screening status, and hiring stages.",
      stepsAr: ["تسجيل بيانات المتقدم ورفع السيرة الذاتية (CV)", "مراجعة وتصنيف حالة المتقدم (مطابق، قيد الفرز، مرفوض)", "جدولة المقابلات الشخصية للمرشحين المتأهلين"],
      stepsEn: ["Register applicant profile and attach resume document", "Screen and update applicant status (Shortlisted, Rejected)", "Advance qualified candidates to interview scheduling stage"]
    },
    "Job Offer": {
      icon: "📄",
      summaryAr: "إعداد عروض العمل الرسمية للمرشحين المختارين متضمنة تفاصيل الراتب الأساسي والبدلات والمزايا.",
      summaryEn: "Generate formal job offers for selected candidates detailing base compensation, allowances, and perks.",
      stepsAr: ["إنشاء عرض عمل جديد واختيار المرشح والوظيفة المعروضة", "تحديد تفاصيل الراتب والبدلات والمزايا وتاريخ المباشرة المتوقع", "اعتماد وإرسال العرض للمرشح ومتابعة الرد بالقبول"],
      stepsEn: ["Create job offer linked to selected job applicant", "Specify salary structure, allowances, benefits, and joining date", "Submit and email offer letter to candidate for acceptance"]
    },
    "Employee Referral": {
      icon: "🤝",
      summaryAr: "تسجيل ترشيحات وتوصيات موظفي المنشأة لمرشحين خارجيين وصرف مكافآت التوصية عند التعيين.",
      summaryEn: "Track internal employee talent referrals and process referral incentive bonuses upon hiring.",
      stepsAr: ["تسجيل بيانات الموظف الموصي وبيانات المرشح والوظيفة", "متابعة مسار تعيين المرشح في مراحل التوظيف", "اعتماد صرف مكافأة التوصية للموظف بعد اجتياز فترة التجربة"],
      stepsEn: ["Log referring employee details and candidate profile", "Track candidate recruitment progress through the pipeline", "Authorize referral bonus disbursement upon candidate onboarding"]
    },

    "Interview Type": {
      icon: "🏷️",
      summaryAr: "تعريف وتصنيف أنواع المقابلات الوظيفية (مقابلة أولية، مقابلة فنية، مقابلة الموارد البشرية).",
      summaryEn: "Define interview categories (HR screening, Technical assessment, Executive panel).",
      stepsAr: ["إدخال مسمى نوع المقابلة وتحديد معاييرها", "تحديد الهدف من المرحلة ونموذج التقييم المناسب", "حفظ النوع لاستخدامه في جولات المقابلات"],
      stepsEn: ["Enter interview type title and focus domain", "Define evaluation objectives and scoring rubric", "Save type to reference in interview rounds"]
    },
    "Interview Round": {
      icon: "🎯",
      summaryAr: "هيكلة مراحل وجولات المقابلات وتعيين أعضاء لجنة المقابلات والوزن النسبي لكل مرحلة.",
      summaryEn: "Structure sequential interview stages and assign evaluation panels and scoring weights.",
      stepsAr: ["إنشاء جولة مقابلة وتحديد نوعها والوظيفة المستهدفة", "تحديد أعضاء لجنة المقابلة من المشرفين والمختصين", "حفظ الجولة لجدولة المرشحين بناءً عليها"],
      stepsEn: ["Create interview round, linking type and target position", "Assign designated interviewer panelists and evaluation rubrics", "Save round to schedule applicant assessment sessions"]
    },
    "Interview": {
      icon: "🎙️",
      summaryAr: "جدولة وتوثيق المقابلات الشخصية مع المرشحين وتحديد الموعد والمكان ورابط الاتصال المرئي.",
      summaryEn: "Schedule and manage interview sessions, setting date, physical room, or virtual meeting link.",
      stepsAr: ["إنشاء موعد مقابلة جديد واختيار المتقدم والجولة واللجنة", "تحديد التاريخ والوقت ومكان الانعقاد أو رابط الاجتماع", "إرسال الدعوة للمرشح والمحاورين وتوثيق الحضور"],
      stepsEn: ["Create interview record, selecting candidate, round, and panel", "Set scheduled date, time, and room or online conference link", "Dispatch automated calendar invites to candidate and interviewers"]
    },
    "Interview Feedback": {
      icon: "📝",
      summaryAr: "تسجيل تقييمات وملاحظات أعضاء لجنة المقابلات وتدوين الدرجات والقرار النهائي للمرشح.",
      summaryEn: "Log panelist assessment scores, written feedback, and final hiring recommendations.",
      stepsAr: ["فتح سجل التقييم المرتبط بالمقابلة المنعقدة", "رصد درجات المرشح في الكفاءات والمهارات الفنية والسلوكية", "تسجيل التوصية النهائية (يوصى بالتعيين، احتياط، مرفوض)"],
      stepsEn: ["Open evaluation feedback form linked to completed interview", "Score candidate competencies across technical and soft skills", "Submit final recommendation (Hire, Hold, Reject)"]
    },

    "Appointment Letter Template": {
      icon: "📑",
      summaryAr: "تصميم وإدارة نماذج خطابات التعيين المعتمدة والشروط والأحكام ودمج بنود العقد آلياً.",
      summaryEn: "Standard employment contract templates and appointment offer letter boilerplate layouts.",
      stepsAr: ["إنشاء قالب خطاب تعيين جديد وإدخال نصوص البنود القانونية", "إدراج المتغيرات التلقائية (اسم الموظف، المسمى، الراتب)", "حفظ القالب لاستخدامه في توليد خطابات التعيين الرسمية"],
      stepsEn: ["Draft contract template incorporating standard legal clauses", "Embed dynamic merge tags (Employee Name, Title, Salary)", "Save template for generating standardized appointment letters"]
    },
    "Appointment Letter": {
      icon: "📜",
      summaryAr: "إصدار خطابات التعيين الرسمية للموظفين الجدد وتوثيق توقيع الطرفين وبدء إجراءات مباشرة العمل.",
      summaryEn: "Issue binding appointment letters to accepted candidates confirming joining terms and start date.",
      stepsAr: ["إنشاء خطاب تعيين واختيار المرشح المقبول وقالب الخطاب", "مراجعة بنود العقد والراتب وتاريخ مباشرة العمل الفعلي", "اعتماد الخطاب وطباعته أو إرساله للتوقيع الإلكتروني"],
      stepsEn: ["Create appointment letter referencing candidate and template", "Verify compensation terms, probation period, and official start date", "Submit and print or dispatch for digital signature"]
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
      <div class="erp-quick-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-bottom: 24px;">
        ${quickActionButtons.map((btn, idx) => {
          const label = isArabic ? btn.labelAr : btn.labelEn;
          return `
            <button
              type="button"
              class="erp-quick-btn"
              data-shortcut-idx="${idx}"
              style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px;"
            >
              <span class="erp-quick-label" style="display: flex; align-items: center; gap: 8px;">
                <span>${escapeHtml(label)}</span>
                <span class="erp-link-arrow" aria-hidden="true" style="font-size: 11px; opacity: 0.7;">↗</span>
              </span>
              <span style="font-size: 12px; color: var(--text-muted, #64748b);">${isArabic ? "عرض القائمة" : "View List"}</span>
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
