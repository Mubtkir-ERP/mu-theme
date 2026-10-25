(() => {

  /* =========================================================
     MUBTKIR ERP — WHATSAPP WORKSPACE
     لوحة تحكم قسم واتساب
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const whatsappCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. WHATSAPP CYCLE
     دورة واتساب
  ========================================================= */

  const whatsappCycleCards = [

    {
      step: 1,

      action: "list",
      doctype: "Whatsapp Instance",

      labelEn: "WhatsApp Instance",
      labelAr: "ربط واتساب",

      descriptionEn:
        "Connect and manage the WhatsApp number used by the system.",

      descriptionAr:
        "ربط وإدارة رقم واتساب المستخدم في النظام."
    },

    {
      step: 2,

      action: "list",
      doctype: "WhatsApp Notification",

      labelEn: "Automation",
      labelAr: "الأتمتة",

      descriptionEn:
        "Automatically send WhatsApp notifications from ERPNext events.",

      descriptionAr:
        "إرسال إشعارات واتساب تلقائياً حسب أحداث النظام."
    },


    {
      step: 3,

      action: "list",
      doctype: "WhatsApp Templates",

      labelEn: "Templates",
      labelAr: "القوالب",

      descriptionEn:
        "Create reusable WhatsApp message templates.",

      descriptionAr:
        "إنشاء قوالب رسائل واتساب قابلة لإعادة الاستخدام."
    },


    {
      step: 4,

      action: "list",
      doctype: "WhatsApp Notification Log",

      labelEn: "Message Logs",
      labelAr: "سجلات الرسائل",

      descriptionEn:
        "Review WhatsApp sending logs and delivery results.",

      descriptionAr:
        "متابعة سجلات الإرسال ونتائج رسائل واتساب."
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
      id: "sent",

      short: "S",

      labelEn:
        "Sent Messages",

      labelAr:
        "الرسائل المرسلة",

      fetch: () =>
        getCount(
          "WhatsApp Message",
          {
            status: "Sent"
          }
        )
    },


    {
      id: "delivered",

      short: "D",

      labelEn:
        "Delivered Messages",

      labelAr:
        "الرسائل المستلمة",

      fetch: () =>
        getCount(
          "WhatsApp Message",
          {
            status: "Delivered"
          }
        )
    },


    {
      id: "pending",

      short: "P",

      labelEn:
        "Pending Messages",

      labelAr:
        "الرسائل المعلقة",

      fetch: () =>
        getCount(
          "WhatsApp Message",
          {
            status: "Pending"
          }
        )
    },


    {
      id: "failed",

      short: "F",

      labelEn:
        "Failed Messages",

      labelAr:
        "الرسائل الفاشلة",

      fetch: () =>
        getCount(
          "WhatsApp Message",
          {
            status: "Failed"
          }
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype:
        "Whatsapp Instance",

      action:
        "new",

      labelEn:
        "New WhatsApp Instance",

      labelAr:
        "ربط واتساب جديد"
    },


    {
      doctype:
        "WhatsApp Message",

      action:
        "new",

      labelEn:
        "New WhatsApp Message",

      labelAr:
        "رسالة واتساب جديدة"
    },


    {
      doctype:
        "Bulk WhatsApp Message",

      action:
        "new",

      labelEn:
        "New Bulk Message",

      labelAr:
        "رسالة جماعية جديدة"
    },


    {
      doctype:
        "WhatsApp Notification",

      action:
        "new",

      labelEn:
        "New Notification",

      labelAr:
        "إشعار واتساب جديد"
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
      "WhatsApp Management",

      [

        [
          "Instance Management",
          "📱",
          [
            "Whatsapp Instance",
            "Mubtkir API Server"
          ]
        ],


        [
          "Messaging",
          "💬",
          [
            "WhatsApp Message",
            "Bulk WhatsApp Message",
            "WhatsApp Recipient List"
          ]
        ],


        [
          "Automation",
          "⚡",
          [
            "WhatsApp Notification",
            "WhatsApp Templates"
          ]
        ],


        [
          "Reports",
          "📊",
          [
            "WhatsApp Scheduled Report"
          ]
        ],


        [
          "Logs",
          "📋",
          [
            "WhatsApp Notification Log",
            "WhatsApp Reminder Log"
          ]
        ],


        [
          "Settings",
          "⚙️",
          [
            "WhatsApp Settings"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     8. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "WhatsApp Management":
      "إدارة واتساب",


    "Instance Management":
      "إدارة النسخ",

    "Messaging":
      "الرسائل",

    "Automation":
      "الأتمتة",

    "Reports":
      "التقارير",

    "Logs":
      "السجلات",

    "Settings":
      "الإعدادات",


    "Whatsapp Instance":
      "نسخة واتساب",

    "Mubtkir API Server":
      "خادم Mubtkir API",


    "WhatsApp Message":
      "رسالة واتساب",

    "Bulk WhatsApp Message":
      "رسالة واتساب جماعية",

    "WhatsApp Recipient List":
      "قائمة مستلمي واتساب",


    "WhatsApp Notification":
      "إشعار واتساب",

    "WhatsApp Templates":
      "قوالب واتساب",


    "WhatsApp Scheduled Report":
      "تقرير واتساب مجدول",


    "WhatsApp Notification Log":
      "سجل إشعارات واتساب",

    "WhatsApp Reminder Log":
      "سجل تذكيرات واتساب",


    "WhatsApp Settings":
      "إعدادات واتساب"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "WhatsApp Settings",
      "Mubtkir API Server"
    ]);


  const reportNames =
    new Set([
      "WhatsApp Scheduled Report"
    ]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {


    /* =========================
       WHATSAPP INSTANCE
    ========================= */

    "Whatsapp Instance": {

      icon:
        "📱",

      summaryAr:
        "ربط وإدارة رقم واتساب المستخدم لإرسال واستقبال الرسائل من داخل النظام.",

      summaryEn:
        "Connect and manage the WhatsApp number used to send and receive messages from the system.",

      stepsAr: [

        "اضغط «نسخة واتساب جديدة»",

        "أدخل اسم النسخة",

        "حدد خادم API",

        "أدخل بيانات الاتصال المطلوبة",

        "اضغط «حفظ»",

        "ابدأ عملية ربط الرقم",

        "امسح رمز QR عند ظهوره",

        "تأكد من أن حالة النسخة أصبحت متصلة"

      ],

      stepsEn: [

        "Click «New Whatsapp Instance»",

        "Enter the instance name",

        "Select the API server",

        "Enter the required connection information",

        "Click «Save»",

        "Start the connection process",

        "Scan the QR code when displayed",

        "Verify that the instance status is connected"

      ]

    },


    /* =========================
       MUBTKIR API SERVER
    ========================= */

    "Mubtkir API Server": {

      icon:
        "🖥️",

      summaryAr:
        "إعداد خادم API المستخدم لربط ERPNext بخدمة واتساب.",

      summaryEn:
        "Configure the API server used to connect ERPNext with the WhatsApp service.",

      stepsAr: [

        "افتح «خادم Mubtkir API»",

        "أدخل رابط الخادم",

        "أدخل مفتاح API",

        "راجع إعدادات الاتصال",

        "اختبر الاتصال إن كان الخيار متوفراً",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Open «Mubtkir API Server»",

        "Enter the server URL",

        "Enter the API key",

        "Review connection settings",

        "Test the connection if available",

        "Click «Save»"

      ]

    },


    /* =========================
       WHATSAPP MESSAGE
    ========================= */

    "WhatsApp Message": {

      icon:
        "💬",

      summaryAr:
        "إرسال رسالة واتساب فردية إلى رقم محدد ومتابعة حالة الإرسال.",

      summaryEn:
        "Send an individual WhatsApp message to a specific number and track its status.",

      stepsAr: [

        "اضغط «رسالة واتساب جديدة»",

        "اختر نسخة واتساب",

        "أدخل رقم المستلم مع رمز الدولة",

        "حدد نوع الرسالة",

        "اكتب محتوى الرسالة",

        "أرفق الملف أو الصورة عند الحاجة",

        "راجع بيانات المستلم",

        "اضغط «حفظ»",

        "أرسل الرسالة",

        "تابع حالة الإرسال"

      ],

      stepsEn: [

        "Click «New WhatsApp Message»",

        "Select WhatsApp instance",

        "Enter recipient number with country code",

        "Select message type",

        "Enter message content",

        "Attach file or image if required",

        "Review recipient information",

        "Click «Save»",

        "Send the message",

        "Track delivery status"

      ]

    },


    /* =========================
       BULK MESSAGE
    ========================= */

    "Bulk WhatsApp Message": {

      icon:
        "📢",

      summaryAr:
        "إرسال رسالة واحدة إلى مجموعة من المستلمين من خلال واتساب.",

      summaryEn:
        "Send one WhatsApp message to multiple recipients.",

      stepsAr: [

        "اضغط «رسالة جماعية جديدة»",

        "اختر نسخة واتساب",

        "حدد قائمة المستلمين",

        "اكتب محتوى الرسالة",

        "حدد إعدادات الإرسال",

        "راجع عدد المستلمين",

        "اضغط «حفظ»",

        "ابدأ الإرسال",

        "تابع نتائج الرسائل"

      ],

      stepsEn: [

        "Click «New Bulk Message»",

        "Select WhatsApp instance",

        "Select recipient list",

        "Enter message content",

        "Set sending options",

        "Review recipient count",

        "Click «Save»",

        "Start sending",

        "Review message results"

      ]

    },


    /* =========================
       RECIPIENT LIST
    ========================= */

    "WhatsApp Recipient List": {

      icon:
        "📋",

      summaryAr:
        "إنشاء قوائم مستلمين لإعادة استخدامها في الرسائل الجماعية.",

      summaryEn:
        "Create reusable recipient lists for bulk WhatsApp messages.",

      stepsAr: [

        "اضغط «قائمة مستلمين جديدة»",

        "أدخل اسم القائمة",

        "أضف أسماء المستلمين",

        "أدخل أرقام الهواتف",

        "تأكد من رمز الدولة",

        "راجع القائمة",

        "اضغط «حفظ»",

        "استخدم القائمة في الرسائل الجماعية"

      ],

      stepsEn: [

        "Click «New Recipient List»",

        "Enter list name",

        "Add recipient names",

        "Enter phone numbers",

        "Verify country codes",

        "Review the list",

        "Click «Save»",

        "Use the list in bulk messages"

      ]

    },


    /* =========================
       NOTIFICATION
    ========================= */

    "WhatsApp Notification": {

      icon:
        "🔔",

      summaryAr:
        "إرسال إشعارات واتساب تلقائياً عند تنفيذ أحداث محددة داخل ERPNext.",

      summaryEn:
        "Automatically send WhatsApp notifications when specified ERPNext events occur.",

      stepsAr: [

        "اضغط «إشعار واتساب جديد»",

        "أدخل اسم الإشعار",

        "حدد نوع المستند",

        "حدد الحدث الذي يشغل الإشعار",

        "حدد حقل رقم الهاتف",

        "اكتب نص الرسالة",

        "أضف المتغيرات المطلوبة",

        "حدد نسخة واتساب",

        "فعّل الإشعار",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New WhatsApp Notification»",

        "Enter notification name",

        "Select document type",

        "Select triggering event",

        "Set phone number field",

        "Enter message content",

        "Add required variables",

        "Select WhatsApp instance",

        "Enable notification",

        "Click «Save»"

      ]

    },


    /* =========================
       TEMPLATES
    ========================= */

    "WhatsApp Templates": {

      icon:
        "📝",

      summaryAr:
        "إنشاء قوالب جاهزة لاستخدامها في رسائل وإشعارات واتساب.",

      summaryEn:
        "Create reusable templates for WhatsApp messages and notifications.",

      stepsAr: [

        "اضغط «قالب واتساب جديد»",

        "أدخل اسم القالب",

        "حدد اللغة",

        "اكتب محتوى الرسالة",

        "أضف المتغيرات المطلوبة",

        "راجع القالب",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New WhatsApp Template»",

        "Enter template name",

        "Select language",

        "Enter message content",

        "Add required variables",

        "Review template",

        "Click «Save»"

      ]

    },


    /* =========================
       NOTIFICATION LOG
    ========================= */

    "WhatsApp Notification Log": {

      icon:
        "📋",

      summaryAr:
        "عرض سجل إشعارات واتساب التي تم إرسالها من النظام.",

      summaryEn:
        "View the log of WhatsApp notifications sent by the system.",

      stepsAr: [

        "افتح «سجل إشعارات واتساب»",

        "استخدم الفلاتر لتحديد الفترة",

        "راجع رقم المستلم",

        "راجع حالة الرسالة",

        "افتح السجل لمشاهدة التفاصيل",

        "راجع رسالة الخطأ إذا فشل الإرسال"

      ],

      stepsEn: [

        "Open «WhatsApp Notification Log»",

        "Use filters to select the period",

        "Review recipient number",

        "Review message status",

        "Open a log for details",

        "Check the error message if sending failed"

      ]

    },


    /* =========================
       REMINDER LOG
    ========================= */

    "WhatsApp Reminder Log": {

      icon:
        "⏰",

      summaryAr:
        "عرض سجل التذكيرات التي تم إرسالها من خلال واتساب.",

      summaryEn:
        "View the log of reminders sent through WhatsApp.",

      stepsAr: [

        "افتح «سجل تذكيرات واتساب»",

        "حدد الفترة المطلوبة",

        "راجع المستلمين",

        "راجع حالة كل تذكير",

        "افتح السجل لعرض التفاصيل"

      ],

      stepsEn: [

        "Open «WhatsApp Reminder Log»",

        "Select required period",

        "Review recipients",

        "Review reminder status",

        "Open the log to view details"

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

              


              <div
                class="erp-modal-steps is-shown"
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

        if (
          event.target === overlay
        ) {

          closeModal();

        }

      }

    );


    const launchBtn = overlay.querySelector("[data-modal-launch]");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        closeModal();
        openRoute(data.name || data.labelEn || data.doctype || title);
      });
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


    frappe.set_route(
      "List",
      name
    );

  }


  /* =========================================================
     14. RENDER WHATSAPP CYCLE
  ========================================================= */

  function renderWhatsappCycle() {

    if (!whatsappCycle)
      return;


    const title =
      isArabic
        ? "دورة واتساب"
        : "WhatsApp Cycle";


    whatsappCycle.innerHTML = `

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
              ${whatsappCycleCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${whatsappCycleCards

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
                  whatsappCycleCards.length - 1

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

                      <span
                        class="erp-cycle-number"
                      >
                        ${card.step}
                      </span>


                      <span
                        class="erp-cycle-card-title"
                      >
                        ${escapeHtml(cardTitle)}
                      </span>


                      <span
                        class="erp-cycle-description"
                      >
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


    whatsappCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          whatsappCycleCards[
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

          return;

        }


        if (
          card.action === "list"
        ) {

          openRoute(
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

      <section
        class="erp-overview-container"
      >

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


                    <span
                      class="erp-stat-label"
                    >

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

      card
        .fetch()
        .then(value => {

          const element =
            statsSection.querySelector(
              `[data-stat-id="${card.id}"]`
            );


          if (!element)
            return;


          element.textContent =
            formatNumber(value);

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

                <span
                  class="erp-quick-label"
                >

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


        if (
          button.action === "new"
        ) {

          frappe.new_doc(
            button.doctype
          );

        }

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

                              <div
                                class="erp-link-row"
                              >

                                <button
                                  type="button"
                                  class="erp-link"
                                  data-route-name="${escapeHtml(item)}"
                                >

                                  <span
                                    class="erp-link-text"
                                  >
                                    ${escapeHtml(translate(item))}
                                  </span>


                                  <span
                                    class="erp-link-arrow"
                                  >
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


                          <span
                            class="erp-card-title"
                          >
                            ${escapeHtml(translate(card[0]))}
                          </span>


                          <span
                            class="erp-card-chevron"
                          >
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

              <section
                class="erp-module-section"
              >

                <h2
                  class="erp-section-title"
                >
                  ${escapeHtml(translate(section[0]))}
                </h2>


                <div
                  class="erp-dashboard-grid"
                >
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


      /* التفاصيل */

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


      /* فتح مستند أو تقرير */

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


      /* فتح البطاقة */

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

  renderWhatsappCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();