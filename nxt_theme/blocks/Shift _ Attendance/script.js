(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الورديات والحضور — Shift & Attendance Workspace
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
    { labelEn: "Employee Checkin", labelAr: "تسجيل دخول الموظف", doctype: "Employee Checkin", hasCount: true, color: "#10b981" },
    { labelEn: "Attendance", labelAr: "الحضور والانصراف", doctype: "Attendance", hasCount: true, color: "#1e40af" },
    { labelEn: "Shift Request", labelAr: "طلبات تغيير الوردية", doctype: "Shift Request", hasCount: true, countSuffixEn: "Pending", countSuffixAr: "معلق", color: "#f59e0b" },
    { labelEn: "Dashboard", labelAr: "لوحة الحضور", route: "attendance-dashboard", color: "#64748b" },
    { labelEn: "Roster", labelAr: "جدول المناوبات (Roster)", route: "shift-roster", color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Reports",
      [
        [
          "Shifts",
          "🔄",
          [
            "Shift Type",
            "Shift Assignment",
            "Shift Schedule",
            "Shift Schedule Assignment",
            "Shift Request",
            "Shift Assignment Tool"
          ]
        ],
        [
          "Attendance",
          "⏱️",
          [
            "Attendance",
            "Attendance Request",
            "Employee Checkin",
            "Employee Attendance Tool",
            "Upload Attendance"
          ]
        ],
        [
          "Time",
          "⌛",
          [
            "Timesheet",
            "Activity Type"
          ]
        ],
        [
          "Reports",
          "📊",
          [
            "Monthly Attendance Sheet",
            "Shift Attendance",
            "Employee Hours Utilization Based On Time...",
            "Project Profitability",
            "Employees working on a holiday"
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
    "Monthly Attendance Sheet",
    "Shift Attendance",
    "Employee Hours Utilization Based On Time...",
    "Employee Hours Utilization Based On Timesheet",
    "Project Profitability",
    "Employees working on a holiday",
    "Employees Working on a Holiday"
  ]);

  const customRoutes = {
    "Dashboard": ["attendance-dashboard"],
    "Roster": ["shift-roster"],
    "Shift Assignment Tool": ["shift-assignment-tool"],
    "Employee Attendance Tool": ["employee-attendance-tool"],
    "Upload Attendance": ["upload-attendance"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Your Shortcuts": "اختصاراتك السريعة",
    "Masters & Reports": "البيانات والتقارير",

    "Shifts": "الورديات ومناوبات العمل",
    "Shift Type": "أنواع الورديات",
    "Shift Assignment": "تعيين وردية الموظف",
    "Shift Schedule": "جدول الورديات",
    "Shift Schedule Assignment": "تعيين جدول الورديات",
    "Shift Request": "طلب تغيير أو تبديل الوردية",
    "Shift Assignment Tool": "أداة تعيين الورديات الجماعي",

    "Attendance": "الحضور والانصراف",
    "Attendance Request": "طلب إثبات حضور",
    "Employee Checkin": "تسجيل دخول الموظف",
    "Employee Attendance Tool": "أداة رصد الحضور الجماعي",
    "Upload Attendance": "رفع واستيراد ملف الحضور",

    "Time": "سجلات الوقت والأنشطة",
    "Timesheet": "سجل الدوام والوقت (Timesheet)",
    "Activity Type": "أنواع الأنشطة والمهام",

    "Reports": "التقارير",
    "Monthly Attendance Sheet": "مسير الحضور الشهري",
    "Shift Attendance": "تقرير حضور الورديات",
    "Employee Hours Utilization Based On Time...": "تقرير استغلال ساعات عمل الموظف",
    "Project Profitability": "ربحية المشاريع وساعات العمل",
    "Employees working on a holiday": "الموظفون العاملون في العطلات",

    "Dashboard": "لوحة الحضور",
    "Roster": "جدول المناوبات"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Shift Type": {
      icon: "🔄",
      summaryAr: "تعريف وتوقيتات ورديات ومناوبات العمل (صباحية، مسائية، ليلية) وفترات السماح بالتأخير وساعات الراحة.",
      summaryEn: "Configure shift timings (morning, evening, night), grace periods, and break durations.",
      stepsAr: ["إدخال اسم الوردية وتحديد وقت البدء ووقت الانتهاء", "تحديد فترات السماح للتأخير والانصراف المبكر", "حفظ الوردية لتعيين الموظفين والفرق عليها"],
      stepsEn: ["Enter shift title, start time, and end time", "Set allowable late-entry and early-exit thresholds", "Save shift type to assign employees and teams"]
    },
    "Shift Assignment": {
      icon: "📅",
      summaryAr: "تخصيص وتعيين الموظف على وردية عمل محددة وتحديد تاريخ البداية وتاريخ الانتهاء.",
      summaryEn: "Assign individual employees to designated shifts with start and end valid dates.",
      stepsAr: ["إنشاء تعيين وردية جديد واختيار الموظف والوردية", "تحديد تاريخ بدء سريان الوردية وتاريخ الانتهاء", "اعتماد التعيين لمطابقة بصمات الموظف مع أوقات الوردية"],
      stepsEn: ["Create new shift assignment, selecting employee and shift", "Specify effective start and end operational dates", "Submit assignment to evaluate biometric check-ins"]
    },
    "Shift Schedule": {
      icon: "📋",
      summaryAr: "تصميم جداول وقوالب الورديات الدورية المتناوبة (مثل: 4 أيام عمل ثم يومين راحة).",
      summaryEn: "Design rotational shift patterns (e.g. 4 days on, 2 days off rotating schedule).",
      stepsAr: ["إنشاء جدول ورديات دوري وتحديد نمط المناوبة وتكرارها", "تحديد الورديات المخصصة لكل يوم من أيام الأسبوع", "حفظ الجدول لتعيين مجموعات وفرق الموظفين عليه"],
      stepsEn: ["Create recurring schedule template with shift pattern", "Map specific shift types per weekday or rotation index", "Save schedule to apply across workforce departments"]
    },
    "Shift Schedule Assignment": {
      icon: "👥",
      summaryAr: "تطبيق جداول ومخططات الورديات المتناوبة على مجموعات وأقسام الموظفين دفعة واحدة.",
      summaryEn: "Bulk assign rotational shift schedules to departments and workforce cohorts.",
      stepsAr: ["اختيار جدول الورديات والقسم أو مجموعة الموظفين المستهدفة", "تحديد تاريخ بداية تطبيق الجدول الدوري", "اعتماد التعيين لجدولة مناوبات كافة أعضاء الفريق تلقائياً"],
      stepsEn: ["Select shift schedule and target department or employee group", "Define effective schedule rollout start date", "Submit to dynamically generate rosters for all team members"]
    },
    "Shift Request": {
      icon: "📝",
      summaryAr: "تقديم طلب رسمي من الموظف لتبديل أو تغيير موعد ورديته لظروف طارئة أو شخصية.",
      summaryEn: "Employee request to swap or change assigned shift due to personal circumstances.",
      stepsAr: ["إنشاء طلب تغيير وردية وتحديد الوردية البديلة والسبب", "تحديد الفترة وتاريخ التبديل المطلوب", "إرسال الطلب لموافقة المشرف المباشر وتحديث الوردية آلياً"],
      stepsEn: ["Create shift request selecting proposed shift type and justification", "Specify effective date or swap duration range", "Submit for supervisor authorization to reassign shift"]
    },
    "Shift Assignment Tool": {
      icon: "🛠️",
      summaryAr: "أداة المعالجة الجماعية السريعة لتوزيع وتعيين الورديات على موظفي القسم لأسابيع أو أشهر قادمة.",
      summaryEn: "Bulk assignment wizard to quickly allocate shifts to multiple employees across date ranges.",
      stepsAr: ["تصفية واختيار الموظفين حسب القسم أو المسمى الوظيفي", "تحديد الوردية المطلوبة وتاريخ البداية والنهاية للتعيين الجماعي", "الضغط على زر التعيين لمعالجة وتحديث جداول الجميع بضغطة واحدة"],
      stepsEn: ["Filter and select employees by department or designation", "Choose destination shift and target start/end date range", "Click bulk assign to process and update all employee rosters"]
    },

    "Attendance": {
      icon: "⏱️",
      summaryAr: "سجل حركة الحضور اليومية للموظف؛ توثيق الحضور والغياب والتأخير وساعات العمل الفعلية.",
      summaryEn: "Daily employee attendance record logging status (Present, Absent, Half Day), check-in, and late entry.",
      stepsAr: ["اختيار الموظف وتحديد التاريخ والحالة (حاضر، غائب، إجازة)", "تسجيل وقت الحضور والانصراف وساعات العمل المحتسبة", "حفظ السجل لمطابقته مع مسير الرواتب الشهري"],
      stepsEn: ["Select employee, date, and status (Present, Absent, On Leave)", "Record in/out timestamps and total working hours", "Save record to feed into monthly payroll ledger"]
    },
    "Attendance Request": {
      icon: "📝",
      summaryAr: "تقديم طلب إثبات حضور أو تعديل قيد حضور ناتج عن نسيان البصمة أو مأمورية خارجية.",
      summaryEn: "Employee attendance regularization request for missed punch or field assignment.",
      stepsAr: ["إنشاء طلب إثبات حضور وتحديد التاريخ والوقت والسبب", "تحديد طبيعة العذر (نسيان بصمة، مأمورية عمل خارجية)", "إرسال الطلب للاعتماد وتعديل حالة الحضور تلقائياً"],
      stepsEn: ["Create attendance request, setting date, time, and reason", "Specify justification (missed punch, official offsite meeting)", "Submit request for supervisor approval to adjust record"]
    },
    "Employee Checkin": {
      icon: "📲",
      summaryAr: "سجل تسجيل البصمات والحركات الخام الواردة من أجهزة البصمة البيومترية أو تطبيق الجوال.",
      summaryEn: "Raw biometric punch log imported directly from attendance devices or mobile app.",
      stepsAr: ["استعراض حركات تسجيل الدخول والخروج الواردة للموظف", "التحقق من وقت البصمة والموقع الجغرافي ونوع الحركة", "مزامنة الحركات لتوليد سجلات الحضور والانصراف تلقائياً"],
      stepsEn: ["Review raw in/out punch transactions per employee", "Verify punch timestamp, device ID, and geo-location", "Process logs to automatically generate attendance records"]
    },
    "Employee Attendance Tool": {
      icon: "✏️",
      summaryAr: "أداة التحضير السريع لرصد وتعديل حضور وغياب موظفي القسم يدوياً ليوم محدد دفعة واحدة.",
      summaryEn: "Manual quick mark attendance tool to record daily presence/absence for groups at once.",
      stepsAr: ["تحديد التاريخ والفرع أو القسم المستهدف", "تحديد حالة الحضور (حاضر، غائب، نصف يوم) للموظفين في القائمة", "الضغط على زر الحفظ لتوليد سجلات الحضور لجميع الموظفين دفعة واحدة"],
      stepsEn: ["Select target date and department/branch filter", "Mark attendance state (Present, Absent, Half-Day) for displayed employees", "Click submit to generate attendance entries in bulk"]
    },
    "Upload Attendance": {
      icon: "📤",
      summaryAr: "استيراد ملفات إكسل / CSV لحركات وبصمات الحضور من أجهزة البصمة الخارجية وترحيلها للنظام.",
      summaryEn: "Batch import attendance punch files (Excel/CSV) from third-party biometric clocks.",
      stepsAr: ["تحميل قالب الاستيراد وتعبئة أرقام الموظفين وتواريخ البصمات", "رفع ملف الإكسل ومطابقة الأعمدة والتحقق من صحة البيانات", "بدء المعالجة لإنشاء قيود الحضور والبصمات تلقائياً"],
      stepsEn: ["Download CSV template and populate employee IDs and punch timestamps", "Upload file and map columns to system fields", "Trigger upload processing to import check-in logs"]
    },

    "Timesheet": {
      icon: "⌛",
      summaryAr: "سجل توثيق ساعات العمل الفعلية المبذولة في المشاريع والمهام والعملاء للفوترة أو احتساب التكلفة.",
      summaryEn: "Project timesheet ledger logging billable hours and activities per client task.",
      stepsAr: ["إنشاء جدول دوام واختيار الموظف والمشروع والعميل", "تسجيل الأنشطة وساعات البدء والانتهاء مع تحديد قابلية الفوترة", "اعتماد الجدول لاحتساب تكلفة الساعات أو إصدار فواتير العميل"],
      stepsEn: ["Create timesheet document selecting employee, project, and client", "Log tasks, start/end hours, and flag billable time", "Submit timesheet to feed project costing or client billing"]
    },
    "Activity Type": {
      icon: "🏷️",
      summaryAr: "تعريف أنواع الأنشطة والمهام (برمجة، تصميم، استشارة، صيانة) وتحديد سعر الساعة الافتراضي.",
      summaryEn: "Activity classifications for timesheet logging with default billing and cost hourly rates.",
      stepsAr: ["إدخال اسم النشاط بالعربية والإنجليزية", "تحديد معدل الأجر ومعدل الفوترة الافتراضي للساعة", "حفظ النشاط لتمكين الموظفين من اختياره في سجلات الدوام"],
      stepsEn: ["Enter activity type title and description", "Set default hourly billing rate and costing rate", "Save activity to select in timesheets"]
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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(30, 64, 175, 0.12); color: #1e40af;">...</span>` : ""}
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
