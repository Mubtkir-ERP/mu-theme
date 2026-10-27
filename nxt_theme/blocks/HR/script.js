(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة تحكم الموارد البشرية — HR Workspace
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
    { labelEn: "Employee", labelAr: "الموظفين", doctype: "Employee", hasCount: true, countSuffixEn: "Active", countSuffixAr: "نشط", color: "#10b981" },
    { labelEn: "Leave Application", labelAr: "طلبات الإجازة", doctype: "Leave Application", hasCount: true, color: "#64748b" },
    { labelEn: "HR Dashboard", labelAr: "لوحة تحكم HR", route: "hr-dashboard", color: "#64748b" },
    { labelEn: "Recruitment Dashboard", labelAr: "لوحة التوظيف", route: "recruitment-dashboard", color: "#64748b" },
    { labelEn: "Employee Lifecycle Dashboard", labelAr: "دورة حياة الموظف", route: "employee-lifecycle-dashboard", color: "#64748b" },
    { labelEn: "Attendance Dashboard", labelAr: "لوحة الحضور", route: "attendance-dashboard", color: "#64748b" },
    { labelEn: "Expense Claims Dashboard", labelAr: "لوحة المصروفات", route: "expense-claims-dashboard", color: "#64748b" },
    { labelEn: "HR app", labelAr: "تطبيق الموارد البشرية", route: "hrms", color: "#64748b" }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Reports & Masters",
      [
        [
          "Setup",
          "⚙️",
          [
            "Company",
            "Branch",
            "Department",
            "Designation"
          ]
        ],
        [
          "Employee",
          "👥",
          [
            "Employee",
            "Employee Group",
            "Employee Grade"
          ]
        ],
        [
          "Leaves",
          "🌴",
          [
            "Leave Application",
            "Compensatory Leave Request"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "HR Settings",
            "Daily Work Summary Group",
            "Team Updates"
          ]
        ],
        [
          "Attendance",
          "⏱️",
          [
            "Attendance",
            "Attendance Request",
            "Employee Checkin"
          ]
        ],
        [
          "Expense Claim",
          "💰",
          [
            "Expense Claim",
            "Employee Advance",
            "Travel Request"
          ]
        ],
        [
          "Key Reports",
          "📊",
          [
            "Monthly Attendance Sheet",
            "Recruitment Analytics",
            "Employee Analytics",
            "Employee Leave Balance",
            "Employee Leave Balance Summary",
            "Employee Advance Summary",
            "Employee Exits"
          ]
        ],
        [
          "Other Reports",
          "📑",
          [
            "Employee Information",
            "Employee Birthday",
            "Employees Working on a Holiday",
            "Daily Work Summary Replies"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. أنواع المستندات الفردية والشجرية والتقارير
  ───────────────────────────────────────── */

  const singleDocs = new Set([
    "HR Settings"
  ]);

  const treeDocs = new Set([
    "Department"
  ]);

  // التقارير المستثناة من زر التفاصيل
  const reportNames = new Set([
    "Monthly Attendance Sheet",
    "Recruitment Analytics",
    "Employee Analytics",
    "Employee Leave Balance",
    "Employee Leave Balance Summary",
    "Employee Advance Summary",
    "Employee Exits",
    "Employee Information",
    "Employee Birthday",
    "Employees Working on a Holiday",
    "Daily Work Summary Replies"
  ]);

  const customRoutes = {
    "HR Dashboard": ["hr-dashboard"],
    "Recruitment Dashboard": ["recruitment-dashboard"],
    "Employee Lifecycle Dashboard": ["employee-lifecycle-dashboard"],
    "Attendance Dashboard": ["attendance-dashboard"],
    "Expense Claims Dashboard": ["expense-claims-dashboard"],
    "HR app": ["hrms"]
  };

  /* ─────────────────────────────────────────
     ٤. الترجمات العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Your Shortcuts": "اختصاراتك السريعة",
    "Reports & Masters": "التقارير والبيانات الرئيسية",

    "Setup": "الإعداد والتهيئة",
    "Company": "الشركة",
    "Branch": "الفرع",
    "Department": "القسم",
    "Designation": "المسمى الوظيفي",

    "Employee": "الموظفين",
    "Employee Group": "مجموعة الموظفين",
    "Employee Grade": "الدرجة الوظيفية",

    "Leaves": "الإجازات",
    "Leave Application": "طلب إجازة",
    "Compensatory Leave Request": "طلب إجازة تعويضية",

    "Settings": "الإعدادات",
    "HR Settings": "إعدادات الموارد البشرية",
    "Daily Work Summary Group": "مجموعة ملخص العمل اليومي",
    "Team Updates": "تحديثات الفريق",

    "Attendance": "الحضور والانصراف",
    "Attendance Request": "طلب إثبات حضور",
    "Employee Checkin": "تسجيل دخول الموظف",

    "Expense Claim": "مطالبات المصروفات",
    "Employee Advance": "سلفة موظف",
    "Travel Request": "طلب انتداب وسفر",

    "Key Reports": "التقارير الرئيسية",
    "Monthly Attendance Sheet": "مسير الحضور الشهري",
    "Recruitment Analytics": "تحليلات التوظيف",
    "Employee Analytics": "تحليلات الموظفين",
    "Employee Leave Balance": "رصيد إجازات الموظف",
    "Employee Leave Balance Summary": "ملخص أرصدة الإجازات",
    "Employee Advance Summary": "ملخص سلف الموظفين",
    "Employee Exits": "مغادرات واستقالات الموظفين",

    "Other Reports": "تقارير أخرى",
    "Employee Information": "معلومات وبيانات الموظفين",
    "Employee Birthday": "أعياد ميلاد الموظفين",
    "Employees Working on a Holiday": "الموظفون العاملون في العطلات",
    "Daily Work Summary Replies": "ردود ملخص العمل اليومي",

    "HR Dashboard": "لوحة تحكم الموارد البشرية",
    "Recruitment Dashboard": "لوحة متابعة التوظيف",
    "Employee Lifecycle Dashboard": "لوحة دورة حياة الموظف",
    "Attendance Dashboard": "لوحة الحضور والانصراف",
    "Expense Claims Dashboard": "لوحة مطالبات المصروفات",
    "HR app": "تطبيق الموارد البشرية"
  };

  /* ─────────────────────────────────────────
     ٥. أوصاف المستندات والإعدادات (مع خطوات تفصيلية)
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Company": {
      icon: "🏢",
      summaryAr: "سجل المنشأة والشركات التابعة؛ إدارة الهيكل القانوني، العملة، والحسابات المالية للموارد البشرية.",
      summaryEn: "Corporate entity registry: manage organizational legal structure, base currency, and HR accounting defaults.",
      stepsAr: ["اختيار الشركة وإدخال الاسم التجاري والعملة", "ربط مراكز التكلفة وحسابات الرواتب الافتراضية", "حفظ السجل وتعميمه على مسيرات الموظفين"],
      stepsEn: ["Select company and set corporate legal name and currency", "Link default cost centers and payroll GL accounts", "Save profile to enforce across HR records"]
    },
    "Branch": {
      icon: "📍",
      summaryAr: "تعريف الفروع والمواقع الجغرافية لمكاتب ومقرات عمل الموظفين في مختلف المناطق.",
      summaryEn: "Configure company branches, physical offices, and regional employment locations.",
      stepsAr: ["إدخال اسم الفرع والمدينة والعنوان الوطني", "تحديد الفرع التابع للشركة", "حفظ الفرع لربط عقود الموظفين وحضورهم به"],
      stepsEn: ["Enter branch title, district city, and physical address", "Link branch to parent corporate entity", "Save branch to assign employee contracts and shifts"]
    },
    "Department": {
      icon: "🗂️",
      summaryAr: "بناء الهيكل الإداري والشجري للأقسام والإدارات (المالية، المبيعات، التقنية، التشغيل).",
      summaryEn: "Tree structure hierarchy of organizational departments and business divisions.",
      stepsAr: ["إنشاء قسم جديد وتحديد القسم الرئيسي التابع له", "تعيين مدير أو رئيس القسم المشرف", "حفظ الهيكل لتنظيم خطوط الإشراف والموافقات"],
      stepsEn: ["Create new department within organizational hierarchy tree", "Assign designated department head or lead manager", "Save department to route approval chains"]
    },
    "Designation": {
      icon: "💼",
      summaryAr: "سجل المسميات والوظائف المعتمدة في المنشأة مع تحديد الوصف الوظيفي والمؤهلات المطلوبة.",
      summaryEn: "Standard job designations library defining job responsibilities and employment levels.",
      stepsAr: ["إدخال المسمى الوظيفي بالعربية والإنجليزية", "تحديد الوصف الوظيفي والمهام والمسؤوليات الأساسية", "حفظ المسمى لربطه ببطاقات الموظفين وخطط التوظيف"],
      stepsEn: ["Enter formal designation title in Arabic and English", "Define key job description, duties, and qualifications", "Save designation to link with employees and staffing plans"]
    },

    "Employee": {
      icon: "👥",
      summaryAr: "الملف الشامل للموظف؛ البيانات الشخصية، المؤهلات، تفاصيل العقد، الراتب، ورقم الهوية والتأمينات.",
      summaryEn: "Comprehensive employee master file: personal details, contracts, salaries, and national IDs.",
      stepsAr: ["إدخال الاسم وتاريخ الميلاد والجنسية ورقم الهوية/الإقامة", "تحديد القسم والمسمى الوظيفي وتاريخ التعيين والفرع", "تحديد هيكل الراتب وطريقة الصرف وحفظ وتفعيل الملف"],
      stepsEn: ["Enter full name, birth date, nationality, and civil ID", "Assign department, designation, hire date, and branch", "Configure salary structure, payment mode, and submit"]
    },
    "Employee Group": {
      icon: "🏷️",
      summaryAr: "تصنيف الموظفين في مجموعات نوعية (إداريين، ميدانيين، مبيعات) لتسهيل التقارير والتخصيص.",
      summaryEn: "Categorize workforce into functional groups for targeted reporting and policy assignments.",
      stepsAr: ["إدخال اسم المجموعة وطبيعة عملها", "تحديد الموظفين المنضمين للمجموعة", "حفظ المجموعة لاستخدامها في فلاتر التقارير والرسائل"],
      stepsEn: ["Enter group title and operational classification", "Map employees belonging to designated group", "Save group for filtered reports and broadcasts"]
    },
    "Employee Grade": {
      icon: "🎖️",
      summaryAr: "تحديد السلالم والمراتب والدرجات الوظيفية ومستويات المزايا والبدلات المقابلة لكل درجة.",
      summaryEn: "Employee grading scale framework defining compensation bands, perks, and seniority grades.",
      stepsAr: ["إدخال رمز واسم الدرجة الوظيفية", "تحديد سلم الرواتب والحدود الدنيا والعليا للمزايا", "حفظ الدرجة وتطبيقها في عقود الموظفين"],
      stepsEn: ["Enter grade code, title, and rank hierarchy", "Set baseline salary scale and benefit thresholds", "Save grade to apply across employee contracts"]
    },

    "Leave Application": {
      icon: "🌴",
      summaryAr: "تقديم ومتابعة طلبات الإجازات (سنوية، مرضية، اضطرارية) والتحقق التلقائي من رصيد الموظف.",
      summaryEn: "Submit and approve leave requests (annual, sick, emergency) with auto-balance validation.",
      stepsAr: ["إنشاء طلب إجازة واختيار نوع الإجازة وتاريخ البداية والنهاية", "التحقق من كفاية الرصيد المتبقي وإرفاق التقارير إن وجدت", "حفظ وتقديم الطلب لاعتماده من المدير المباشر"],
      stepsEn: ["Create leave request, selecting leave type and start/end dates", "Verify leave balance quota and attach documentation if needed", "Submit application for direct line manager approval"]
    },
    "Compensatory Leave Request": {
      icon: "🔄",
      summaryAr: "طلب تعويض إجازة للموظف نظير عمله في أيام العطلات الأسبوعية أو الإجازات الرسمية.",
      summaryEn: "Request compensatory off days earned by employees for working on official weekends or holidays.",
      stepsAr: ["تحديد الموظف وتاريخ يوم العمل في العطلة", "التحقق من سجل الحضور لإثبات العمل الفعلي في اليوم المحدد", "اعتماد الطلب لإضافة يوم تعويضي إلى رصيد إجازات الموظف"],
      stepsEn: ["Select employee and designated holiday work date", "Verify attendance record proving active work on holiday", "Submit request to credit compensatory day into leave balance"]
    },

    "HR Settings": {
      icon: "⚙️",
      summaryAr: "الإعدادات العامة للموارد البشرية؛ سياسات التقاعد، التنبيهات التلقائية لانتهاء الوثائق، وتفضيلات النظام.",
      summaryEn: "Global HR parameters: retirement age rules, document expiry alerts, and system defaults.",
      stepsAr: ["تحديد سن التقاعد الافتراضي للموظفين", "ضبط فترات التنبيه المسبق لانتهاء الإقامات ورخص القيادة والجوازات", "تحديد سياسة الإجازات والموافقات وحفظ الإعدادات"],
      stepsEn: ["Set standard retirement age threshold", "Configure lead notification days for ID and passport renewals", "Define global leave validation policies and save"]
    },
    "Daily Work Summary Group": {
      icon: "📬",
      summaryAr: "إدارة مجموعات إرسال واستقبال تقارير وملخصات الإنجاز اليومي لفرق العمل بالبريد.",
      summaryEn: "Configure automated daily work summary broadcast groups and recipient mailing lists.",
      stepsAr: ["إنشاء مجموعة جديدة وتحديد ساعة إرسال التذكير اليومي", "إضافة الموظفين الملزمين بتقديم الملخص وقائمة المشرفين", "تفعيل المجموعة لأتمتة رسائل جمع الإنجاز اليومي"],
      stepsEn: ["Create group and set scheduled daily prompt dispatch hour", "Add reporting employees and recipient supervisor emails", "Enable group to automate daily work check-ins"]
    },
    "Team Updates": {
      icon: "📢",
      summaryAr: "لوحة نشر وتعميم التحديثات، التعاميم الإدارية، والإعلانات الداخلية لفريق العمل.",
      summaryEn: "Internal bulletin and announcement board broadcasting executive memos to staff.",
      stepsAr: ["كتابة التعميم أو التحديث الإداري وتحديد الفئة المستهدفة", "إرفاق المستندات أو اللوائح التنظيمية ذات الصلة", "نشر التحديث لإظهاره لكافة الموظفين المعنيين"],
      stepsEn: ["Draft administrative update and select recipient teams", "Attach relevant policy documents or files", "Publish update to broadcast across employee desk"]
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

    "Expense Claim": {
      icon: "💰",
      summaryAr: "تقديم ومراجعة مطالبات استرداد المصروفات النثرية ونفقات العمل التي دفعها الموظف.",
      summaryEn: "Submit and process employee business expense claims for reimbursement with receipts.",
      stepsAr: ["إنشاء مطالبة مصروفات جديدة وإرفاق فواتير الشراء والإيصالات", "تحديد بنود المصروفات والمبالغ المستحقة ومركز التكلفة", "اعتماد المطالبة وترحيل سند الصرف لتعويض الموظف"],
      stepsEn: ["Create expense claim and attach receipts and invoices", "Itemize expense categories, amounts, and cost center", "Submit claim for approval and payment reimbursement entry"]
    },
    "Employee Advance": {
      icon: "💵",
      summaryAr: "تسجيل وصرف السلف النقدية المؤقتة للموظفين وجدولة استقطاعها من الرواتب الشهرية.",
      summaryEn: "Disburse employee cash advances and schedule automated salary deductions.",
      stepsAr: ["إنشاء طلب سلفة للموظف وتحديد المبلغ والغرض", "تحديد الحساب المالي للصرف وطريقة الاسترداد من الراتب", "اعتماد السلفة وصرف المبلغ وجدولة أقساط السداد"],
      stepsEn: ["Create advance request, entering amount and business purpose", "Select disbursing cash/bank account and repayment mode", "Approve advance to generate payment and deduction schedule"]
    },
    "Travel Request": {
      icon: "✈️",
      summaryAr: "إدارة طلبات انتداب وسفر الموظفين؛ حجز التذاكر، بدلات السفر، ومصروفات الإقامة والتنقل.",
      summaryEn: "Corporate business travel requests: itineraries, allowances, accommodation, and per diems.",
      stepsAr: ["إنشاء طلب سفر وتحديد وجهة الانتداب وفترة السفر", "تحديد بدلات الانتداب المستحقة وتكاليف الإقامة والانتقال", "اعتماد الطلب وصرف البدلات وتوثيق تقرير المهمة عند العودة"],
      stepsEn: ["Create travel request with destination and travel dates", "Calculate travel per diem allowance and accommodation costs", "Submit for authorization and disburse travel advance"]
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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-for="${escapeHtml(btn.doctype)}" style="margin-left: 8px; margin-right: 8px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.12); color: #059669;">...</span>` : ""}
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
