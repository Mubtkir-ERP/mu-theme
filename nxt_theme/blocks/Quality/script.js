(() => {

  /* =========================================================
     MUBTKIR ERP — QUALITY WORKSPACE
     لوحة تحكم الجودة
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const qualityCycle = root_element.querySelector("[data-purchase-cycle]");
  const statsSection = root_element.querySelector("[data-stats-section]");
  const quickActions = root_element.querySelector("[data-quick-actions]");
  const content = root_element.querySelector("[data-dashboard-content]");
  const footerEl = root_element.querySelector("[data-dashboard-footer]");

  if (!root || !content) return;


  /* =========================================================
     1. LANGUAGE
  ========================================================= */

  const langValue =
    window.frappe?.boot?.lang ||
    window.frappe?.boot?.user?.language ||
    document.documentElement.lang ||
    "en";

  const isArabic =
    String(langValue).toLowerCase().startsWith("ar");

  root.setAttribute("dir", isArabic ? "rtl" : "ltr");
  root.classList.toggle("erp-dashboard-rtl", isArabic);


  /* =========================================================
     2. QUALITY CYCLE
     دورة الجودة
  ========================================================= */

  const qualityCycleCards = [

    {
      step: 1,

      action: "new",
      doctype: "Quality Goal",

      labelEn: "Quality Goals",
      labelAr: "أهداف الجودة",

      descriptionEn:
        "Define measurable quality objectives and performance indicators.",

      descriptionAr:
        "تحديد أهداف الجودة ومؤشرات الأداء والقيم المستهدفة."
    },


    {
      step: 2,

      action: "new",
      doctype: "Quality Procedure",

      labelEn: "Procedures",
      labelAr: "إجراءات الجودة",

      descriptionEn:
        "Document and organize the procedures used to achieve quality objectives.",

      descriptionAr:
        "توثيق وتنظيم إجراءات العمل المطلوبة لتحقيق أهداف الجودة."
    },


    {
      step: 3,

      action: "new",
      doctype: "Quality Inspection",

      labelEn: "Inspection",
      labelAr: "فحص الجودة",

      descriptionEn:
        "Inspect products and processes against defined quality requirements.",

      descriptionAr:
        "فحص المنتجات والعمليات والتأكد من مطابقتها لمتطلبات الجودة."
    },


    {
      step: 4,

      action: "new",
      doctype: "Non Conformance",

      labelEn: "Non Conformance",
      labelAr: "عدم المطابقة",

      descriptionEn:
        "Record deviations and quality issues that do not meet requirements.",

      descriptionAr:
        "تسجيل المشاكل والانحرافات التي لا تتوافق مع متطلبات الجودة."
    },


    {
      step: 5,

      action: "new",
      doctype: "Quality Action",

      labelEn: "Corrective Action",
      labelAr: "الإجراء التصحيحي",

      descriptionEn:
        "Define and follow corrective or preventive actions.",

      descriptionAr:
        "تحديد ومتابعة الإجراءات التصحيحية أو الوقائية."
    },


    {
      step: 6,

      action: "new",
      doctype: "Quality Review",

      labelEn: "Quality Review",
      labelAr: "مراجعة الجودة",

      descriptionEn:
        "Review quality performance and evaluate achieved results.",

      descriptionAr:
        "مراجعة أداء الجودة وتقييم النتائج المحققة."
    }

  ];


  /* =========================================================
     3. GENERAL HELPERS
  ========================================================= */

  function getCount(doctype, filters = {}) {

    return new Promise(resolve => {

      frappe.call({

        method:
          "frappe.client.get_count",

        args: {
          doctype,
          filters
        },

        callback: response => {

          resolve(
            response?.message || 0
          );

        },

        error: () => {

          resolve(0);

        }

      });

    });

  }


  /* =========================================================
     4. OVERVIEW
     نظرة عامة
  ========================================================= */

  const statsCards = [

    {
      id: "goals",

      short: "QG",

      labelEn:
        "Quality Goals",

      labelAr:
        "أهداف الجودة",

      fetch: () =>
        getCount(
          "Quality Goal"
        )
    },


    {
      id: "inspections",

      short: "QI",

      labelEn:
        "Quality Inspections",

      labelAr:
        "عمليات الفحص",

      fetch: () =>
        getCount(
          "Quality Inspection",
          {
            docstatus: 1
          }
        )
    },


    {
      id: "reviews",

      short: "QR",

      labelEn:
        "Quality Reviews",

      labelAr:
        "مراجعات الجودة",

      fetch: () =>
        getCount(
          "Quality Review"
        )
    },


    {
      id: "non-conformance",

      short: "NC",

      labelEn:
        "Non Conformances",

      labelAr:
        "حالات عدم المطابقة",

      fetch: () =>
        getCount(
          "Non Conformance"
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype:
        "Quality Goal",

      labelEn:
        "New Quality Goal",

      labelAr:
        "هدف جودة جديد"
    },


    {
      doctype:
        "Quality Inspection",

      labelEn:
        "New Quality Inspection",

      labelAr:
        "فحص جودة جديد"
    },


    {
      doctype:
        "Non Conformance",

      labelEn:
        "New Non Conformance",

      labelAr:
        "عدم مطابقة جديد"
    },


    {
      doctype:
        "Quality Action",

      labelEn:
        "New Quality Action",

      labelAr:
        "إجراء جودة جديد"
    }

  ];


  /* =========================================================
     6. FOOTER
  ========================================================= */

  const footerInfo = {

    phone: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455",

    email: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com",

    website: (window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com",

    labels: {

      phoneEn:
        "Phone",

      phoneAr:
        "الهاتف الموحد",

      emailEn:
        "Email",

      emailAr:
        "البريد الإلكتروني",

      websiteEn:
        "Website",

      websiteAr:
        "الموقع"

    }

  };


  /* =========================================================
     7. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Goals & Procedures",
          "🎯",
          [
            "Quality Goal",
            "Quality Procedure",
            "Tree of Procedures"
          ]
        ],


        [
          "Inspection",
          "🔍",
          [
            "Quality Inspection"
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
          "Review & Action",
          "📋",
          [
            "Non Conformance",
            "Quality Review",
            "Quality Action"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     8. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "Reports & Masters":
      "البيانات الرئيسية",


    "Goals & Procedures":
      "الأهداف والإجراءات",

    "Inspection":
      "الفحص",

    "Feedback":
      "التقييمات",

    "Meeting":
      "الاجتماعات",

    "Review & Action":
      "المراجعة والإجراءات",


    "Quality Goal":
      "هدف الجودة",

    "Quality Procedure":
      "إجراء الجودة",

    "Tree of Procedures":
      "شجرة الإجراءات",

    "Quality Inspection":
      "فحص الجودة",


    "Quality Feedback":
      "تقييم الجودة",

    "Quality Feedback Template":
      "قالب تقييم الجودة",


    "Quality Meeting":
      "اجتماع الجودة",


    "Non Conformance":
      "عدم المطابقة",

    "Quality Review":
      "مراجعة الجودة",

    "Quality Action":
      "إجراء الجودة"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([]);


  const treeDocs =
    new Set([
      "Tree of Procedures"
    ]);


  const reportNames =
    new Set([]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
     شرح جميع الشاشات
  ========================================================= */

  const itemDescriptions = {


    /* =====================================================
       QUALITY GOAL
    ===================================================== */

    "Quality Goal": {

      icon:
        "🎯",

      summaryAr:
        "تحديد أهداف الجودة المطلوب تحقيقها ومتابعة مؤشرات الأداء والقيم المستهدفة والنتائج الفعلية.",

      summaryEn:
        "Define measurable quality goals and track targets, KPIs and actual performance.",

      stepsAr: [

        "اضغط «هدف جودة جديد»",

        "أدخل اسم الهدف",

        "اكتب وصف الهدف",

        "أضف مؤشرات قياس الأداء",

        "حدد القيمة المستهدفة لكل مؤشر",

        "حدد طريقة أو دورية القياس",

        "حدد المسؤول عن متابعة الهدف",

        "اضغط «حفظ»",

        "حدّث النتائج الفعلية بشكل دوري"

      ],

      stepsEn: [

        "Click «New Quality Goal»",

        "Enter goal name",

        "Add goal description",

        "Add performance indicators",

        "Set target value for each indicator",

        "Set measurement frequency",

        "Assign responsible person",

        "Click «Save»",

        "Update actual results periodically"

      ]

    },


    /* =====================================================
       QUALITY PROCEDURE
    ===================================================== */

    "Quality Procedure": {

      icon:
        "📝",

      summaryAr:
        "توثيق إجراءات العمل المعتمدة للجودة وتحديد الخطوات المطلوبة لتنفيذ كل إجراء.",

      summaryEn:
        "Document approved quality procedures and the steps required to perform each process.",

      stepsAr: [

        "اضغط «إجراء جودة جديد»",

        "أدخل اسم الإجراء",

        "حدد الإجراء الأب إذا كان الإجراء فرعياً",

        "أدخل وصف الإجراء",

        "أضف خطوات التنفيذ",

        "رتب الخطوات حسب تسلسل العمل",

        "أضف المراجع أو المستندات عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Quality Procedure»",

        "Enter procedure name",

        "Select parent procedure if applicable",

        "Enter procedure description",

        "Add execution steps",

        "Arrange the steps",

        "Add references or documents if required",

        "Click «Save»"

      ]

    },


    /* =====================================================
       TREE OF PROCEDURES
    ===================================================== */

    "Tree of Procedures": {

      icon:
        "🌳",

      summaryAr:
        "عرض جميع إجراءات الجودة بطريقة شجرية لمعرفة الإجراءات الرئيسية والفرعية والعلاقة بينها.",

      summaryEn:
        "View all quality procedures in a hierarchical tree showing parent and child procedures.",

      stepsAr: [

        "افتح «شجرة الإجراءات»",

        "ستظهر الإجراءات الرئيسية",

        "اضغط على السهم لعرض الإجراءات الفرعية",

        "حدد أي إجراء لعرض تفاصيله",

        "يمكنك الانتقال للإجراء لتعديله أو مراجعته"

      ],

      stepsEn: [

        "Open «Tree of Procedures»",

        "Main procedures will be displayed",

        "Expand a procedure to view child procedures",

        "Select a procedure to view details",

        "Open the procedure to edit or review it"

      ]

    },


    /* =====================================================
       QUALITY INSPECTION
    ===================================================== */

    "Quality Inspection": {

      icon:
        "🔍",

      summaryAr:
        "فحص المواد أو المنتجات والتحقق من مطابقتها لمعايير الجودة المحددة قبل الاستلام أو التسليم.",

      summaryEn:
        "Inspect materials or products and verify compliance with defined quality standards.",

      stepsAr: [

        "اضغط «فحص جودة جديد»",

        "حدد نوع الفحص",

        "اختر المستند المرجعي عند الحاجة",

        "اختر المنتج المطلوب فحصه",

        "حدد العينة أو الكمية",

        "أدخل نتائج الفحص لكل معيار",

        "حدد هل النتيجة مقبولة أو مرفوضة",

        "أضف الملاحظات",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Quality Inspection»",

        "Select inspection type",

        "Select reference document if required",

        "Select the item being inspected",

        "Specify sample or quantity",

        "Enter result for each inspection criterion",

        "Set accepted or rejected status",

        "Add remarks",

        "Click «Save» then «Submit»"

      ]

    },


    /* =====================================================
       QUALITY FEEDBACK TEMPLATE
    ===================================================== */

    "Quality Feedback Template": {

      icon:
        "📋",

      summaryAr:
        "إنشاء قالب يحتوي على معايير تقييم ثابتة لإعادة استخدامها عند تسجيل تقييمات الجودة.",

      summaryEn:
        "Create reusable templates containing standard quality feedback criteria.",

      stepsAr: [

        "اضغط «قالب تقييم جودة جديد»",

        "أدخل اسم القالب",

        "أضف معايير التقييم",

        "حدد ترتيب المعايير",

        "راجع القالب",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Quality Feedback Template»",

        "Enter template name",

        "Add evaluation criteria",

        "Arrange criteria",

        "Review the template",

        "Click «Save»"

      ]

    },


    /* =====================================================
       QUALITY FEEDBACK
    ===================================================== */

    "Quality Feedback": {

      icon:
        "💬",

      summaryAr:
        "تسجيل تقييمات الجودة بناءً على قالب ومعايير محددة لمعرفة مستوى رضا أو جودة الخدمة أو المنتج.",

      summaryEn:
        "Record quality feedback using predefined criteria to evaluate products, services or processes.",

      stepsAr: [

        "اضغط «تقييم جودة جديد»",

        "اختر قالب تقييم الجودة",

        "حدد المستند أو الجهة المرتبطة بالتقييم",

        "أدخل نتيجة كل معيار",

        "أضف الملاحظات",

        "راجع إجمالي التقييم",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Quality Feedback»",

        "Select quality feedback template",

        "Select related document or party",

        "Enter rating for each criterion",

        "Add remarks",

        "Review overall feedback",

        "Click «Save»"

      ]

    },


    /* =====================================================
       QUALITY MEETING
    ===================================================== */

    "Quality Meeting": {

      icon:
        "🤝",

      summaryAr:
        "توثيق اجتماعات الجودة ومناقشة المشاكل والأهداف والنتائج والقرارات والإجراءات المطلوبة.",

      summaryEn:
        "Document quality meetings, discussions, decisions and required follow-up actions.",

      stepsAr: [

        "اضغط «اجتماع جودة جديد»",

        "أدخل عنوان الاجتماع",

        "حدد تاريخ ووقت الاجتماع",

        "أضف الحضور",

        "أضف جدول الأعمال",

        "سجل الملاحظات أثناء الاجتماع",

        "أدخل القرارات",

        "حدد الإجراءات المطلوبة والمسؤول عنها",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Quality Meeting»",

        "Enter meeting title",

        "Set date and time",

        "Add attendees",

        "Add agenda",

        "Record meeting notes",

        "Enter decisions",

        "Assign follow-up actions",

        "Click «Save»"

      ]

    },


    /* =====================================================
       NON CONFORMANCE
    ===================================================== */

    "Non Conformance": {

      icon:
        "⚠️",

      summaryAr:
        "تسجيل حالة عدم مطابقة عند وجود انحراف عن متطلبات أو إجراءات الجودة وتحليل سبب المشكلة.",

      summaryEn:
        "Record deviations from quality requirements and investigate their causes.",

      stepsAr: [

        "اضغط «عدم مطابقة جديد»",

        "أدخل عنوان الحالة",

        "اكتب وصف المشكلة",

        "حدد العملية أو الإجراء المتأثر",

        "حدد سبب عدم المطابقة",

        "أضف الأدلة أو المرفقات عند الحاجة",

        "حدد الإجراء المطلوب",

        "حدد المسؤول",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Non Conformance»",

        "Enter the issue title",

        "Describe the problem",

        "Select affected process or procedure",

        "Identify the cause",

        "Attach supporting evidence if required",

        "Define required action",

        "Assign responsible person",

        "Click «Save»"

      ]

    },


    /* =====================================================
       QUALITY ACTION
    ===================================================== */

    "Quality Action": {

      icon:
        "🔧",

      summaryAr:
        "إنشاء إجراء تصحيحي أو وقائي لمعالجة مشاكل الجودة أو منع تكرار حالات عدم المطابقة.",

      summaryEn:
        "Create corrective or preventive actions to resolve or prevent quality issues.",

      stepsAr: [

        "اضغط «إجراء جودة جديد»",

        "أدخل اسم الإجراء",

        "اربطه بحالة عدم المطابقة أو المراجعة عند الحاجة",

        "اكتب الإجراء المطلوب",

        "حدد المسؤول عن التنفيذ",

        "حدد تاريخ الاستحقاق",

        "اضغط «حفظ»",

        "تابع تنفيذ الإجراء",

        "حدّث الحالة بعد الانتهاء"

      ],

      stepsEn: [

        "Click «New Quality Action»",

        "Enter action title",

        "Link it to Non Conformance or Review if required",

        "Describe required action",

        "Assign responsible person",

        "Set due date",

        "Click «Save»",

        "Track implementation",

        "Update status when completed"

      ]

    },


    /* =====================================================
       QUALITY REVIEW
    ===================================================== */

    "Quality Review": {

      icon:
        "📊",

      summaryAr:
        "مراجعة نتائج أهداف الجودة ومؤشرات الأداء ومقارنة النتائج الفعلية بالمستهدف واتخاذ القرارات اللازمة.",

      summaryEn:
        "Review quality goals and performance results against targets and determine necessary actions.",

      stepsAr: [

        "اضغط «مراجعة جودة جديدة»",

        "اختر هدف الجودة",

        "حدد فترة المراجعة",

        "راجع مؤشرات الأداء",

        "أدخل النتائج الفعلية",

        "قارن النتيجة بالمستهدف",

        "أضف الملاحظات والتوصيات",

        "حدد الإجراءات المطلوبة عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Quality Review»",

        "Select quality goal",

        "Set review period",

        "Review KPIs",

        "Enter actual values",

        "Compare results against targets",

        "Add notes and recommendations",

        "Define required actions if needed",

        "Click «Save»"

      ]

    }

  };


  /* =========================================================
     11. TRANSLATION
  ========================================================= */

  function translate(name) {

    if (!isArabic)
      return name;

    return (
      arabicFallback[name] ||
      (
        typeof window.__ === "function"
          ? window.__(name)
          : name
      )
    );

  }


  function escapeHtml(value) {

    return String(value ?? "")

      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");

  }


  function formatNumber(number) {

    return (
      parseFloat(number) || 0
    ).toLocaleString("en-US");

  }


  /* =========================================================
     12. MODAL
  ========================================================= */

  function showInfoModal(data) {

    const title =
      isArabic
        ? data.labelAr
        : data.labelEn;


    const summary =
      isArabic
        ? data.summaryAr
        : data.summaryEn;


    const steps =
      isArabic
        ? data.stepsAr
        : data.stepsEn;


    const hasSteps =
      Array.isArray(steps) &&
      steps.length > 0;


    const showText =
      isArabic
        ? "📖 عرض الخطوات"
        : "📖 Show Steps";


    const hideText =
      isArabic
        ? "📖 إخفاء الخطوات"
        : "📖 Hide Steps";


    const overlay =
      document.createElement("div");


    overlay.className =
      "erp-modal-overlay";


    overlay.setAttribute(
      "dir",
      isArabic ? "rtl" : "ltr"
    );


    overlay.innerHTML = `

      <div class="erp-modal-box">

        <button
          type="button"
          class="erp-modal-close"
          data-modal-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            ${data.icon || "📄"}
          </span>


          <h3 class="erp-modal-title">
            ${escapeHtml(title)}
          </h3>

        </div>


        <p class="erp-modal-summary">
          ${escapeHtml(summary)}
        </p>


        ${
          hasSteps
            ? `

              <button
                type="button"
                class="erp-modal-toggle-steps"
                data-toggle-steps
              >
                ${showText}
              </button>


              <div
                class="erp-modal-steps"
                data-modal-steps
              >

                <ol class="erp-modal-steps-list">

                  ${steps

                    .map(
                      step =>
                        `<li>${escapeHtml(step)}</li>`
                    )

                    .join("")}

                </ol>

              </div>

            `
            : ""
        }

      </div>

    `;


    root.appendChild(overlay);


    requestAnimationFrame(() => {

      overlay.classList.add(
        "is-visible"
      );

    });


    function closeModal() {

      overlay.remove();

    }


    overlay
      .querySelector(
        "[data-modal-close]"
      )
      ?.addEventListener(
        "click",
        closeModal
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay) {

          closeModal();

        }

      }

    );


    const toggleButton =
      overlay.querySelector(
        "[data-toggle-steps]"
      );


    const stepsContainer =
      overlay.querySelector(
        "[data-modal-steps]"
      );


    if (
      toggleButton &&
      stepsContainer
    ) {

      toggleButton.addEventListener(

        "click",

        () => {

          stepsContainer
            .classList
            .toggle(
              "is-shown"
            );


          toggleButton.textContent =
            stepsContainer
              .classList
              .contains(
                "is-shown"
              )

              ? hideText
              : showText;

        }

      );

    }

  }


  /* =========================================================
     13. ROUTING
  ========================================================= */

  function openRoute(name) {

    if (
      !window.frappe ||
      typeof frappe.set_route !== "function"
    )
      return;


    if (
      reportNames.has(name)
    ) {

      frappe.set_route(
        "query-report",
        name
      );

      return;

    }


    if (
      singleDocs.has(name)
    ) {

      frappe.set_route(
        "Form",
        name
      );

      return;

    }


    if (
      name === "Tree of Procedures"
    ) {

      frappe.set_route(
        "Tree",
        "Quality Procedure"
      );

      return;

    }


    frappe.set_route(
      "List",
      name
    );

  }


  /* =========================================================
     14. RENDER QUALITY CYCLE
  ========================================================= */

  function renderQualityCycle() {

    if (!qualityCycle)
      return;


    const title =
      isArabic
        ? "دورة الجودة"
        : "Quality Cycle";


    qualityCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${escapeHtml(title)}
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${qualityCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${qualityCycleCards

            .map(
              (card, index) => {

                const cardTitle =
                  isArabic
                    ? card.labelAr
                    : card.labelEn;


                const description =
                  isArabic
                    ? card.descriptionAr
                    : card.descriptionEn;


                const arrow =
                  index <
                  qualityCycleCards.length - 1

                    ? `

                      <span
                        class="erp-cycle-arrow"
                        aria-hidden="true"
                      >
                        ${
                          isArabic
                            ? "←"
                            : "→"
                        }
                      </span>

                    `

                    : "";


                return `

                  <div class="erp-cycle-item">

                    <button
                      type="button"
                      class="
                        erp-cycle-card
                        cycle-tone-${(index % 4) + 1}
                      "
                      data-cycle-index="${index}"
                    >

                      <span class="erp-cycle-number">
                        ${card.step}
                      </span>


                      <span class="erp-cycle-card-title">
                        ${escapeHtml(cardTitle)}
                      </span>


                      <span class="erp-cycle-description">
                        ${escapeHtml(description)}
                      </span>

                    </button>


                    ${arrow}

                  </div>

                `;

              }
            )

            .join("")}

        </div>

      </section>

    `;


    qualityCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          qualityCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];


        if (!card)
          return;


        if (
          card.action === "new"
        ) {

          frappe.new_doc(
            card.doctype
          );

        }

      }

    );

  }


  /* =========================================================
     15. RENDER STATS
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    statsSection.innerHTML = `

      <section class="erp-overview-container">

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "نظرة عامة"
              : "Overview"
          }

        </h2>


        <div class="erp-stats-grid">

          ${statsCards

            .map(
              (card, index) => `

                <div
                  class="
                    erp-stat-card
                    overview-tone-${index + 1}
                  "
                >

                  <div class="erp-stat-icon">
                    ${escapeHtml(card.short)}
                  </div>


                  <div class="erp-stat-info">

                    <span
                      class="erp-stat-value"
                      data-stat-id="${card.id}"
                    >
                      ...
                    </span>


                    <span class="erp-stat-label">

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>

                  </div>

                </div>

              `
            )

            .join("")}

        </div>

      </section>

    `;


    statsCards.forEach(card => {

      card.fetch()
        .then(value => {

          const element =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );


          if (element) {

            element.textContent =
              formatNumber(value);

          }

        });

    });

  }


  /* =========================================================
     16. QUICK ACTIONS
  ========================================================= */

  function renderQuickActions() {

    if (!quickActions)
      return;


    quickActions.innerHTML = `

      <h2 class="erp-section-title">

        ${
          isArabic
            ? "اختصارات سريعة"
            : "Quick Actions"
        }

      </h2>


      <div class="erp-quick-grid">

        ${quickActionButtons

          .map(
            (button, index) => `

              <button
                type="button"
                class="erp-quick-btn"
                data-quick-index="${index}"
              >

                <span class="erp-quick-label">

                  ${escapeHtml(
                    isArabic
                      ? button.labelAr
                      : button.labelEn
                  )}

                </span>

              </button>

            `
          )

          .join("")}

      </div>

    `;


    quickActions.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-quick-index]"
          );


        if (!element)
          return;


        const button =
          quickActionButtons[
            Number(
              element.dataset.quickIndex
            )
          ];


        if (!button)
          return;


        frappe.new_doc(
          button.doctype
        );

      }

    );

  }


  /* =========================================================
     17. RENDER SECTIONS
  ========================================================= */

  function renderSections() {

    content.innerHTML =
      sections

        .map(
          (section, sectionIndex) => {


            const cards =
              section[1]

                .map(
                  (card, cardIndex) => {


                    const links =
                      card[2]

                        .map(
                          item => {


                            const description =
                              itemDescriptions[item];


                            return `

                              <div class="erp-link-row">

                                <button
                                  type="button"
                                  class="erp-link"
                                  data-route-name="${escapeHtml(item)}"
                                >

                                  <span class="erp-link-text">

                                    ${escapeHtml(
                                      translate(item)
                                    )}

                                  </span>


                                  <span class="erp-link-arrow">

                                    ${
                                      isArabic
                                        ? "←"
                                        : "→"
                                    }

                                  </span>

                                </button>


                                ${
                                  description

                                    ? `

                                      <button
                                        type="button"
                                        class="erp-info-link"
                                        data-info-item="${escapeHtml(item)}"
                                      >

                                        ${
                                          isArabic
                                            ? "تفاصيل"
                                            : "Details"
                                        }

                                      </button>

                                    `

                                    : ""
                                }

                              </div>

                            `;

                          }
                        )

                        .join("");


                    return `

                      <article
                        class="
                          erp-card
                          tone-${(sectionIndex + cardIndex) % 5}
                        "
                        data-erp-card
                      >

                        <button
                          type="button"
                          class="erp-card-heading"
                          data-card-toggle
                          aria-expanded="false"
                        >

                          <span class="erp-icon">
                            ${card[1]}
                          </span>


                          <span class="erp-card-title">

                            ${escapeHtml(
                              translate(card[0])
                            )}

                          </span>


                          <span class="erp-card-chevron">
                            ⌄
                          </span>

                        </button>


                        <div class="erp-card-links">
                          ${links}
                        </div>

                      </article>

                    `;

                  }
                )

                .join("");


            return `

              <section class="erp-module-section">

                <h2 class="erp-section-title">

                  ${escapeHtml(
                    translate(section[0])
                  )}

                </h2>


                <div class="erp-dashboard-grid">
                  ${cards}
                </div>

              </section>

            `;

          }
        )

        .join("");

  }


  /* =========================================================
     18. FOOTER
  ========================================================= */

  function renderFooter() {

    if (!footerEl)
      return;


    footerEl.innerHTML = `

      <div class="erp-footer-inner">

        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ☎
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.phoneAr
                : footerInfo.labels.phoneEn
            }:

          </span>

          <a
            href="tel:${footerInfo.phone}"
            class="erp-footer-link"
            dir="ltr"
          >
            ${footerInfo.phone}
          </a>

        </div>


        <span class="erp-footer-sep">
          |
        </span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ✉
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.emailAr
                : footerInfo.labels.emailEn
            }:

          </span>

          <a
            href="mailto:${footerInfo.email}"
            class="erp-footer-link"
          >
            ${footerInfo.email}
          </a>

        </div>


        <span class="erp-footer-sep">
          |
        </span>


        <div class="erp-footer-item">

          <span class="erp-footer-icon">
            ◎
          </span>

          <span class="erp-footer-label">

            ${
              isArabic
                ? footerInfo.labels.websiteAr
                : footerInfo.labels.websiteEn
            }:

          </span>

          <a
            href="https://${footerInfo.website}"
            class="erp-footer-link"
            target="_blank"
            rel="noopener"
          >
            ${footerInfo.website}
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     19. EVENTS
  ========================================================= */

  let lastToggleTime = 0;


  content.addEventListener(

    "click",

    event => {


      /* DETAILS */

      const infoButton =
        event.target.closest(
          "[data-info-item]"
        );


      if (infoButton) {

        event.preventDefault();
        event.stopPropagation();


        const itemName =
          infoButton.dataset.infoItem;


        const data =
          itemDescriptions[itemName];


        if (data) {

          showInfoModal({

            ...data,

            labelAr:
              translate(itemName),

            labelEn:
              itemName

          });

        }


        return;

      }


      /* ROUTE */

      const routeButton =
        event.target.closest(
          "[data-route-name]"
        );


      if (routeButton) {

        event.preventDefault();
        event.stopPropagation();


        openRoute(
          routeButton.dataset.routeName
        );


        return;

      }


      /* CARD */

      const cardButton =
        event.target.closest(
          "[data-card-toggle]"
        );


      if (!cardButton)
        return;


      const now =
        Date.now();


      if (
        now - lastToggleTime < 400
      )
        return;


      lastToggleTime =
        now;


      const selectedCard =
        cardButton.closest(
          "[data-erp-card]"
        );


      if (!selectedCard)
        return;


      const shouldOpen =
        !selectedCard
          .classList
          .contains(
            "is-open"
          );


      content
        .querySelectorAll(
          "[data-erp-card]"
        )
        .forEach(card => {

          if (
            card !== selectedCard
          ) {

            card
              .classList
              .remove(
                "is-open"
              );


            card
              .querySelector(
                "[data-card-toggle]"
              )
              ?.setAttribute(
                "aria-expanded",
                "false"
              );

          }

        });


      selectedCard
        .classList
        .toggle(
          "is-open",
          shouldOpen
        );


      cardButton
        .setAttribute(
          "aria-expanded",
          shouldOpen
            ? "true"
            : "false"
        );

    }

  );


  /* =========================================================
     20. INIT
  ========================================================= */

  renderQualityCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();