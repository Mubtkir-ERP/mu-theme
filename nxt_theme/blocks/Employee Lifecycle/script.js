(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم دورة حياة الموظف — Employee Lifecycle Workspace
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
    { labelEn: "New Hires (This Month)", labelAr: "المعينون الجدد (هذا الشهر)", doctype: "Employee", isList: true, color: "#10b981" },
    { labelEn: "Exits (This Month)", labelAr: "المغادرون (هذا الشهر)", doctype: "Employee Separation", isList: true, color: "#ef4444" },
    { labelEn: "Trainings (This Week)", labelAr: "الدورات التدريبية (هذا الأسبوع)", doctype: "Training Event", isList: true, color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Onboarding",
          "🚀",
          [
            "Employee Onboarding Template",
            "Employee Onboarding",
            "Employee Skill Map"
          ]
        ],
        [
          "Grievance",
          "⚖️",
          [
            "Grievance Type",
            "Employee Grievance"
          ]
        ],
        [
          "Training",
          "🎓",
          [
            "Training Program",
            "Training Event",
            "Training Feedback",
            "Training Result"
          ]
        ],
        [
          "Daily Work Summary",
          "📝",
          [
            "Daily Work Summary",
            "Daily Work Summary Group",
            "Daily Work Summary Replies"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Employee Exits",
            "Employee Birthday",
            "Employee Information",
            "Employee Analytics"
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
    "Employee Exits",
    "Employee Birthday",
    "Employee Information",
    "Employee Analytics"
  ]);

  const customRoutes = {};

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Masters & Reports": "البيانات والتقارير",
    "New Hires (This Month)": "المعينون الجدد (هذا الشهر)",
    "Exits (This Month)": "المغادرون (هذا الشهر)",
    "Trainings (This Week)": "الدورات التدريبية (هذا الأسبوع)",

    "Onboarding": "تهيئة ومباشرة العمل",
    "Employee Onboarding Template": "قالب تهيئة الموظف الجديد",
    "Employee Onboarding": "إجراء تهيئة الموظف",
    "Employee Skill Map": "خريطة مهارات الموظف",

    "Grievance": "الشكاوى والتظلمات",
    "Grievance Type": "نوع التظلم والشكوى",
    "Employee Grievance": "شكاوى وتظلمات الموظفين",

    "Training": "التدريب والتطوير",
    "Training Program": "البرامج التدريبية",
    "Training Event": "فعالية أو دورة تدريبية",
    "Training Feedback": "تقييم المتدربين للدورة",
    "Training Result": "نتائج واجتياز التدريب",

    "Daily Work Summary": "ملخص العمل اليومي",
    "Daily Work Summary Group": "مجموعة ملخص العمل اليومي",
    "Daily Work Summary Replies": "ردود ملخص العمل اليومي",

    "Reports": "التقارير",
    "Employee Exits": "مغادرات واستقالات الموظفين",
    "Employee Birthday": "أعياد ميلاد الموظفين",
    "Employee Information": "معلومات وبيانات الموظفين",
    "Employee Analytics": "تحليلات وإحصاءات الموظفين"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Employee Onboarding Template": {
      icon: "📋",
      summaryAr: "بناء قوالب المهام والإجراءات المعتمدة لتهيئة الموظفين الجدد (تسليم الأجهزة، توقيع العقود، التدريب).",
      summaryEn: "Configure standardized onboarding task checklists (IT provisioning, contract signing, orientation).",
      stepsAr: ["إنشاء قالب جديد وتحديد الوظيفة أو القسم المستهدف", "إضافة قائمة المهام والأنشطة والمسؤول عن كل مهمة", "حفظ القالب لتطبيقه تلقائياً عند تعيين موظف جديد"],
      stepsEn: ["Create new onboarding template for specific designation", "Map orientation activities and assign responsible team members", "Save template to auto-trigger upon new hire creation"]
    },
    "Employee Onboarding": {
      icon: "🚀",
      summaryAr: "متابعة تنفيذ مهام تهيئة واستقبال الموظف الجديد ومراقبة إنجاز كافة متطلبات الانضمام للفريق.",
      summaryEn: "Track active new hire onboarding progression and checklist completion status across departments.",
      stepsAr: ["إنشاء إجراء تهيئة واختيار الموظف الجديد وقالب التهيئة", "متابعة إنجاز المهام من قبل تقنية المعلومات والموارد البشرية", "اعتماد اكتمال التهيئة وبدء مباشرة العمل الرسمية"],
      stepsEn: ["Initiate onboarding journey linked to employee and template", "Monitor task execution across IT, admin, and HR departments", "Submit onboarding completion to confirm full operational readiness"]
    },
    "Employee Skill Map": {
      icon: "🎯",
      summaryAr: "توثيق وتقييم المهارات والقدرات الفنية والسلوكية للموظف وتحديد الاحتياجات التطويرية المستقبلية.",
      summaryEn: "Record and evaluate employee competencies, professional skills, and development gaps.",
      stepsAr: ["اختيار الموظف وإضافة المهارات الفنية والمهنية المعتمدة", "تحديد مستوى الإتقان الحالي والمستوى المستهدف", "حفظ خريطة المهارات لتوجيه خطط التدريب والترقيات"],
      stepsEn: ["Select employee and map designated technical and soft skills", "Rate current competency proficiency versus target benchmark", "Save skill map to drive targeted training and promotion tracks"]
    },

    "Grievance Type": {
      icon: "🏷️",
      summaryAr: "تعريف وتصنيف أنواع الشكاوى والتظلمات الإدارية والمهنية داخل بيئة العمل وضوابط التحقيق فيها.",
      summaryEn: "Classify employee workplace grievances and disputes (administrative, policy, peer dispute).",
      stepsAr: ["إدخال مسمى نوع التظلم وتوصيفه الإداري", "تحديد اللجنة أو الجهة المسؤولة عن التحقيق في هذا النوع", "حفظ النوع لتصنيف بلاغات الموظفين"],
      stepsEn: ["Enter grievance category title and description", "Designate responsible investigative committee or HR officer", "Save grievance type for structured dispute management"]
    },
    "Employee Grievance": {
      icon: "⚖️",
      summaryAr: "تسجيل والتحقيق في شكاوى وتظلمات الموظفين بسرية تامة وتوثيق الإجراءات التصحيحية المتخذة.",
      summaryEn: "Confidential employee grievance case logging, investigation notes, and resolution actions.",
      stepsAr: ["تسجيل الشكوى الواردة وتحديد نوعها والأطراف المعنية", "توثيق جلسات الاستماع والتحقيق والأدلة المقدمة", "اعتماد القرار النهائي والإجراءات الإدارية المتخذة لحل التظلم"],
      stepsEn: ["Log incoming grievance case, category, and involved parties", "Document hearing notes, investigative evidence, and findings", "Submit final resolution decision and corrective actions taken"]
    },

    "Training Program": {
      icon: "📚",
      summaryAr: "تخطيط وتصميم البرامج التدريبية وورش العمل لتطوير كفاءات الموظفين ورفع الإنتاجية.",
      summaryEn: "Curriculum and development syllabus planning to build employee skills and performance.",
      stepsAr: ["إنشاء برنامج تدريبي وتحديد أهدافه وموضوعاته الرئيسية", "تحديد المهارات المستهدف تطويرها والفئات المرشحة", "حفظ البرنامج لجدولة الدورات التدريبية التنفيذية بناءً عليه"],
      stepsEn: ["Create training program defining core objectives and syllabus", "Specify target competencies to develop and candidate profiles", "Save program to structure upcoming active training events"]
    },
    "Training Event": {
      icon: "🎓",
      summaryAr: "جدولة وتنظيم الدورات والورش التدريبية؛ تحديد المدرب، المواعيد، القاعة، وقوائم الموظفين المشاركين.",
      summaryEn: "Schedule training events: trainer details, dates, venue, and employee attendee roster.",
      stepsAr: ["إنشاء فعالية تدريبية وربطها بالبرنامج التدريبي والمدرب", "تحديد مواعيد الانعقاد وإضافة أسماء الموظفين المشاركين", "حفظ الفعالية وإرسال الدعوات وتسجيل الحضور والانصراف"],
      stepsEn: ["Create training event, linking program syllabus and trainer", "Schedule dates, physical room or link, and enrolled employees", "Dispatch invites and log attendee participation during sessions"]
    },
    "Training Feedback": {
      icon: "⭐",
      summaryAr: "جمع استطلاعات وتقييمات الموظفين لجودة الدورة التدريبية وكفاءة المدرب ومدى الاستفادة.",
      summaryEn: "Collect attendee feedback surveys evaluating training event quality, content, and trainer.",
      stepsAr: ["اختيار الفعالية التدريبية والموظف المشارك", "رصد درجات تقييم المحتوى والمدرب والتنظيم", "حفظ التقييم لتحليل العائد على الاستثمار في التدريب"],
      stepsEn: ["Select completed training event and participating employee", "Rate course material, trainer competence, and logistics", "Submit feedback survey to assess training ROI and satisfaction"]
    },
    "Training Result": {
      icon: "🏆",
      summaryAr: "رصد وتوثيق نتائج الاختبارات ومستويات اجتياز الموظفين للدورات التدريبية وإصدار الشهادات.",
      summaryEn: "Record examination scores, passing certificates, and post-training completion assessments.",
      stepsAr: ["فتح سجل نتائج الدورة واختيار الفعالية التدريبية", "رصد درجات اختبار كل موظف وحالة الاجتياز (ناجح، راسب)", "حفظ النتائج وتحديث خريطة مهارات الموظف وملفه الشخصي"],
      stepsEn: ["Open result sheet linked to completed training event", "Log assessment scores and pass/fail status per employee", "Save results to automatically update employee skill profile"]
    },

    "Daily Work Summary": {
      icon: "📝",
      summaryAr: "سجل تقارير الإنجاز اليومي؛ استعراض المهام والأنشطة المنجزة والتحديات التي واجهت الموظف.",
      summaryEn: "Daily work summaries logged by employees documenting completed tasks and roadblocks.",
      stepsAr: ["استعراض تقارير الإنجاز اليومية المرفوعة من الموظفين", "مراجعة المهام المنجزة ومطابقتها مع الأهداف الأسبوعية", "التعليق وتقديم التوجيهات والدعم للموظف"],
      stepsEn: ["Review daily progress reports submitted by team members", "Assess completed activities against weekly sprint goals", "Provide managerial comments, feedback, and support"]
    },
    "Daily Work Summary Group": {
      icon: "📬",
      summaryAr: "إدارة مجموعات إرسال واستقبال تقارير وملخصات الإنجاز اليومي لفرق العمل بالبريد.",
      summaryEn: "Configure automated daily work summary broadcast groups and recipient mailing lists.",
      stepsAr: ["إنشاء مجموعة جديدة وتحديد ساعة إرسال التذكير اليومي", "إضافة الموظفين الملزمين بتقديم الملخص وقائمة المشرفين", "تفعيل المجموعة لأتمتة رسائل جمع الإنجاز اليومي"],
      stepsEn: ["Create group and set scheduled daily prompt dispatch hour", "Add reporting employees and recipient supervisor emails", "Enable group to automate daily work check-ins"]
    },
    "Daily Work Summary Replies": {
      icon: "💬",
      summaryAr: "أرشيف الردود والرسائل التفاعلية المرسلة بين الموظفين والمشرفين حول ملخصات العمل اليومية.",
      summaryEn: "Thread archive of discussions and feedback between managers and staff on daily summaries.",
      stepsAr: ["استعراض الردود والملاحظات المتبادلة على ملخصات العمل", "التحقق من حل العوائق التشغيلية التي طرحها الموظفون", "توثيق التوجيهات ضمن سجل الأداء"],
      stepsEn: ["Review interactive dialogue and feedback on daily check-ins", "Verify resolution of operational impediments raised by staff", "Archive coaching notes into employee performance context"]
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
