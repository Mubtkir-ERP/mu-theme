(() => {
  /*
   * ══════════════════════════════════════════
   *  لوحة الرعاية الصحية والمراكز الطبية — Healthcare Workspace
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
     ١. البطاقات الإحصائية (Statistics)
  ───────────────────────────────────────── */

  const statsCards = [
    {
      id: "open-appointments",
      icon: "📅",
      labelEn: "Open Appointments",
      labelAr: "المواعيد المفتوحة",
      doctype: "Patient Appointment",
      filter: { status: "Open" }
    },
    {
      id: "active-patients",
      icon: "👥",
      labelEn: "Active Patients",
      labelAr: "المرضى النشطون",
      doctype: "Patient",
      filter: { disabled: 0 }
    },
    {
      id: "vacant-units",
      icon: "🏥",
      labelEn: "Vacant Units",
      labelAr: "الوحدات الشاغرة",
      doctype: "Healthcare Service Unit",
      filter: { occupancy_status: "Vacant" }
    },
    {
      id: "active-practitioners",
      icon: "🩺",
      labelEn: "Active Practitioners",
      labelAr: "الممارسون الصحيون",
      doctype: "Healthcare Practitioner",
      filter: { status: "Active" }
    }
  ];

  /* ─────────────────────────────────────────
     ٢. أزرار الوصول السريع (Your Shortcuts)
  ───────────────────────────────────────── */

  const quickActionButtons = [
    {
      labelEn: "Patient Appointment",
      labelAr: "موعد مريض",
      doctype: "Patient Appointment",
      hasCount: true,
      filter: { status: "Open" },
      suffixEn: "Open",
      suffixAr: "مفتوح"
    },
    {
      labelEn: "Patient",
      labelAr: "سجل المرضى",
      doctype: "Patient",
      hasCount: true,
      filter: { disabled: 0 },
      suffixEn: "Active",
      suffixAr: "نشط"
    },
    {
      labelEn: "Healthcare Service Unit",
      labelAr: "الوحدات الطبية",
      doctype: "Healthcare Service Unit",
      hasCount: true,
      filter: { occupancy_status: "Vacant" },
      suffixEn: "Vacant",
      suffixAr: "شاغر"
    },
    {
      labelEn: "Healthcare Practitioner",
      labelAr: "الممارسون الصحيون",
      doctype: "Healthcare Practitioner",
      hasCount: true,
      filter: { status: "Active" },
      suffixEn: "Active",
      suffixAr: "نشط"
    },
    {
      labelEn: "Patient History",
      labelAr: "السجل الطبي للمريض",
      route: "patient_history"
    },
    {
      labelEn: "Dashboard",
      labelAr: "لوحة مؤشرات الأداء",
      route: "dashboard-view/Healthcare"
    }
  ];

  /* ─────────────────────────────────────────
     ٣. هيكل الأقسام (مطابق تماماً للصورة)
  ───────────────────────────────────────── */

  const sections = [
    [
      "Masters & Settings",
      [
        [
          "Masters",
          "👨‍⚕️",
          [
            "Patient",
            "Healthcare Practitioner",
            "Practitioner Schedule",
            "Medical Department",
            "Patient Care Type"
          ]
        ],
        [
          "Consultation",
          "🩺",
          [
            "Patient Appointment",
            "Vital Signs",
            "Patient Encounter",
            "Clinical Procedure",
            "Fee Validity"
          ]
        ],
        [
          "Orders",
          "💊",
          [
            "Service Request",
            "Medication Request"
          ]
        ],
        [
          "Inpatient",
          "🛏️",
          [
            "Inpatient Record",
            "Inpatient Medication Order",
            "Inpatient Medication Entry"
          ]
        ],
        [
          "Rehabilitation and Physiotherapy",
          "🧘",
          [
            "Therapy Session",
            "Patient Assessment",
            "Therapy Plan",
            "Exercise Type",
            "Therapy Type",
            "Therapy Plan Template",
            "Patient Assessment Template"
          ]
        ],
        [
          "Diagnostic Module",
          "🔬",
          [
            "Diagnostic Report",
            "Observation",
            "Observation Template"
          ]
        ],
        [
          "Nursing",
          "🧑‍⚕️",
          [
            "Nursing Task",
            "Healthcare Activity",
            "Nursing Checklist Template"
          ]
        ],
        [
          "Laboratory",
          "🧪",
          [
            "Lab Test",
            "Sample Collection"
          ]
        ],
        [
          "Service Units",
          "🏥",
          [
            "Healthcare Service Unit",
            "Healthcare Service Unit Type"
          ]
        ],
        [
          "Consultation Setup",
          "📋",
          [
            "Appointment Type",
            "Clinical Procedure Template",
            "Treatment Plan Template",
            "Dosage Form",
            "Prescription Dosage",
            "Prescription Duration",
            "Complaint",
            "Diagnosis"
          ]
        ],
        [
          "Laboratory Setup",
          "🧬",
          [
            "Lab Test Template",
            "Lab Test Sample",
            "Lab Test UOM",
            "Antibiotic",
            "Sensitivity"
          ]
        ],
        [
          "Terminology Mapping",
          "🏷️",
          [
            "Code Value",
            "Code System"
          ]
        ],
        [
          "Settings",
          "⚙️",
          [
            "Healthcare Settings",
            "Patient History Settings"
          ]
        ]
      ]
    ],
    [
      "Reports",
      [
        [
          "Reports",
          "📊",
          [
            "Patient Appointment Analytics",
            "Lab Test Report",
            "Diagnosis Trends"
          ]
        ],
        [
          "Custom Reports",
          "📈",
          [
            "تقرير متابعة الجلسات"
          ]
        ]
      ]
    ]
  ];

  /* ─────────────────────────────────────────
     ٤. تصنيف المسارات والتقارير
  ───────────────────────────────────────── */

  const reportNames = new Set([
    "Patient Appointment Analytics",
    "Lab Test Report",
    "Diagnosis Trends",
    "تقرير متابعة الجلسات"
  ]);

  const singleDocs = new Set([
    "Healthcare Settings",
    "Patient History Settings"
  ]);

  const treeDocs = new Set([
    "Healthcare Service Unit",
    "Medical Department"
  ]);

  const customRoutes = {
    "Dashboard": "dashboard-view/Healthcare",
    "Patient History": "patient_history",
    "تقرير متابعة الجلسات": "query-report/تقرير متابعة الجلسات"
  };

  /* ─────────────────────────────────────────
     ٥. قاموس الترجمة العربية
  ───────────────────────────────────────── */

  const arabicFallback = {
    "Masters & Settings": "البيانات الأساسية والإعدادات",
    "Reports": "التقارير",
    "Statistics": "الإحصائيات",
    "Quick Actions": "الاختصارات السريعة",
    "Your Shortcuts": "اختصاراتك السريعة",
    "Reports & Masters": "البيانات والتقارير الطبية",

    "Masters": "البيانات الرئيسية",
    "Consultation": "العيادات والاستشارات",
    "Orders": "الطلبات والوصفات الطبية",
    "Inpatient": "التنويم والإقامة الداخلية",
    "Rehabilitation and Physiotherapy": "التأهيل والعلاج الطبيعي",
    "Diagnostic Module": "التشخيص والملاحظات",
    "Nursing": "التمريض والرعاية التمريضية",
    "Laboratory": "المختبر والتحاليل",
    "Service Units": "الوحدات والعيادات الطبية",
    "Consultation Setup": "تهيئة العيادات والاستشارات",
    "Laboratory Setup": "تهيئة المختبر والتحاليل",
    "Terminology Mapping": "ربط المصطلحات والأكواد",
    "Settings": "إعدادات النظام",
    "Custom Reports": "التقارير المخصصة",

    "Patient": "ملفات المرضى",
    "Healthcare Practitioner": "الممارسون الصحيون (الأطباء)",
    "Practitioner Schedule": "جدول دوام الممارسين",
    "Medical Department": "الأقسام والتخصصات الطبية",
    "Patient Care Type": "أنواع رعاية المرضى",

    "Patient Appointment": "مواعيد المرضى",
    "Vital Signs": "العلامات الحيوية",
    "Patient Encounter": "جلسة الكشف / المقابلة الطبية",
    "Clinical Procedure": "الإجراءات الإكلينيكية",
    "Fee Validity": "صلاحية كشف المريض",

    "Service Request": "طلبات الخدمات الطبية",
    "Medication Request": "الوصفات والأدوية المطلوبة",

    "Inpatient Record": "سجل التنويم والإقامة",
    "Inpatient Medication Order": "أمر صرف أدوية التنويم",
    "Inpatient Medication Entry": "قيد إعطاء دواء التنويم",

    "Therapy Session": "جلسات العلاج الطبيعي",
    "Patient Assessment": "تقييم حالة المريض",
    "Therapy Plan": "خطة العلاج التأهيلي",
    "Exercise Type": "أنواع التمارين العلاجية",
    "Therapy Type": "أنواع العلاج الطبيعي",
    "Therapy Plan Template": "قوالب خطط العلاج",
    "Patient Assessment Template": "قوالب تقييم المرضى",

    "Diagnostic Report": "التقارير التشخيصية",
    "Observation": "الملاحظات الإكلينيكية",
    "Observation Template": "قوالب الملاحظات",

    "Nursing Task": "المهام التمريضية",
    "Healthcare Activity": "الأنشطة الصحية للتمريض",
    "Nursing Checklist Template": "قوالب قوائم فحص التمريض",

    "Lab Test": "التحاليل والفحوصات المخبرية",
    "Sample Collection": "سحب وجمع العينات",

    "Healthcare Service Unit": "وحدات الخدمة والأسرة الطبية",
    "Healthcare Service Unit Type": "أنواع الوحدات والأسرة",

    "Appointment Type": "أنواع المواعيد",
    "Clinical Procedure Template": "قوالب الإجراءات الطبية",
    "Treatment Plan Template": "قوالب خطط العلاج",
    "Dosage Form": "أشكال الجرعات الدوائية",
    "Prescription Dosage": "جرعات الوصفات",
    "Prescription Duration": "مدد الوصفات العلاجية",
    "Complaint": "الشكاوى والأعراض المرضية",
    "Diagnosis": "التشخيصات الطبية (ICD)",

    "Lab Test Template": "قوالب التحاليل المخبرية",
    "Lab Test Sample": "عينات التحاليل",
    "Lab Test UOM": "وحدات قياس التحاليل",
    "Antibiotic": "المضادات الحيوية",
    "Sensitivity": "حساسية المضادات",

    "Code Value": "قيم الأكواد الطبية",
    "Code System": "أنظمة الترميز الطبي",

    "Healthcare Settings": "إعدادات الرعاية الصحية",
    "Patient History Settings": "إعدادات السجل الطبي",

    "Patient Appointment Analytics": "تحليلات مواعيد المرضى",
    "Lab Test Report": "تقرير الفحوصات المخبرية",
    "Diagnosis Trends": "تقرير اتجاهات التشخيص",
    "تقرير متابعة الجلسات": "تقرير متابعة الجلسات التأهيلية",
    "Dashboard": "لوحة المعلومات",
    "Patient History": "السجل المرضي"
  };

  /* ─────────────────────────────────────────
     ٦. شروحات وتفاصيل الشاشات مع خطوات العمل
  ───────────────────────────────────────── */

  const itemDescriptions = {
    "Patient": {
      icon: "👤",
      summaryAr: "فتح وإدارة ملفات المرضى الإلكترونية، وتوثيق البيانات الشخصية والتأمينية وتاريخ الحالات المرضية.",
      summaryEn: "Manage electronic patient records, personal information, insurance coverage, and medical history.",
      stepsAr: [
        "الضغط على «مريض جديد» وإدخال الاسم ورقم الهوية أو الإقامة",
        "تحديد تاريخ الميلاد والجنس وبيانات التواصل والعنوان الوطني",
        "ربط المريض بشركة التأمين وبوليصة التغطية إن وجدت",
        "تسجيل فصيلة الدم وأي حساسيات أو أمراض مزمنة سابقة",
        "حفظ الملف ليصبح للمريض رقم طبي موحد (MRN) دائم"
      ],
      stepsEn: [
        "Click «New Patient» and input full name and National ID/Iqama",
        "Set date of birth, gender, contact details, and national address",
        "Attach insurance provider and policy coverage if applicable",
        "Record blood type, known allergies, and chronic conditions",
        "Save patient profile to generate a permanent Medical Record Number (MRN)"
      ]
    },
    "Patient Appointment": {
      icon: "📅",
      summaryAr: "حجز وجدولة مواعيد المرضى في العيادات الخارجية ومتابعة حالة الحضور والانتظار والاعتذار.",
      summaryEn: "Schedule patient appointments in outpatient clinics, tracking arrival, waiting, and cancellations.",
      stepsAr: [
        "الضغط على «جديد» واختيار المريض أو فتح ملف جديد له",
        "تحديد الطبيب المعالج أو الممارس الصحي والقسم الطبي",
        "اختيار نوع الموعد (كشف أول، إعادة، استشارة سريعة)",
        "تحديد التاريخ والوقت المتاح وفق جدول دوام الطبيب",
        "حفظ الموعد لتصل رسالة تأكيد للمريض وجدولة العيادة"
      ],
      stepsEn: [
        "Click «New» and select patient or register a new one",
        "Select treating practitioner and medical department",
        "Choose appointment type (First Visit, Follow-up, Consultation)",
        "Pick available date and time slot from doctor's schedule",
        "Save appointment to trigger confirmation and update clinic roster"
      ]
    },
    "Vital Signs": {
      icon: "💓",
      summaryAr: "قياس وتوثيق العلامات الحيوية للمريض (ضغط الدم، النبض، الحرارة، التنفس، الوزن، الطول، ومؤشر كتلة الجسم).",
      summaryEn: "Record and monitor patient vital signs (BP, pulse, temperature, respiratory rate, BMI).",
      stepsAr: [
        "فتح سجل علامات حيوية جديد واختيار المريض",
        "ربط السجل بموعد الزيارة أو الكشف الطبي الحالي",
        "إدخال قياسات الضغط، النبض، درجة الحرارة، ونسبة الأكسجين",
        "إدخال الطول والوزن لاحتساب مؤشر كتلة الجسم (BMI) آلياً",
        "حفظ السجل ليظهر مباشرة في شاشة الطبيب المعالج"
      ],
      stepsEn: [
        "Create new Vital Signs record and select patient",
        "Link record to the active appointment or encounter",
        "Enter blood pressure, pulse rate, temperature, and SpO2",
        "Input height and weight to auto-calculate BMI",
        "Save record to make readings immediately visible to doctor"
      ]
    },
    "Patient Encounter": {
      icon: "🩺",
      summaryAr: "جلسة الكشف الطبي وتوثيق شكوى المريض، الفحص السريري، التشخيص، وتدوين الملاحظات الإكلينيكية.",
      summaryEn: "Clinical encounter documentation capturing complaints, physical exam, diagnosis, and doctor notes.",
      stepsAr: [
        "بدء مقابلة طبية جديدة مرتبطة بموعد المريض المحجوز",
        "استعراض العلامات الحيوية وتدوين الشكوى الرئيسية (Chief Complaint)",
        "تسجيل الفحص السريري والأعراض المشاهدة",
        "إدراج التشخيص الطبي المعتمد وفق تصنيف (ICD-10)",
        "طلب التحاليل أو الأشعة وكتابة الوصفة الدوائية ثم اعتماد الجلسة"
      ],
      stepsEn: [
        "Start a new Patient Encounter linked to scheduled appointment",
        "Review vital signs and record chief complaints",
        "Document physical examination findings and clinical notes",
        "Assign diagnosis codes according to ICD standards",
        "Order investigations/medications and submit encounter"
      ]
    },
    "Clinical Procedure": {
      icon: "💉",
      summaryAr: "توثيق وتنفيذ الإجراءات والتدخلات الطبية (مثل: الغرز، الضمادات، المناظير، الحقن) ومتابعة المستهلكات.",
      summaryEn: "Record clinical interventions and medical procedures (sutures, dressings, injections) and supplies.",
      stepsAr: [
        "إنشاء إجراء إكلينيكي جديد وتحديد المريض والطبيب المشرف",
        "اختيار قالب الإجراء الطبي المحدد مسبقاً",
        "تحديد غرفة أو وحدة تنفيذ الإجراء ووقت البدء والانتهاء",
        "توثيق المواد والمستهلكات الطبية المستخدمة أثناء الإجراء",
        "حفظ واعتماد الإجراء لإثباته في الملف الطبي وفاتورة الخدمات"
      ],
      stepsEn: [
        "Create new Clinical Procedure specifying patient and practitioner",
        "Select corresponding procedure template",
        "Assign procedure room/service unit and start/end time",
        "Document medical supplies and consumables utilized",
        "Save and Submit to update medical chart and billing items"
      ]
    },
    "Fee Validity": {
      icon: "🎟️",
      summaryAr: "متابعة فترة صلاحية كشف المريض وفترة المراجعة المجانية المعتمدة في اللائحة الطبية.",
      summaryEn: "Track consultation fee validity periods and complimentary follow-up windows.",
      stepsAr: [
        "استعراض سجلات صلاحية الكشوفات لكل مريض وتخصص",
        "التحقق من عدد الزيارات المتبقية ضمن فترة المراجعة المجانية",
        "تنبيه الاستقبال في حال انتهاء الصلاحية لإصدار فاتورة كشف جديدة"
      ],
      stepsEn: [
        "Review fee validity status per patient and department",
        "Check remaining eligible follow-up visits within free window",
        "Alert reception upon validity expiry to generate new visit invoice"
      ]
    },
    "Service Request": {
      icon: "📋",
      summaryAr: "إصدار وتتبع طلبات الخدمات الطبية والتحويلات الداخلية للأشعة والعمليات والمختبرات.",
      summaryEn: "Order and track diagnostic tests, imaging, surgery, and department service referrals.",
      stepsAr: [
        "إنشاء طلب خدمة جديد وتحديد المريض والطبيب المحيل",
        "اختيار الخدمة المطلوبة (فحص أشعة، تحاليل متقدمة، استشارة)",
        "تحديد درجة الأولوية (عاجل، روتيني، طوارئ) وكتابة التعليمات",
        "إرسال الطلب للقسم المعني للتنفيذ وتحديث الحالة"
      ],
      stepsEn: [
        "Create new Service Request selecting patient and referring doctor",
        "Select required service (Radiology, Advanced Lab, Referral)",
        "Set priority level (Urgent, Routine, Stat) and add instructions",
        "Dispatch request to target department for execution"
      ]
    },
    "Medication Request": {
      icon: "💊",
      summaryAr: "كتابة الوصفات الدوائية الإلكترونية وتحديد الجرعات والتكرار ومدة العلاج وإرسالها للصيدلية.",
      summaryEn: "Issue electronic prescriptions with exact dosage, frequencies, duration, and pharmacy routing.",
      stepsAr: [
        "إصدار وصفة دوائية جديدة من داخل جلسة الكشف أو مباشرة",
        "اختيار الأدوية المطلوبة مع التحقق من التعارضات الدوائية والحساسية",
        "تحديد الجرعة (الكمية)، وطريقة التناول (فموي، حقن)، ومدة الاستخدام",
        "إضافة توجيهات الصيدلي وتعليمات الاستخدام للمريض",
        "اعتماد الوصفة لتظهر فوراً في شاشة الصيدلية للصرف"
      ],
      stepsEn: [
        "Issue new prescription from encounter or standalone",
        "Select medications with safety checks for drug allergies",
        "Set dosage strength, administration route, frequency, and days",
        "Add patient instructions and pharmacist notes",
        "Submit prescription for immediate pharmacy dispensing"
      ]
    },
    "Inpatient Record": {
      icon: "🛏️",
      summaryAr: "إدارة دخول وتنويم المرضى في الأقسام الداخلية وتسكين الأسرة ومتابعة خطة الرعاية والخروج.",
      summaryEn: "Manage inpatient hospital admissions, bed assignments, inpatient care, and discharge.",
      stepsAr: [
        "إنشاء سجل تنويم جديد بناءً على أمر الدخول الطبي",
        "تخصيص القسم الداخلي والغرفة والسرير الطبي الشاغر",
        "تسجيل الطبيب المسؤول وفريق التمريض المشرف",
        "متابعة الخدمات اليومية والوجبات والأدوية طوال فترة الإقامة",
        "تنفيذ إجراءات الخروج الطبية والمالية وإخلاء السرير"
      ],
      stepsEn: [
        "Create inpatient admission record based on doctor order",
        "Assign medical ward, room, and vacant hospital bed",
        "Designate primary attending physician and nursing team",
        "Monitor daily rounds, clinical services, and medication",
        "Execute clinical discharge, billing clearance, and bed release"
      ]
    },
    "Inpatient Medication Order": {
      icon: "📋",
      summaryAr: "جدولة وجرعات الأدوية المخصصة للمرضى المنومين في الأقسام الداخلية على مدار اليوم.",
      summaryEn: "Order and schedule scheduled inpatient medication doses across nursing shifts.",
      stepsAr: [
        "ربط أمر الدواء بسجل تنويم المريض",
        "تحديد مواعيد الجرعات خلال نوبات التمريض (صباح، مساء، ليل)",
        "اعتماد الجدول الصيدلاني لإعداد الحصص الدوائية للتمريض"
      ],
      stepsEn: [
        "Link medication order to active inpatient record",
        "Schedule dose timings aligned with nursing shifts",
        "Authorize pharmacy medication prep for ward delivery"
      ]
    },
    "Inpatient Medication Entry": {
      icon: "✅",
      summaryAr: "توثيق إعطاء الأدوية للمريض المنوم بواسطة التمريض وتسجيل وقت الإعطاء والجرعة الفعلية.",
      summaryEn: "Log actual nursing administration of medication doses to admitted inpatients.",
      stepsAr: [
        "فتح سجل إعطاء الدواء واختيار المريض المنوم",
        "تأكيد مطابقة الدواء والمريض والجرعة المحددة",
        "تسجيل وقت الإعطاء الفعلي وأي ملاحظات سريرية",
        "اعتماد السجل لتوثيق الجرعة في ملف المريض التمريضي"
      ],
      stepsEn: [
        "Open administration log and select admitted patient",
        "Verify 5 rights of medication administration",
        "Log exact administration timestamp and nurse notes",
        "Submit entry to certify dose delivery in nursing chart"
      ]
    },
    "Therapy Session": {
      icon: "🧘",
      summaryAr: "تنفيذ وتوثيق جلسات التأهيل والعلاج الطبيعي وتسجيل التمارين والتحسن الحركي للمريض.",
      summaryEn: "Document physiotherapy and rehabilitation sessions, exercise protocols, and mobility progress.",
      stepsAr: [
        "فتح جلسة علاج جديدة مرتبطة بخطة العلاج التأهيلي للمريض",
        "تحديد المعالج الفيزيائي ووحدة العلاج الطبيعي",
        "توثيق التمارين المنفذة ومستويات المقاومة ومدى الحركة",
        "تقييم استجابة المريض ومستوى الألم قبل وبعد الجلسة",
        "اعتماد الجلسة لتحديث عدد الجلسات المتبقية في الباقة"
      ],
      stepsEn: [
        "Open session record linked to patient therapy plan",
        "Assign physical therapist and rehabilitation unit",
        "Record completed exercises, resistance, and range of motion",
        "Evaluate pain score and mobility response pre/post session",
        "Submit session to decrement remaining package quota"
      ]
    },
    "Patient Assessment": {
      icon: "📊",
      summaryAr: "التقييم الشامل للحالة البدنية والحركية للمريض قبل وبعد برامج العلاج الطبيعي والتأهيل.",
      summaryEn: "Comprehensive physical assessment evaluating motor function and rehabilitation milestones.",
      stepsAr: [
        "اختيار نموذج التقييم المناسب لحالة المريض",
        "قياس قوة العضلات ومدى حركة المفاصل والتوازن",
        "تدوين الأهداف العلاجية المتوقعة وتوصيات المعالج",
        "حفظ التقييم كأساس لبناء خطة العلاج الطبيعي"
      ],
      stepsEn: [
        "Select specialized assessment template for patient condition",
        "Measure muscle strength, joint range, and balance",
        "Set therapy targets and therapist clinical recommendations",
        "Save baseline assessment to develop customized therapy plan"
      ]
    },
    "Therapy Plan": {
      icon: "📑",
      summaryAr: "وضع وتفصيل خطة العلاج التأهيلي وتحديد عدد الجلسات والأهداف والتمارين المستهدفة.",
      summaryEn: "Create therapy treatment plans specifying target session counts, milestones, and exercises.",
      stepsAr: [
        "إنشاء خطة علاجية جديدة بناءً على التقييم الطبي للمريض",
        "تحديد عدد الجلسات المطلوبة والجدول الأسبوعي المقترح",
        "اختيار حزمة التمارين والأنشطة التأهيلية",
        "اعتماد الخطة لبدء حجز وتنفيذ الجلسات المجدولة"
      ],
      stepsEn: [
        "Develop therapy plan based on medical evaluation",
        "Define target session count and weekly schedule",
        "Select targeted exercises and therapy modalities",
        "Submit plan to authorize appointment bookings"
      ]
    },
    "Lab Test": {
      icon: "🧪",
      summaryAr: "إجراء التحاليل والفحوصات المخبرية، إدخال النتائج وقيم المراجع واعتماد التقارير الطبية.",
      summaryEn: "Process laboratory tests, enter analyte values, compare against reference ranges, and publish reports.",
      stepsAr: [
        "فتح سجل الفحص المخبري المرتبط بطلب الطبيب أو المحول مباشرة",
        "التحقق من استلام العينة المخبرية المناسبة ورقم الباركود",
        "إدخال النتائج المقاسة لكل مكون تحليلي ومقارنتها بالمعدل الطبيعي",
        "مراجعة النتائج الحرجة وتدوين ملاحظات أخصائي المختبر",
        "اعتماد التقرير المخبري ليصبح متاحاً للطبيب والمريض فوراً"
      ],
      stepsEn: [
        "Open lab test record linked to doctor order or direct visit",
        "Verify specimen receipt, test container, and barcode",
        "Enter measured component values against reference normal ranges",
        "Review flagged panic/critical values and add pathologist notes",
        "Submit and verify lab report for physician immediate access"
      ]
    },
    "Sample Collection": {
      icon: "🩸",
      summaryAr: "سحب واستلام العينات المخبرية (دم، سوائل، مسحات) وطباعة ملصقات الباركود وتتبع حالتها.",
      summaryEn: "Collect and track laboratory specimens (blood, fluids, swabs) and print barcoded labels.",
      stepsAr: [
        "اختيار المريض وقائمة التحاليل المطلوبة",
        "تجهيز أنابيب العينات المناسبة وطباعة الباركود التعريفي",
        "توثيق تاريخ ووقت سحب العينة واسم فني السحب",
        "تأكيد استلام العينة في المختبر للبدء في الفحص"
      ],
      stepsEn: [
        "Select patient and pending requested laboratory investigations",
        "Prepare required collection tubes and print barcoded labels",
        "Log exact phlebotomy timestamp and collecting technician",
        "Confirm specimen handoff to lab processing bench"
      ]
    },
    "Healthcare Practitioner": {
      icon: "👨‍⚕️",
      summaryAr: "دليل الأطباء والممارسين الصحيين وتوثيق التراخيص الطبية والتخصصات وجداول العمل والعمولات.",
      summaryEn: "Practitioner and physician directory managing medical licenses, specialties, schedules, and fees.",
      stepsAr: [
        "الضغط على «جديد» وإدخال اسم الطبيب وبياناته الشخصية",
        "تحديد التخصص والقسم الطبي ورقم ترخيص الهيئة السعودية للتخصصات الصحية",
        "ربط الطبيب بجدول المواعيد وأوقات الدوام الأسبوعية",
        "تحديد رسوم الكشف الطبي ونسب العمولة إن وجدت",
        "حفظ واعتماد الممارس لتمكينه من استقبال المرضى وجدولة العيادة"
      ],
      stepsEn: [
        "Click «New» and enter physician name and credentials",
        "Set medical specialty, department, and SCFHS license number",
        "Link practitioner to consultation roster and weekly working hours",
        "Define consultation fee tariff and commission rules",
        "Save practitioner to activate clinic scheduling and patient encounters"
      ]
    },
    "Healthcare Service Unit": {
      icon: "🏥",
      summaryAr: "تعريف وتصنيف غرف العيادات، الأسرة، غرف العمليات، والمختبرات ومتابعة حالتها وشغورها.",
      summaryEn: "Configure and track clinic consultation rooms, hospital beds, ORs, and labs availability.",
      stepsAr: [
        "إدخال مسمى الوحدة (مثل: عيادة باطنية ١، سرير تنويم ٢٠١)",
        "اختيار نوع الوحدة (سرير، عيادة، غرفة عمليات، قسم طوارئ)",
        "تحديد القسم التابع له وموقع الغرفة في المبنى",
        "متابعة حالة الإشغال (شاغر / مشغول / تحت التعقيم والصيانة)",
        "حفظ الوحدة لإتاحة تسكين المرضى وحجز المواعيد فيها"
      ],
      stepsEn: [
        "Enter unit identifier (e.g. Clinic 1, Inpatient Bed 201)",
        "Select unit type (Bed, Clinic Room, Operating Theater, ER Bay)",
        "Assign parent medical department and floor location",
        "Monitor live occupancy status (Vacant, Occupied, Maintenance)",
        "Save unit to enable patient admission and appointment booking"
      ]
    },
    "Healthcare Settings": {
      icon: "⚙️",
      summaryAr: "ضبط الإعدادات العامة للمنظومة الصحية: الترقيم الآلي، صلاحيات الكشوفات، والتكامل الطبي.",
      summaryEn: "Global healthcare configurations: autoname series, consultation validity, and integrations.",
      stepsAr: [
        "تحديد سلسلة ترقيم ملفات المرضى والمواعيد",
        "ضبط المدة الافتراضية لصلاحية الكشف الطبي وفترة المراجعة",
        "تحديد الحسابات المالية الافتراضية لخدمات الرعاية الصحية",
        "حفظ الإعدادات لتطبيقها على كامل النظام"
      ],
      stepsEn: [
        "Set naming series for patient records and appointments",
        "Define default consultation fee validity and follow-up window",
        "Assign default accounting ledgers for healthcare services",
        "Save settings to apply policies system-wide"
      ]
    }
  };

  /* ─────────────────────────────────────────
     ٧. أدوات مساعدة
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

  function formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("en-US");
  }

  function openRoute(itemName) {
    if (!window.frappe) return;
    if (customRoutes[itemName]) {
      const target = customRoutes[itemName];
      if (target.startsWith("query-report/")) {
        frappe.set_route("query-report", target.replace("query-report/", ""));
      } else if (target.startsWith("dashboard-view/")) {
        frappe.set_route("dashboard-view", target.replace("dashboard-view/", ""));
      } else {
        frappe.set_route(target);
      }
      return;
    }
    if (reportNames.has(itemName)) {
      frappe.set_route("query-report", itemName);
      return;
    }
    if (treeDocs.has(itemName)) {
      frappe.set_route("Tree", itemName);
      return;
    }
    if (singleDocs.has(itemName)) {
      frappe.set_route("Form", itemName);
      return;
    }
    frappe.set_route("List", itemName);
  }

  /* ─────────────────────────────────────────
     ٨. نافذة الشرح والتفاصيل المنبثقة القياسية
  ───────────────────────────────────────── */

  function showInfoModal(itemName) {
    const desc = itemDescriptions[itemName];
    const isSettingDoc = singleDocs.has(itemName) || itemName.toLowerCase().includes("settings");
    const title = translate(itemName);
    const summary = desc
      ? (isArabic ? desc.summaryAr : desc.summaryEn)
      : (isArabic ? ("إجراءات وسجلات " + title + " في المنظومة الصحية.") : ("Clinical workflow and records for " + itemName + "."));

    const steps = desc
      ? (isArabic ? desc.stepsAr : desc.stepsEn)
      : (isArabic
          ? [
              "فتح شاشة " + title + " من القائمة",
              "إدخال البيانات والمواصفات الطبية المطلوبة",
              "مراجعة وتدقيق الحقول وحفظ السجل واعتماده"
            ]
          : [
              "Open " + itemName + " from list",
              "Enter required clinical data and parameters",
              "Review, verify, save, and submit the record"
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
          <span class="erp-modal-icon">${desc?.icon || "🩺"}</span>
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
     ٩. إنشاء بطاقات الإحصائيات (القسم ١)
  ───────────────────────────────────────── */

  function renderStats() {
    if (!statsSection) return;

    const title = isArabic ? "الإحصائيات" : "Statistics";

    statsSection.innerHTML = `
      <h2 class="erp-section-title">${escapeHtml(title)}</h2>
      <div class="erp-stats-grid">
        ${statsCards.map(card => {
          const label = isArabic ? card.labelAr : card.labelEn;
          return `
            <div class="erp-stat-card">
              <div class="erp-stat-icon">${card.icon}</div>
              <div class="erp-stat-info">
                <span class="erp-stat-value" data-stat-id="${card.id}">...</span>
                <span class="erp-stat-label">${escapeHtml(label)}</span>
              </div>
            </div>`;
        }).join("")}
      </div>
    `;

    if (!window.frappe) return;

    statsCards.forEach(card => {
      frappe.call({
        method: "frappe.client.get_count",
        args: {
          doctype: card.doctype,
          filters: card.filter || {}
        },
        callback: r => {
          const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
          if (el) el.textContent = formatNumber(r.message || 0);
        },
        error: () => {
          const el = statsSection.querySelector(`[data-stat-id="${card.id}"]`);
          if (el) el.textContent = "0";
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     ١٠. إنشاء أزرار الوصول السريع (القسم ٢)
  ───────────────────────────────────────── */

  function renderQuickActions() {
    if (!quickActions) return;

    const title = isArabic ? "الاختصارات السريعة" : "Your Shortcuts";

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
              ${btn.hasCount ? `<span class="erp-stat-badge" data-badge-idx="${idx}" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(30, 64, 175, 0.12); color: #1e40af;">...</span>` : ""}
            </button>`;
        }).join("")}
      </div>
    `;

    quickActionButtons.forEach((btn, idx) => {
      if (btn.hasCount && btn.doctype && window.frappe) {
        frappe.call({
          method: "frappe.client.get_count",
          args: {
            doctype: btn.doctype,
            filters: btn.filter || {}
          },
          callback: r => {
            const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
            if (el) {
              const val = r.message || 0;
              const sfx = isArabic ? (btn.suffixAr || "") : (btn.suffixEn || "");
              el.textContent = sfx ? `${formatNumber(val)} ${sfx}` : formatNumber(val);
            }
          },
          error: () => {
            const el = quickActions.querySelector(`[data-badge-idx="${idx}"]`);
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
        openRoute(item.route);
        return;
      }
      if (item.doctype) {
        openRoute(item.doctype);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١١. إنشاء بطاقات الأقسام (الأقسام ٣ و ٤)
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

    content.addEventListener("click", event => {
      const infoBtn = event.target.closest("[data-info-item]");
      if (infoBtn) {
        event.preventDefault();
        event.stopPropagation();
        showInfoModal(infoBtn.dataset.infoItem);
        return;
      }

      const linkBtn = event.target.closest("[data-route-name]");
      if (linkBtn) {
        event.preventDefault();
        openRoute(linkBtn.dataset.routeName);
      }
    });
  }

  /* ─────────────────────────────────────────
     ١٢. الفوتر
  ───────────────────────────────────────── */

  const footerInfo = {
    phone: "+966126810486",
    email: "sales@mubtkir.com",
    website: "www.mubtkir.com"
  };

  function renderFooter() {
    if (!footerEl) return;

    const footerData = {
      phone: window.frappe?.boot?.theme_settings?.phone || "+966126810486",
      email: window.frappe?.boot?.theme_settings?.email || "sales@mubtkir.com",
      website: window.frappe?.boot?.theme_settings?.website || "www.mubtkir.com"
    };

    const phoneLabel = isArabic ? "الهاتف الموحد" : "Phone";
    const emailLabel = isArabic ? "البريد الإلكتروني" : "Email";
    const websiteLabel = isArabic ? "الموقع" : "Website";
    const waNumber = String(footerData.phone || "+966126810486").replace(/\D/g, "");

    footerEl.innerHTML = `
      <div class="erp-footer-inner">
        <div class="erp-footer-item">
          <span class="erp-footer-icon">📞</span>
          <span class="erp-footer-label">${escapeHtml(phoneLabel)}:</span>
          <a href="https://wa.me/${waNumber}" class="erp-footer-link" target="_blank" rel="noopener" dir="ltr">${escapeHtml(footerData.phone)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">✉️</span>
          <span class="erp-footer-label">${escapeHtml(emailLabel)}:</span>
          <a href="mailto:${footerData.email}" class="erp-footer-link">${escapeHtml(footerData.email)}</a>
        </div>
        <span class="erp-footer-sep">|</span>
        <div class="erp-footer-item">
          <span class="erp-footer-icon">🌐</span>
          <span class="erp-footer-label">${escapeHtml(websiteLabel)}:</span>
          <a href="https://${footerData.website}" class="erp-footer-link" target="_blank" rel="noopener">${escapeHtml(footerData.website)}</a>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     التشغيل المبدئي
  ───────────────────────────────────────── */
  renderStats();
  renderQuickActions();
  renderSections();
  renderFooter();

})();

