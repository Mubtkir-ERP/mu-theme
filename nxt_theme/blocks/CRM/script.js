(() => {

  /* =========================================================
     MUBTKIR ERP — CRM WORKSPACE
     لوحة تحكم إدارة علاقات العملاء
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const crmCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. CRM CYCLE
  ========================================================= */

  const crmCycleCards = [

    {
      step: 1,
      action: "route",
      doctype: "Lead",

      labelEn: "Lead",
      labelAr: "عميل محتمل",

      descriptionEn:
        "Capture and qualify a potential customer.",

      descriptionAr:
        "تسجيل العميل المحتمل وتقييم فرصة التعامل معه."
    },

    {
      step: 2,
      action: "route",
      doctype: "Opportunity",

      labelEn: "Opportunity",
      labelAr: "فرصة",

      descriptionEn:
        "Track a qualified sales opportunity and expected value.",

      descriptionAr:
        "متابعة فرصة البيع وقيمتها واحتمالية إتمامها."
    },

    {
      step: 3,
      action: "route",
      doctype: "Quotation",

      labelEn: "Quotation",
      labelAr: "عرض سعر",

      descriptionEn:
        "Prepare a commercial offer for the prospect or customer.",

      descriptionAr:
        "إعداد عرض سعر للعميل المحتمل أو العميل."
    },

    {
      step: 4,
      action: "route",
      doctype: "Customer",

      labelEn: "Customer",
      labelAr: "تحويل إلى عميل",

      descriptionEn:
        "Convert the qualified prospect into a customer.",

      descriptionAr:
        "تحويل العميل المحتمل المؤهل إلى عميل فعلي."
    },

    {
      step: 5,
      action: "route",
      doctype: "Communication",

      labelEn: "Follow-up",
      labelAr: "المتابعة والتواصل",

      descriptionEn:
        "Track communication and follow-up activities.",

      descriptionAr:
        "متابعة الاتصالات والمراسلات والأنشطة مع العميل."
    },

    {
      step: 6,
      action: "route",
      doctype: "Sales Order",

      labelEn: "Convert to Sale",
      labelAr: "تحويل إلى بيع",

      descriptionEn:
        "Convert the successful opportunity into a confirmed sale.",

      descriptionAr:
        "تحويل الفرصة الناجحة إلى طلب مبيعات مؤكد."
    }

  ];


  /* =========================================================
     3. HELPERS
  ========================================================= */

  function getToday() {

    if (window.frappe?.datetime?.get_today)
      return frappe.datetime.get_today();

    return new Date()
      .toISOString()
      .slice(0, 10);
  }


  function getMonthStart() {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(today.getMonth() + 1)
        .padStart(2, "0");

    return `${year}-${month}-01`;
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


  function formatCurrency(number) {
    return (
      parseFloat(number) || 0
    ).toLocaleString("en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    /* العملاء المحتملون المفتوحون */

    {
      id: "open-leads",

      short: "LEAD",

      labelEn: "Open Leads",
      labelAr: "العملاء المحتملون المفتوحون",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Lead",

              filters: {

                status: [
                  "not in",
                  [
                    "Converted",
                    "Do Not Contact"
                  ]
                ]

              }

            },

            callback: data =>
              resolve(
                data?.message || 0
              ),

            error: () =>
              resolve(0)

          });

        })
    },


    /* الفرص المفتوحة */

    {
      id: "open-opportunities",

      short: "OPP",

      labelEn: "Open Opportunities",
      labelAr: "الفرص المفتوحة",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Opportunity",

              filters: {

                status: [
                  "not in",
                  [
                    "Converted",
                    "Lost",
                    "Closed"
                  ]
                ]

              }

            },

            callback: data =>
              resolve(
                data?.message || 0
              ),

            error: () =>
              resolve(0)

          });

        })
    },


    /* قيمة الفرص */

    {
      id: "opportunity-value",

      short: "VAL",

      labelEn: "Opportunity Value",
      labelAr: "قيمة الفرص",

      isCurrency: true,

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method:
              "frappe.client.get_list",

            args: {

              doctype:
                "Opportunity",

              fields: [
                "opportunity_amount"
              ],

              filters: {

                status: [
                  "not in",
                  [
                    "Converted",
                    "Lost",
                    "Closed"
                  ]
                ]

              },

              limit_page_length:
                1000

            },

            callback: response => {

              const rows =
                response?.message || [];

              let total = 0;

              rows.forEach(row => {

                total += Number(
                  row.opportunity_amount || 0
                );

              });

              resolve(total);

            },

            error: () =>
              resolve(0)

          });

        })
    },


    /* العملاء الجدد */

    {
      id: "new-customers",

      short: "CUS",

      labelEn: "New Customers",
      labelAr: "العملاء الجدد",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method:
              "frappe.client.get_count",

            args: {

              doctype:
                "Customer",

              filters: {

                creation: [
                  ">=",
                  getMonthStart()
                ]

              }

            },

            callback: data =>
              resolve(
                data?.message || 0
              ),

            error: () =>
              resolve(0)

          });

        })
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype: "Lead",

      labelEn: "New Lead",
      labelAr: "عميل محتمل جديد"
    },

    {
      doctype: "Opportunity",

      labelEn: "New Opportunity",
      labelAr: "فرصة جديدة"
    },

    {
      doctype: "Quotation",

      labelEn: "New Quotation",
      labelAr: "عرض سعر جديد"
    },

    {
      doctype: "Customer",

      labelEn: "New Customer",
      labelAr: "عميل جديد"
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

      phoneEn: "Phone",
      phoneAr: "الهاتف الموحد",

      emailEn: "Email",
      emailAr: "البريد الإلكتروني",

      websiteEn: "Website",
      websiteAr: "الموقع"

    }

  };


  /* =========================================================
     7. SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        [
          "Leads",
          "🎯",
          [
            "Lead",
            "Lead Source"
          ]
        ],

        [
          "Opportunities",
          "💼",
          [
            "Opportunity",
            "Sales Stage"
          ]
        ],

        [
          "Customers",
          "👥",
          [
            "Customer",
            "Customer Group",
            "Territory",
            "Contact",
            "Address"
          ]
        ],

        [
          "Communication",
          "💬",
          [
            "Communication",
            "Appointment"
          ]
        ],

        [
          "Sales",
          "🧾",
          [
            "Quotation",
            "Sales Order"
          ]
        ],

        [
          "Campaigns",
          "📣",
          [
            "Campaign",
            "Email Campaign"
          ]
        ],

        [
          "Settings",
          "⚙️",
          [
            "CRM Settings"
          ]
        ],

        [
          "Key Reports",
          "📊",
          [
            "Sales Funnel",
            "Prospects Engaged But Not Converted",
            "Minutes to First Response for Opportunity"
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
      "البيانات الرئيسية والتقارير",

    "Leads":
      "العملاء المحتملون",

    "Opportunities":
      "الفرص",

    "Customers":
      "العملاء",

    "Communication":
      "التواصل والمتابعات",

    "Sales":
      "التحويل إلى المبيعات",

    "Campaigns":
      "الحملات",

    "Settings":
      "الإعدادات",

    "Key Reports":
      "التقارير الرئيسية",


    "Lead":
      "العميل المحتمل",

    "Lead Source":
      "مصدر العميل المحتمل",

    "Opportunity":
      "الفرصة",

    "Sales Stage":
      "مرحلة البيع",

    "Customer":
      "العميل",

    "Customer Group":
      "مجموعة العملاء",

    "Territory":
      "المنطقة",

    "Contact":
      "جهة الاتصال",

    "Address":
      "العنوان",

    "Communication":
      "التواصل",

    "Appointment":
      "الموعد",

    "Quotation":
      "عرض السعر",

    "Sales Order":
      "طلب المبيعات",

    "Campaign":
      "الحملة",

    "Email Campaign":
      "حملة البريد الإلكتروني",

    "CRM Settings":
      "إعدادات إدارة العملاء",

    "Sales Funnel":
      "مسار المبيعات",

    "Prospects Engaged But Not Converted":
      "عملاء محتملون تم التواصل معهم ولم يتحولوا",

    "Minutes to First Response for Opportunity":
      "مدة الاستجابة الأولى للفرص"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "CRM Settings"
    ]);


  const treeDocs =
    new Set([
      "Customer Group",
      "Territory"
    ]);


  const reportNames =
    new Set([

      "Sales Funnel",

      "Prospects Engaged But Not Converted",

      "Minutes to First Response for Opportunity"

    ]);


  /* =========================================================
     10. TRANSLATION
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


  /* =========================================================
     11. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {

    "Lead": {

      icon: "🎯",

      summaryAr:
        "تسجيل شخص أو شركة مهتمة بخدمات أو منتجات الشركة قبل تأهيلها كفرصة بيع.",

      summaryEn:
        "Capture a person or organization that may become a customer.",

      stepsAr: [

        "اضغط «عميل محتمل جديد»",

        "أدخل اسم العميل المحتمل",

        "حدد هل هو فرد أو شركة",

        "أدخل الهاتف والبريد",

        "حدد مصدر العميل المحتمل",

        "حدد المنطقة",

        "أضف الملاحظات",

        "اضغط «حفظ»",

        "بعد التأهيل يمكن إنشاء فرصة"

      ],

      stepsEn: [

        "Click «New Lead»",

        "Enter lead name",

        "Specify person or organization",

        "Enter phone and email",

        "Select Lead Source",

        "Set Territory",

        "Add notes",

        "Click «Save»",

        "Create an Opportunity when qualified"

      ]

    },


    "Lead Source": {

      icon: "📍",

      summaryAr:
        "تحديد مصدر وصول العميل المحتمل مثل الموقع أو الإعلان أو الإحالة أو الاتصال المباشر.",

      summaryEn:
        "Define the channel from which leads are generated.",

      stepsAr: [

        "اضغط «مصدر عميل محتمل جديد»",

        "أدخل اسم المصدر",

        "اضغط «حفظ»",

        "استخدم المصدر في بطاقة العميل المحتمل"

      ],

      stepsEn: [

        "Click «New Lead Source»",

        "Enter source name",

        "Click «Save»",

        "Use it when creating Leads"

      ]

    },


    "Opportunity": {

      icon: "💼",

      summaryAr:
        "تسجيل فرصة بيع مؤهلة مع تحديد احتياج العميل والقيمة المتوقعة واحتمالية الإغلاق.",

      summaryEn:
        "Track a qualified sales opportunity including requirements, value, probability and closing date.",

      stepsAr: [

        "اضغط «فرصة جديدة»",

        "حدد العميل المحتمل أو العميل",

        "حدد مصدر الفرصة",

        "أضف المنتجات أو الخدمات المطلوبة",

        "حدد قيمة الفرصة",

        "حدد احتمالية الإغلاق",

        "حدد تاريخ الإغلاق المتوقع",

        "حدد مرحلة البيع",

        "اضغط «حفظ»",

        "يمكن إنشاء عرض سعر من الفرصة"

      ],

      stepsEn: [

        "Click «New Opportunity»",

        "Select Lead or Customer",

        "Select opportunity source",

        "Add requested products or services",

        "Enter opportunity value",

        "Set probability",

        "Set expected closing date",

        "Select Sales Stage",

        "Click «Save»",

        "Create a Quotation from the Opportunity"

      ]

    },


    "Customer": {

      icon: "👥",

      summaryAr:
        "تحويل العميل المحتمل أو الفرصة الناجحة إلى عميل فعلي واستخدامه في المعاملات.",

      summaryEn:
        "Convert a qualified prospect into a Customer for sales transactions.",

      stepsAr: [

        "اضغط «عميل جديد»",

        "أدخل اسم العميل",

        "حدد مجموعة العملاء",

        "حدد المنطقة",

        "أدخل بيانات الاتصال",

        "أدخل الرقم الضريبي عند الحاجة",

        "أضف العنوان",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Customer»",

        "Enter customer name",

        "Select Customer Group",

        "Set Territory",

        "Enter contact details",

        "Enter tax ID if required",

        "Add address",

        "Click «Save»"

      ]

    },


    "Communication": {

      icon: "💬",

      summaryAr:
        "متابعة سجل المراسلات والتواصل المرتبط بالعملاء المحتملين والفرص والعملاء.",

      summaryEn:
        "Track communications linked to Leads, Opportunities and Customers.",

      stepsAr: [

        "افتح سجل التواصل",

        "راجع نوع التواصل",

        "راجع المرسل والمستلم",

        "اربط التواصل بالمستند المناسب",

        "تابع تاريخ ومحتوى الرسالة"

      ],

      stepsEn: [

        "Open Communication",

        "Review communication type",

        "Review sender and recipient",

        "Link communication to the appropriate document",

        "Track date and content"

      ]

    },


    "Appointment": {

      icon: "📅",

      summaryAr:
        "جدولة موعد لمتابعة العميل المحتمل أو الفرصة.",

      summaryEn:
        "Schedule appointments for Lead or Opportunity follow-up.",

      stepsAr: [

        "اضغط «موعد جديد»",

        "حدد العميل المحتمل",

        "حدد التاريخ والوقت",

        "أدخل الملاحظات",

        "حدد المسؤول",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Appointment»",

        "Select Lead",

        "Set date and time",

        "Enter notes",

        "Assign responsible user",

        "Click «Save»"

      ]

    },


    "Quotation": {

      icon: "📄",

      summaryAr:
        "إعداد عرض سعر للعميل المحتمل أو العميل بناءً على الفرصة المسجلة.",

      summaryEn:
        "Prepare a commercial quotation for a Lead or Customer.",

      stepsAr: [

        "اضغط «عرض سعر جديد»",

        "اختر العميل المحتمل أو العميل",

        "يمكن سحب البيانات من الفرصة",

        "أضف المنتجات والكميات",

        "راجع الأسعار والخصومات",

        "أضف الضرائب",

        "حدد تاريخ الصلاحية",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Click «New Quotation»",

        "Select Lead or Customer",

        "Fetch details from Opportunity if applicable",

        "Add items and quantities",

        "Review rates and discounts",

        "Add taxes",

        "Set validity date",

        "Click «Save» then «Submit»"

      ]

    },


    "Sales Order": {

      icon: "🧾",

      summaryAr:
        "تحويل عرض السعر الناجح إلى طلب مبيعات مؤكد.",

      summaryEn:
        "Convert an accepted Quotation into a confirmed Sales Order.",

      stepsAr: [

        "افتح عرض السعر المعتمد",

        "اختر إنشاء طلب مبيعات",

        "راجع العميل",

        "راجع المنتجات والكميات",

        "حدد تاريخ التسليم",

        "راجع الأسعار والضرائب",

        "اضغط «حفظ» ثم «تسجيل»"

      ],

      stepsEn: [

        "Open the accepted Quotation",

        "Create Sales Order",

        "Review customer",

        "Review items and quantities",

        "Set delivery date",

        "Review rates and taxes",

        "Click «Save» then «Submit»"

      ]

    },


    "Campaign": {

      icon: "📣",

      summaryAr:
        "تعريف الحملات التسويقية وقياس مصادر العملاء المحتملين والفرص الناتجة عنها.",

      summaryEn:
        "Define marketing campaigns and track generated Leads and Opportunities.",

      stepsAr: [

        "اضغط «حملة جديدة»",

        "أدخل اسم الحملة",

        "حدد تاريخ البداية والنهاية",

        "أدخل وصف الحملة",

        "اضغط «حفظ»",

        "اربط العملاء المحتملين والفرص بالحملة"

      ],

      stepsEn: [

        "Click «New Campaign»",

        "Enter campaign name",

        "Set start and end dates",

        "Enter campaign description",

        "Click «Save»",

        "Link Leads and Opportunities to the campaign"

      ]

    },


    "Email Campaign": {

      icon: "✉️",

      summaryAr:
        "إرسال سلسلة رسائل بريد إلكتروني للعملاء المحتملين أو جهات الاتصال وفق جدول زمني.",

      summaryEn:
        "Send scheduled email campaigns to Leads or Contacts.",

      stepsAr: [

        "اضغط «حملة بريد جديدة»",

        "حدد المستلم",

        "حدد الحملة",

        "حدد تاريخ البداية",

        "راجع قوالب البريد",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Email Campaign»",

        "Select recipient",

        "Select Campaign",

        "Set start date",

        "Review email templates",

        "Click «Save»"

      ]

    },


    "CRM Settings": {

      icon: "⚙️",

      summaryAr:
        "إعداد طريقة إدارة العملاء المحتملين والفرص وبعض خيارات التكرار والمتابعة في CRM.",

      summaryEn:
        "Configure Lead, Opportunity and CRM workflow behavior.",

      stepsAr: [

        "افتح «إعدادات إدارة العملاء»",

        "راجع إعدادات العملاء المحتملين",

        "راجع إعدادات التكرار",

        "راجع إعدادات الفرص",

        "راجع خيارات نقل التواصل",

        "احفظ التغييرات"

      ],

      stepsEn: [

        "Open CRM Settings",

        "Review Lead settings",

        "Review duplication settings",

        "Review Opportunity settings",

        "Review communication settings",

        "Save changes"

      ]

    }

  };


  /* =========================================================
     12. INFO MODAL
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
                ${
                  isArabic
                    ? "📖 عرض الخطوات"
                    : "📖 Show Steps"
                }
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


    overlay
      .querySelector(
        "[data-modal-close]"
      )
      ?.addEventListener(
        "click",
        () => overlay.remove()
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay)
          overlay.remove();

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

              ? (
                  isArabic
                    ? "📖 إخفاء الخطوات"
                    : "📖 Hide Steps"
                )

              : (
                  isArabic
                    ? "📖 عرض الخطوات"
                    : "📖 Show Steps"
                );

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
      typeof frappe.set_route !==
        "function"
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
      treeDocs.has(name)
    ) {

      frappe.set_route(
        "Tree",
        name
      );

      return;

    }


    frappe.set_route(
      "List",
      name
    );

  }


  /* =========================================================
     14. RENDER CRM CYCLE
  ========================================================= */

  function renderCrmCycle() {

    if (!crmCycle)
      return;


    crmCycle.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة إدارة علاقات العملاء"
              : "CRM Cycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${crmCycleCards.length},
              minmax(0,1fr)
            );
          "
        >

          ${crmCycleCards

            .map(
              (card, index) => `

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

                      ${escapeHtml(
                        isArabic
                          ? card.labelAr
                          : card.labelEn
                      )}

                    </span>


                    <span class="erp-cycle-description">

                      ${escapeHtml(
                        isArabic
                          ? card.descriptionAr
                          : card.descriptionEn
                      )}

                    </span>

                  </button>


                  ${
                    index <
                    crmCycleCards.length - 1

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

                      : ""
                  }

                </div>

              `
            )

            .join("")}

        </div>

      </section>

    `;


    crmCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          crmCycleCards[
            Number(
              element.dataset.cycleIndex
            )
          ];


        if (!card)
          return;


        openRoute(
          card.doctype
        );

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

      card.fetch().then(value => {

        const element =
          statsSection.querySelector(
            `[data-stat-id="${card.id}"]`
          );


        if (!element)
          return;


        element.textContent =
          card.isCurrency

            ? `${formatCurrency(value)} ${
                isArabic
                  ? "ر.س"
                  : "SAR"
              }`

            : formatNumber(value);

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
                                    ${escapeHtml(translate(item))}
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
                          erp-card is-open
                          tone-${(sectionIndex + cardIndex) % 5}
                        "
                        data-erp-card
                      >

                        <button
                          type="button"
                          class="erp-card-heading"
                          data-card-toggle
                          aria-expanded="true"
                        >

                          <span class="erp-icon">
                            ${card[1]}
                          </span>


                          <span class="erp-card-title">
                            ${escapeHtml(translate(card[0]))}
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
                  ${escapeHtml(translate(section[0]))}
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
        now - lastToggleTime <
        400
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

          }

        });


      selectedCard
        .classList
        .toggle(
          "is-open",
          shouldOpen
        );

    }

  );


  /* =========================================================
     20. INIT
  ========================================================= */

  renderCrmCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();