(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم إدارة المشاريع — ERPNext Projects
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
     ١. إحصائيات المشاريع
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-projects",
      short: "PRJ",
      labelEn: "Open Projects",
      labelAr: "المشاريع المفتوحة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Project",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "active-tasks",
      short: "TASK",
      labelEn: "Open Tasks",
      labelAr: "المهام الجارية",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Task",
              filters: { status: "Open" }
            },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "timesheets",
      short: "TIME",
      labelEn: "Timesheets",
      labelAr: "سجلات ساعات العمل",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: { doctype: "Timesheet" },
            callback: data => resolve(data?.message || 0),
            error: () => resolve(0)
          });
        })
    },
    {
      id: "completed-projects",
      short: "DONE",
      labelEn: "Completed",
      labelAr: "المشاريع المكتملة",
      fetch: () =>
        new Promise(resolve => {
          frappe.call({
            method: "frappe.client.get_count",
            args: {
              doctype: "Project",
              filters: { status: "Completed" }
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
    { doctype: "Task", labelEn: "Task", labelAr: "مهمة" },
    { doctype: "Project", labelEn: "Project", labelAr: "مشروع" },
    { doctype: "Timesheet", labelEn: "Timesheet", labelAr: "سجل وقت العمل" },
    { doctype: "Project Billing Summary", labelEn: "Project Billing Summary", labelAr: "ملخص فوترة المشاريع", isReport: true },
    { doctype: "Project Dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم", isRoute: "dashboard-view/Project" }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Projects",
          "🏗️",
          [
            "Project",
            "Task",
            "Project Template",
            "Project Type",
            "Project Update"
          ]
        ],
        [
          "Time Tracking",
          "⏱️",
          [
            "Timesheet",
            "Activity Type",
            "Activity Cost"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Daily Timesheet Summary",
            "Project wise Stock Tracking",
            "Project Billing Summary",
            "Delayed Tasks Summary"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Projects Settings"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "Projects Settings"
  ]);

  const treeDocs = new Set([]);

  const reportNames = new Set([
    "Daily Timesheet Summary",
    "Project wise Stock Tracking",
    "Project Billing Summary",
    "Delayed Tasks Summary"
  ]);

  /* ─────────────────────────────────────────
     ٥. القاموس اللغوي (عربي / إنجليزي مع اعتماد 'منتج/منتجات')
  ───────────────────────────────────────── */

  const translations = {
    "Reports & Masters": "التقارير والبيانات الرئيسية",
    "Projects": "المشاريع",
    "Time Tracking": "تتبع الوقت وساعات العمل",
    "Reports": "التقارير",
    "Settings": "الإعدادات",

    "Project": "المشاريع",
    "Task": "المهام",
    "Project Template": "قوالب المشاريع",
    "Project Type": "أنواع المشاريع",
    "Project Update": "تحديثات ومتابعة المشاريع",

    "Timesheet": "سجلات وقت العمل",
    "Activity Type": "أنواع الأنشطة",
    "Activity Cost": "تكلفة الأنشطة",

    "Daily Timesheet Summary": "ملخص سجلات الوقت اليومية",
    "Project wise Stock Tracking": "تتبع مخزون المنتجات حسب المشروع",
    "Project Billing Summary": "ملخص فوترة المشاريع",
    "Delayed Tasks Summary": "ملخص المهام المتأخرة",

    "Projects Settings": "إعدادات المشاريع"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Project": {
      icon: "🏗️",
      summaryAr: "إدارة وتخطيط المشاريع؛ تتبع الميزانيات التقديرية، التكاليف الفعلية، فترات التسليم، ومخططات جانت (Gantt).",
      summaryEn: "Project planning and governance: track budgets, actual costs, milestones, Gantt charts, and deliverables.",
      stepsAr: ["إنشاء المشروع وتحديد العميل والميزانية والتواريخ", "تقسيم العمل إلى مراحل ومهام رئيسية وفرعية", "متابعة نسبة الإنجاز والفوترة وإغلاق المشروع عند الاكتمال"],
      stepsEn: ["Create project profile linked to customer and budget", "Break down work into task hierarchy and milestones", "Monitor progress percentage, bill expenses, and close project"]
    },
    "Task": {
      icon: "✅",
      summaryAr: "إدارة وتكليف مهام العمل وتعيين الموظفين وتحديد مدد الإنجاز والأولويات ومتابعة الاعتماد.",
      summaryEn: "Task management and assignment: define deadlines, expected hours, priority, dependencies, and reviewers.",
      stepsAr: ["إنشاء المهمة وربطها بالمشروع والمرحلة", "تحديد الموظف المكلف والمدة التقديرية وتاريخ التسليم", "تحديث حالة المهمة عند الإنجاز وربط سجلات الوقت"],
      stepsEn: ["Create task linked to parent project", "Assign team member, expected hours, and deadline", "Update progress status and link employee timesheets"]
    },
    "Project Template": {
      icon: "📑",
      summaryAr: "إنشاء قوالب قياسية مسبقة الإعداد للمشاريع متضمنة هيكل المهام النموذجية لتسريع بدء المشاريع الجديدة.",
      summaryEn: "Standardized reusable project templates with pre-configured task structures and milestone timelines.",
      stepsAr: ["تسمية قالب المشروع ونطاق عمله", "إدراج حزمة المهام الافتراضية ومدد كل مهمة", "تطبيق القالب عند إنشاء أي مشروع جديد مشتَق"],
      stepsEn: ["Define template title and project scope", "Populate default task hierarchy and milestone durations", "Apply template when creating new similar projects"]
    },
    "Project Type": {
      icon: "🏷️",
      summaryAr: "تصنيف المشاريع حسب طبيعتها وأهدافها (إنشائية، استشارية، تقنية، صيانة) لتسهيل الفلترة والتقارير.",
      summaryEn: "Categorize projects by discipline and operational type (internal, customer, consulting, turnkey).",
      stepsAr: ["تسمية نوع المشروع وإضافة وصف مختصر", "ربطه بسياسات العمل والمحاسبة المعنية", "استخدامه في فلترة وتحليل عوائد وتكاليف فئات المشاريع"],
      stepsEn: ["Name project category and add description", "Assign to analytical accounting or operational rules", "Filter project portfolio performance by category"]
    },
    "Project Update": {
      icon: "📢",
      summaryAr: "توثيق التحديثات والتقارير الدورية الدقيقة حول سير العمل الميداني والمالي والتحديات القائمة.",
      summaryEn: "Periodic progress updates documenting physical execution milestones, financial burn rate, and roadblocked risks.",
      stepsAr: ["اختيار المشروع وتحديد تاريخ ونوع التقرير", "تدوين نسبة التقدم المحرز والتحديات والإنجازات", "إرسال التحديث لمدير المشروع وأصحاب المصلحة"],
      stepsEn: ["Select project and reporting interval", "Summarize completed deliverables, risks, and next steps", "Broadcast update report to project sponsors and stakeholders"]
    },

    "Timesheet": {
      icon: "⏱️",
      summaryAr: "سجل توثيق ساعات وأوقات عمل الموظفين والخبراء على المشاريع والمهام لاحتساب التكلفة والفوترة.",
      summaryEn: "Employee timesheet logging billable and non-billable labor hours across project tasks.",
      stepsAr: ["اختيار الموظف والمشروع والمهمة ونوع النشاط", "تسجيل وقت البدء ووقت الانتهاء أو عدد الساعات الفعلي", "اعتماد السجل لترحيل التكاليف للمشروع أو فوترته للعميل"],
      stepsEn: ["Select employee, project, task, and activity type", "Enter start/end time or log direct hours worked", "Submit timesheet for manager approval and billing"]
    },
    "Activity Type": {
      icon: "🎯",
      summaryAr: "تعريف وتوحيد مسميات الأنشطة المهنية (برمجة، استشارات، تصميم، إشراف موقع، سفر) مع معدلات التكلفة.",
      summaryEn: "Standard activity codes (coding, design, site supervision, consultation) with standard billing rates.",
      stepsAr: ["إدخال مسمى النشاط ووصفه", "تحديد التكلفة القياسية الافتراضية ومعدل الفوترة بالساعة", "استخدامه في بنود تسجيل سجلات الوقت (Timesheets)"],
      stepsEn: ["Enter activity name and description", "Set default standard cost and hourly billing rate", "Select activity when logging timesheet entries"]
    },
    "Activity Cost": {
      icon: "💰",
      summaryAr: "تخصيص معدلات تكلفة وسعر ساعات العمل لكل موظف ونوع نشاط لضمان دقة احتساب التكاليف والأرباح.",
      summaryEn: "Define employee-specific and activity-specific billing and cost rates for project accounting accuracy.",
      stepsAr: ["اختيار الموظف المعني ونوع النشاط", "تحديد معدل التكلفة (Costing Rate) ومعدل الفوترة (Billing Rate)", "حفظ السجل ليتم احتسابه تلقائياً في السجلات الزمنية"],
      stepsEn: ["Select employee and designated activity type", "Define employee hourly costing rate and client billing rate", "Save record to auto-populate timesheet financial totals"]
    },

    "Projects Settings": {
      icon: "⚙️",
      summaryAr: "شاشة الإعدادات العامة للمشاريع؛ تشمل حساب التكلفة التلقائي، قواعد إغلاق المهام، واعتماد سجلات ساعات العمل.",
      summaryEn: "Global project configuration: auto-costing rules, default timesheet approval workflows, and task completion policies.",
      stepsAr: ["تحديد سياسة حساب تكلفة المشروع من سجلات الوقت أو قيود اليومية", "ضبط التنبيهات عند تجاوز ميزانية المشروع أو الموعد النهائي", "حفظ الإعدادات لتطبيقها على كافة المشاريع الجارية والمستقبلية"],
      stepsEn: ["Configure project costing methodology from timesheets or journal vouchers", "Set alert thresholds for budget overruns and milestone delays", "Save settings to enforce project governance rules"]
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
            <button type="button" class="erp-quick-btn" data-btn-action="${escapeHtml(btn.doctype)}" ${btn.isReport ? 'data-is-report="1"' : ''} ${btn.isRoute ? `data-is-route="${escapeHtml(btn.isRoute)}"` : ''}>
              <span class="erp-quick-icon" aria-hidden="true">+</span>
              <span class="erp-quick-label">${escapeHtml(label)}</span>
            </button>`;
        }).join("")}
      </div>
    `;

    quickActions.addEventListener("click", event => {
      const btn = event.target.closest("[data-btn-action]");
      if (!btn || !window.frappe) return;
      const doctype = btn.dataset.btnAction;
      if (btn.dataset.isReport === "1") {
        frappe.set_route("query-report", doctype);
        return;
      }
      if (btn.dataset.isRoute) {
        frappe.set_route(btn.dataset.isRoute.split("/"));
        return;
      }
      frappe.new_doc(doctype);
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
