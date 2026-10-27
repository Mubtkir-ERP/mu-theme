(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة صرف الرواتب — Salary Payout Workspace
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
    {
      labelEn: "Salary Slip",
      labelAr: "قسيمة الراتب",
      doctype: "Salary Slip",
      countFilter: { docstatus: 0 },
      color: "#e11d48",
      statusLabelEn: "Draft",
      statusLabelAr: "مسودة"
    },
    {
      labelEn: "Payroll Entry",
      labelAr: "مسير الرواتب",
      doctype: "Payroll Entry",
      countFilter: { docstatus: 0 },
      color: "#f59e0b",
      statusLabelEn: "Draft",
      statusLabelAr: "مسودة"
    },
    {
      labelEn: "Salary Register",
      labelAr: "مسير الرواتب العام",
      report: "Salary Register",
      isReport: true,
      color: "#1e40af"
    }
  ];

  /* ─────────────────────────────────────────
     ٢. هيكل الأقسام والبطاقات (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Transactions & Reports",
      [
        [
          "Masters",
          "🏛️",
          [
            "Salary Component",
            "Salary Structure",
            "Income Tax Slab",
            "Payroll Period"
          ]
        ],
        [
          "Payroll",
          "💳",
          [
            "Salary Structure Assignment",
            "Bulk Salary Structure Assignment",
            "Salary Slip",
            "Payroll Entry",
            "Salary Withholding"
          ]
        ],
        [
          "Incentives",
          "🎁",
          [
            "Additional Salary",
            "Employee Incentive",
            "Retention Bonus"
          ]
        ],
        [
          "Accounting",
          "📊",
          [
            "Chart of Accounts",
            "Chart of Cost Centers",
            "Payment Entry",
            "Journal Entry",
            "Accounts Settings",
            "Accounting Dimension",
            "Currency"
          ]
        ],
        [
          "Accounting Reports",
          "📈",
          [
            "General Ledger",
            "Accounts Payable",
            "Accounts Receivable"
          ]
        ],
        [
          "Payroll Reports",
          "📑",
          [
            "Salary Register",
            "Bank Remittance",
            "Salary Payments Based On Payment Mode",
            "Salary Payments via ECS",
            "Income Tax Computation"
          ]
        ],
        [
          "Deduction Reports",
          "📉",
          [
            "Provident Fund Deductions",
            "Professional Tax Deductions",
            "Income Tax Deductions"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٣. التقارير والمستندات المفردة والشجرية
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "General Ledger",
    "Accounts Payable",
    "Accounts Receivable",
    "Salary Register",
    "Bank Remittance",
    "Salary Payments Based On Payment Mode",
    "Salary Payments Based On Payment Mode ...",
    "Salary Payments via ECS",
    "Income Tax Computation",
    "Provident Fund Deductions",
    "Professional Tax Deductions",
    "Income Tax Deductions"
  ]);

  const singleDocs = new Set([
    "Accounts Settings"
  ]);

  const treeDocs = new Set([
    "Chart of Accounts",
    "Chart of Cost Centers"
  ]);

  const customRoutes = {
    "Chart of Accounts": "Tree/Account",
    "Chart of Cost Centers": "Tree/Cost Center",
    "Accounts Settings": "Form/Accounts Settings",
    "Salary Payments Based On Payment Mode ...": "query-report/Salary Payments Based On Payment Mode"
  };

  /* ─────────────────────────────────────────
     ٤. قاموس الترجمة العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Salary Payout": "صرف الرواتب",
    "Transactions & Reports": "الحركات والتقارير",
    "Masters": "البيانات الأساسية",
    "Payroll": "الرواتب والأجور",
    "Incentives": "الحوافز والمكافآت",
    "Accounting": "المحاسبة المالية",
    "Accounting Reports": "تقارير المحاسبة",
    "Payroll Reports": "تقارير الرواتب",
    "Deduction Reports": "تقارير الاستقطاعات",

    "Salary Component": "بند الراتب",
    "Salary Structure": "هيكل الراتب",
    "Income Tax Slab": "شرائح ضريبة الدخل",
    "Payroll Period": "فترة الرواتب",

    "Salary Structure Assignment": "تعيين هيكل الراتب",
    "Bulk Salary Structure Assignment": "تعيين هياكل الرواتب الجماعي",
    "Salary Slip": "قسيمة الراتب",
    "Payroll Entry": "مسير الرواتب",
    "Salary Withholding": "استقطاع وحجز الراتب",

    "Additional Salary": "راتب إضافي / استقطاع",
    "Employee Incentive": "حافز الموظف",
    "Retention Bonus": "مكافأة الاستبقاء",

    "Chart of Accounts": "دليل الحسابات",
    "Chart of Cost Centers": "دليل مراكز التكلفة",
    "Payment Entry": "سند صرف / قبض",
    "Journal Entry": "قيد اليومية",
    "Accounts Settings": "إعدادات الحسابات",
    "Accounting Dimension": "الأبعاد المحاسبية",
    "Currency": "العملات",

    "General Ledger": "دفتر الأستاذ العام",
    "Accounts Payable": "أعمار الديون الدائنة",
    "Accounts Receivable": "أعمار الديون المدينة",
    "Salary Register": "مسير الرواتب العام",
    "Bank Remittance": "التحويلات البنكية للمرتبات",
    "Salary Payments Based On Payment Mode": "مدفوعات الرواتب حسب طريقة السداد",
    "Salary Payments Based On Payment Mode ...": "مدفوعات الرواتب حسب طريقة السداد",
    "Salary Payments via ECS": "تحويلات الرواتب عبر النظام الإلكتروني",
    "Income Tax Computation": "احتساب ضريبة الدخل",

    "Provident Fund Deductions": "استقطاعات صندوق الادخار والتأمينات",
    "Professional Tax Deductions": "استقطاعات الضريبة المهنية",
    "Income Tax Deductions": "استقطاعات ضريبة الدخل"
  };

  /* ─────────────────────────────────────────
     ٥. شروحات وتفاصيل الشاشات التشغيلية والإعدادات
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Salary Component": {
      icon: "💵",
      summaryAr: "تعريف بنود ومكونات الراتب (أساسي، بدلات، إضافي، استقطاعات) وتحديد ارتباطها المحاسبي وصيغها الحسابية.",
      summaryEn: "Define salary components (earnings, allowances, deductions) and configure their accounting ledger mappings.",
      stepsAr: [
        "إدخال مسمى البند ونوعه (استحقاق أو استقطاع)",
        "ربط البند بحساب الأستاذ العام المخصص في دليل الحسابات",
        "تحديد ما إذا كان البند يعتمد على صيغة حسابية أو نسبة مئوية",
        "حفظ البند ليدخل تلقائياً في هيكل الراتب"
      ],
      stepsEn: [
        "Enter component name and select type (Earning or Deduction)",
        "Link component to default general ledger expense/payable account",
        "Specify condition formula or amount percentage if applicable",
        "Save component for use in salary structures"
      ]
    },
    "Salary Structure": {
      icon: "📑",
      summaryAr: "بناء قوالب وهياكل الرواتب التي تجمع الاستحقاقات والبدلات والاستقطاعات لكل وظيفة أو درجة وظيفية.",
      summaryEn: "Build comprehensive salary structure templates combining earnings and deductions for positions or tiers.",
      stepsAr: [
        "تحديد مسمى الهيكل وتكرار الصرف (شهري، أسبوعي)",
        "إدراج بنود الاستحقاقات والبدلات مع الصيغ والقيم",
        "إدراج بنود الاستقطاعات والتأمينات والضرائب المقررة",
        "حفظ واعتماد هيكل الراتب ليصبح جاهزاً للتعيين للموظفين"
      ],
      stepsEn: [
        "Specify structure title and payroll frequency (monthly, weekly)",
        "Add earning components, allowances, and custom formulas",
        "Add deduction components, social insurance, and tax slabs",
        "Save and submit salary structure template"
      ]
    },
    "Income Tax Slab": {
      icon: "⚖️",
      summaryAr: "تعريف وإدارة شرائح ضريبة الدخل والنسب المعفاة والنسب المفروضة حسب الأنظمة الضريبية السائدة.",
      summaryEn: "Configure income tax slabs, exemptions, and standard deduction brackets according to local regulations.",
      stepsAr: [
        "تحديد سنة التقييم والأنظمة الضريبية المعمول بها",
        "إدخال نطاقات الدخل (من - إلى) ونسبة الضريبة لكل شريحة",
        "تحديد الإعفاءات القياسية والخصومات النظامية",
        "حفظ واعتماد جدول الشرائح الضريبية"
      ],
      stepsEn: [
        "Specify assessment year and applicable tax regime",
        "Define taxable income ranges (From - To) and applicable rates",
        "Set standard deductions and applicable exemptions",
        "Save and submit tax slab configuration"
      ]
    },
    "Payroll Period": {
      icon: "📅",
      summaryAr: "إنشاء وإدارة فترات الرواتب المالية لتنظيم دورات الرواتب وتوزيع الإعفاءات السنوية.",
      summaryEn: "Define payroll periods and financial cycles to manage salary runs and distribute tax exemptions.",
      stepsAr: [
        "تحديد تاريخ بداية ونهاية فترة الرواتب",
        "ربط الفترة بالسنة المالية والشركة المختصة",
        "تحديد تواريخ صرف الرواتب المتوقعة",
        "حفظ الفترة لربطها بمسيرات واستقطاعات الرواتب"
      ],
      stepsEn: [
        "Set start and end dates for the payroll period",
        "Link period to company and fiscal year",
        "Define expected salary payout schedule",
        "Save period for payroll runs and tax processing"
      ]
    },
    "Salary Structure Assignment": {
      icon: "👤",
      summaryAr: "ربط وتخصيص هيكل الراتب المعتمد بموظف محدد مع تحديد تاريخ بدء السريان والراتب الأساسي.",
      summaryEn: "Assign approved salary structures to specific employees with effective start dates and base salary.",
      stepsAr: [
        "اختيار الموظف وهيكل الراتب المعتمد",
        "تحديد تاريخ سريان تطبيق الراتب وقيمة الراتب الأساسي",
        "اختيار جهة الصرف ومركز التكلفة التابع للموظف",
        "حفظ واعتماد التعيين لتوليد مسيرات الرواتب تلقائياً"
      ],
      stepsEn: [
        "Select employee and approved salary structure",
        "Set effective date and base/variable pay values",
        "Select company payment account and cost center",
        "Save and submit salary structure assignment"
      ]
    },
    "Bulk Salary Structure Assignment": {
      icon: "👥",
      summaryAr: "أداة لتعيين هياكل الرواتب لمجموعة كبيرة من الموظفين دفعة واحدة بناءً على القسم أو الدرجة الوظيفية.",
      summaryEn: "Utility to bulk assign salary structures to multiple employees at once filtered by department or grade.",
      stepsAr: [
        "تحديد معايير الفلترة (الشركة، القسم، الفرع، الدرجة)",
        "اختيار هيكل الراتب وتاريخ بدء السريان",
        "جلب الموظفين المطابقين للشروط وتأكيد التعيين",
        "تنفيذ التعيين الجماعي واعتماده بنقرة واحدة"
      ],
      stepsEn: [
        "Filter employees by company, department, branch, or grade",
        "Select salary structure and effective start date",
        "Fetch matching employees and review assignment table",
        "Process and submit bulk assignments with one click"
      ]
    },
    "Salary Slip": {
      icon: "🧾",
      summaryAr: "قسيمة راتب الموظف الشهرية متضمنة تفاصيل أيام العمل، البدلات، الاستقطاعات، وصافي المبلغ المستحق.",
      summaryEn: "Detailed employee monthly salary slip showing working days, earnings, deductions, and net payable.",
      stepsAr: [
        "اختيار الموظف وفترة الراتب (أو توليدها تلقائياً من مسير الرواتب)",
        "مراجعة أيام الحضور والغياب والإجازات المخصومة",
        "مراجعة البدلات والمكافآت وصافي المبلغ القابل للتحويل",
        "حفظ واعتماد القسيمة لإرسالها بالبريد أو طباعتها"
      ],
      stepsEn: [
        "Select employee and payroll period (or auto-generate via payroll entry)",
        "Review attendance, leaves, and calculated deduction days",
        "Verify earnings, additional allowances, and net payable sum",
        "Save and submit slip to email or print"
      ]
    },
    "Payroll Entry": {
      icon: "⚡",
      summaryAr: "معالجة مسير الرواتب المجمع لجميع موظفي الشركة أو قسم محدد وتوليد قسائم الرواتب والقيود المالية.",
      summaryEn: "Process company-wide or departmental payroll runs, generating salary slips and financial entries.",
      stepsAr: [
        "تحديد الشركة وفترة الرواتب وتاريخ الصرف",
        "جلب الموظفين المستحقين وإنشاء قسائم الرواتب المجمعة",
        "مراجعة إجمالي الرواتب والبدلات والاستقطاعات",
        "اعتماد المسير وترحيل القيود المحاسبية للمصرف أو صندوق الرواتب"
      ],
      stepsEn: [
        "Specify company, payroll period, and posting date",
        "Fetch eligible employees and create batch salary slips",
        "Review total gross pay, deductions, and net payout",
        "Submit entry and post accounting journal entry to bank account"
      ]
    },
    "Salary Withholding": {
      icon: "🔒",
      summaryAr: "تسجيل مبالغ الاستقطاع أو الحجز المؤقت على رواتب الموظفين لأسباب إدارية أو قانونية أو قضائية.",
      summaryEn: "Record salary withholding or temporary salary retention for administrative or legal reasons.",
      stepsAr: [
        "اختيار الموظف وفترة سريان الحجز أو الاستقطاع",
        "تحديد سبب الحجز والجهة الطالبة أو المستند المرجعي",
        "إدخال قيمة الاستقطاع أو النسبة المقتطعة من الراتب",
        "حفظ واعتماد السجل ليتم تفعيله تلقائياً في مسير الرواتب"
      ],
      stepsEn: [
        "Select employee and withholding effective period",
        "Specify reason, legal reference, or order document",
        "Enter withheld amount or percentage from gross/net pay",
        "Save and submit record to apply to salary calculations"
      ]
    },
    "Additional Salary": {
      icon: "➕",
      summaryAr: "إضافة مبالغ استثنائية أو مستحقات إضافية (أو استقطاعات لمرة واحدة) على راتب موظف لشهر محدد.",
      summaryEn: "Add one-off recurring or non-recurring salary adjustments (bonuses or extra deductions) to payroll.",
      stepsAr: [
        "اختيار الموظف وبند الراتب (مكافأة، استقطاع، تعويض)",
        "تحديد تاريخ التطبيق ومبلغ الزيادة أو الاستقطاع",
        "إرفاق المستند الداعم أو سبب الصرف الإضافي",
        "حفظ واعتماد السجل لتسويته في قسيمة الراتب القادمة"
      ],
      stepsEn: [
        "Select employee and salary component (bonus, deduction, adjustment)",
        "Set payroll application date and addition/deduction amount",
        "Attach justification note or management approval",
        "Save and submit to process in the upcoming payroll slip"
      ]
    },
    "Employee Incentive": {
      icon: "🎯",
      summaryAr: "تسجيل وصرف الحوافز والمكافآت المرتبطة بالأداء ومبيعات الموظف وإدراجها بمسير الرواتب.",
      summaryEn: "Record and disburse employee performance-based or sales incentives through payroll runs.",
      stepsAr: [
        "اختيار الموظف وتاريخ استحقاق الحافز",
        "تحديد قيمة الحافز ونوع المكافأة أو هدف الأداء المحقق",
        "ربط الحافز بمركز التكلفة المختص",
        "حفظ واعتماد الحافز ليضاف تلقائياً في مسير الرواتب"
      ],
      stepsEn: [
        "Select employee and incentive due date",
        "Enter incentive amount and target or achievement reason",
        "Link to corresponding project or departmental cost center",
        "Save and submit to disburse within the payroll period"
      ]
    },
    "Retention Bonus": {
      icon: "🏆",
      summaryAr: "إدارة مكافآت الاستبقاء والولاء الوظيفي المجدولة مع تواريخ الاستحقاق وشروط البقاء بالخدمة.",
      summaryEn: "Manage scheduled employee retention bonuses, milestones, and service continuity conditions.",
      stepsAr: [
        "اختيار الموظف وخطة مكافأة الاستبقاء المعتمدة",
        "تحديد إجمالي مبلغ المكافأة وتاريخ الصرف المستهدف",
        "مراجعة الشروط التعاقدية والاستحقاق الزمني",
        "حفظ واعتماد السجل للصرف التلقائي عند استيفاء المدة"
      ],
      stepsEn: [
        "Select employee and retention bonus agreement plan",
        "Set bonus amount and targeted retention milestone date",
        "Verify contract terms and required service duration",
        "Save and submit record for scheduled disbursement"
      ]
    },
    "Chart of Accounts": {
      icon: "🌳",
      summaryAr: "عرض وإدارة دليل الحسابات المالي الشجري للشركة لربط حسابات الرواتب والأجور والتأمينات بدقة.",
      summaryEn: "Browse and configure hierarchical Chart of Accounts to organize payroll and liability ledgers.",
      stepsAr: [
        "استعراض شجرة الحسابات واختيار فرع المصروفات أو الخصوم",
        "التأكد من توفر حسابات رواتب مستحقة، تأمينات، وبدلات",
        "إضافة حساب جديد أو تعديل خصائص الحساب المحاسبي",
        "حفظ التغييرات لمزامنتها مع قيود الرواتب"
      ],
      stepsEn: [
        "Navigate account tree to locate expenses or payable liabilities",
        "Ensure payroll payable, allowances, and tax accounts exist",
        "Add new ledger account or edit accounting properties",
        "Save changes to sync with payroll journal postings"
      ]
    },
    "Chart of Cost Centers": {
      icon: "🌲",
      summaryAr: "شجرة مراكز التكلفة لتوزيع مصاريف الرواتب والأجور على المشاريع والأقسام والفروع.",
      summaryEn: "Hierarchical Chart of Cost Centers to allocate payroll expenses to departments and projects.",
      stepsAr: [
        "استعراض مراكز التكلفة للأقسام والفروع التشغيلية",
        "تحديد مركز التكلفة الافتراضي لكل قسم أو إدارة",
        "ربط مراكز التكلفة بهياكل وتعيينات رواتب الموظفين",
        "حفظ التعديلات لاعتمادها في التقارير المحاسبية"
      ],
      stepsEn: [
        "Browse departmental and regional cost center tree",
        "Identify default cost centers for business units",
        "Assign cost centers in employee salary structures",
        "Save updates to enable accurate cost accounting"
      ]
    },
    "Payment Entry": {
      icon: "💸",
      summaryAr: "تسجيل سندات صرف الرواتب للموظفين نقداً أو عبر البنك وإقفال التزامات الرواتب المستحقة.",
      summaryEn: "Create payment entries to disburse salaries via bank or cash and clear payable liabilities.",
      stepsAr: [
        "اختيار نوع السند (دفع Pay) والطرف المستلم",
        "تحديد حساب البنك الصادر منه وحساب الرواتب الدائن",
        "ربط السند بقسائم أو مسيرات الرواتب المستحقة",
        "حفظ واعتماد السند لتحديث الأرصدة البنكية والدفترية"
      ],
      stepsEn: [
        "Select payment entry type (Pay) and party type",
        "Specify disbursing bank account and payroll payable account",
        "Allocate payment to outstanding salary slips or payroll entries",
        "Save and submit entry to update general ledger balances"
      ]
    },
    "Journal Entry": {
      icon: "📖",
      summaryAr: "إنشاء قيود اليومية المحاسبية المخصصة لتسوية الرواتب أو إعادة توزيع التكاليف بين الفروع.",
      summaryEn: "Create manual journal entries for payroll adjustments, reclassifications, and settlements.",
      stepsAr: [
        "تحديد نوع القيد وتاريخ المعاملة المالية",
        "إدخال الحسابات المدينة والدائنة مع مراكز التكلفة",
        "التحقق من توازن إجمالي المدين والدائن",
        "حفظ وترحيل القيد إلى دفتر الأستاذ العام"
      ],
      stepsEn: [
        "Select entry type and posting date",
        "Enter debit and credit accounts with associated cost centers",
        "Verify balance between total debits and credits",
        "Save and submit journal entry to post to general ledger"
      ]
    },
    "Accounts Settings": {
      icon: "⚙️",
      summaryAr: "الإعدادات العامة للنظام المحاسبي؛ لضبط تجميد الحسابات وسلوكيات قيود الرواتب والعملات.",
      summaryEn: "Global accounting settings to configure ledger freezing, credit limits, and payroll posting defaults.",
      stepsAr: [
        "مراجعة خيارات التحقق من الأرصدة وتواريخ تجميد الإدخال",
        "ضبط سلوك إنشاء قيود الرواتب والمدفوعات الآلية",
        "تحديد حسابات الفروقات المصرفية وفروق العملات",
        "حفظ الإعدادات لتطبيقها على كافة العمليات المالية"
      ],
      stepsEn: [
        "Review general ledger validation and book closing freeze dates",
        "Configure automated payment and payroll posting behaviors",
        "Set round-off, exchange gain/loss, and variance ledgers",
        "Save settings to enforce across financial transactions"
      ]
    },
    "Accounting Dimension": {
      icon: "📐",
      summaryAr: "إنشاء أبعاد محاسبية إضافية لربط مصاريف الرواتب بتحليلات مخصصة خارج مراكز التكلفة.",
      summaryEn: "Create custom accounting dimensions to tag payroll expenses with custom analytical tags.",
      stepsAr: [
        "اختيار المستند المصدر أو إنشاء بعد مالي جديد",
        "تفعيل البعد المحاسبي على مستندات الرواتب والحسابات",
        "تحديد الصلاحيات وسلوكيات الترحيل الإلزامي",
        "حفظ وتحديث الأبعاد ليتم تضمينها في القيود"
      ],
      stepsEn: [
        "Select reference DocType or create custom dimension",
        "Enable dimension across payroll entries and accounting docs",
        "Configure mandatory behavior and reporting views",
        "Save to apply dimension fields throughout financial forms"
      ]
    },
    "Currency": {
      icon: "💱",
      summaryAr: "إدارة العملات وأسعار الصرف الرسمية لصرف رواتب الموظفين بعملات متعددة بدقة.",
      summaryEn: "Manage currencies and official exchange rates for multi-currency payroll disbursements.",
      stepsAr: [
        "إضافة رمز العملة واسمها الرسمي ورمز الكسر",
        "تحديث أسعار صرف العملات الأجنبية مقابل العملة الأساسية",
        "تحديد المنازل العشرية وقواعد التقريب المالية",
        "حفظ العملة لتمكينها في تعيينات وقسائم الرواتب"
      ],
      stepsEn: [
        "Add currency code, official name, and fractional symbol",
        "Update market exchange rates relative to company base currency",
        "Set decimal precision and financial rounding rules",
        "Save currency to allow assignments and slips in that currency"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٦. أدوات مساعدة
  ───────────────────────────────────────── */

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function translate(key) {
    if (!key) return "";
    if (isArabic && arabicFallback[key]) return arabicFallback[key];
    if (window.frappe?._) {
      const translated = window.frappe._(key);
      if (translated && translated !== key) return translated;
    }
    return key;
  }

  /* ─────────────────────────────────────────
     ٧. نافذة التفاصيل المنبثقة القياسية المعتمدة
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const isSettingDoc = singleDocs.has(itemName);
    const title = translate(itemName);
    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? "تفاصيل الشاشة وإجراءات العمل المعتمدة." : "Screen details and workflows.");

    const steps = desc
      ? (isArabic ? desc.stepsAr : desc.stepsEn)
      : (isArabic
          ? [
              "فتح الشاشة من القائمة",
              "إدخال البيانات والمعلومات المطلوبة",
              "حفظ واعتماد السجل في النظام"
            ]
          : [
              "Open screen from list",
              "Enter required information",
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
              <span class="erp-quick-badge" data-shortcut-badge="${idx}" style="display: none;"></span>
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
      if (item.report) {
        frappe.set_route("query-report", item.report);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });

    fetchShortcutCounts();
  }

  function fetchShortcutCounts() {
    if (!window.frappe || typeof frappe.call !== "function") return;

    quickActionButtons.forEach((btn, idx) => {
      if (!btn.doctype || !btn.countFilter) return;

      frappe.call({
        method: "frappe.client.get_count",
        args: {
          doctype: btn.doctype,
          filters: btn.countFilter
        },
        callback: r => {
          const count = typeof r.message === "number" ? r.message : 0;
          const badge = quickActions.querySelector(`[data-shortcut-badge="${idx}"]`);
          if (badge) {
            const statusLabel = isArabic ? (btn.statusLabelAr || "") : (btn.statusLabelEn || "");
            badge.textContent = `${count} ${statusLabel}`.trim();
            badge.style.display = "inline-block";
          }
        }
      });
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
      event.preventDefault();
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
