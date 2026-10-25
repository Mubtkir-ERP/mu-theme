(() => {

  /* =========================================================
     MUBTKIR ERP — WEBSITE WORKSPACE
     لوحة تحكم قسم المواقع
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const websiteCycle = root_element.querySelector("[data-purchase-cycle]");
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
     2. WEBSITE CYCLE
     دورة إدارة الموقع
  ========================================================= */

  const websiteCycleCards = [

    {
      step: 1,

      action: "form",
      doctype: "Website Settings",

      labelEn: "Website Setup",
      labelAr: "إعداد الموقع",

      descriptionEn:
        "Configure the website name, logo, homepage and general settings.",

      descriptionAr:
        "إعداد اسم الموقع والشعار والصفحة الرئيسية والإعدادات العامة."
    },


    {
      step: 2,

      action: "list",
      doctype: "Website Theme",

      labelEn: "Website Design",
      labelAr: "تصميم الموقع",

      descriptionEn:
        "Configure website colors, fonts and visual appearance.",

      descriptionAr:
        "تخصيص ألوان الموقع والخطوط والمظهر العام."
    },


    {
      step: 3,

      action: "new",
      doctype: "Web Page",

      labelEn: "Web Pages",
      labelAr: "صفحات الموقع",

      descriptionEn:
        "Create and publish website pages and landing pages.",

      descriptionAr:
        "إنشاء ونشر صفحات الموقع والصفحات التعريفية."
    },


    {
      step: 4,

      action: "new",
      doctype: "Web Form",

      labelEn: "Web Forms",
      labelAr: "نماذج الموقع",

      descriptionEn:
        "Create forms for requests, registrations and customer submissions.",

      descriptionAr:
        "إنشاء نماذج للطلبات والتسجيل وإدخال بيانات العملاء."
    },


    {
      step: 5,

      action: "new",
      doctype: "Blog Post",

      labelEn: "Content & Blog",
      labelAr: "المحتوى والمدونة",

      descriptionEn:
        "Create articles and website content for visitors.",

      descriptionAr:
        "إنشاء المقالات والمحتوى الذي يظهر لزوار الموقع."
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

          doctype:
            doctype,

          filters:
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
      id:
        "web-pages",

      short:
        "WP",

      labelEn:
        "Web Pages",

      labelAr:
        "صفحات الموقع",

      fetch: () =>
        getCount(
          "Web Page"
        )
    },


    {
      id:
        "web-forms",

      short:
        "WF",

      labelEn:
        "Web Forms",

      labelAr:
        "نماذج الموقع",

      fetch: () =>
        getCount(
          "Web Form"
        )
    },


    {
      id:
        "blog-posts",

      short:
        "BP",

      labelEn:
        "Blog Posts",

      labelAr:
        "مقالات المدونة",

      fetch: () =>
        getCount(
          "Blog Post"
        )
    },


    {
      id:
        "help-articles",

      short:
        "HA",

      labelEn:
        "Help Articles",

      labelAr:
        "مقالات المساعدة",

      fetch: () =>
        getCount(
          "Help Article"
        )
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      doctype:
        "Web Page",

      labelEn:
        "New Web Page",

      labelAr:
        "صفحة ويب جديدة"
    },


    {
      doctype:
        "Web Form",

      labelEn:
        "New Web Form",

      labelAr:
        "نموذج ويب جديد"
    },


    {
      doctype:
        "Blog Post",

      labelEn:
        "New Blog Post",

      labelAr:
        "مقال مدونة جديد"
    },


    {
      doctype:
        "Help Article",

      labelEn:
        "New Help Article",

      labelAr:
        "مقال مساعدة جديد"
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
          "Setup",
          "⚙️",
          [
            "Website Settings",
            "Website Theme",
            "Website Script",
            "About Us Settings",
            "Contact Us Settings"
          ]
        ],


        [
          "Website",
          "🌐",
          [
            "Web Page",
            "Web Form",
            "Website Sidebar",
            "Website Slideshow",
            "Website Route Meta"
          ]
        ],


        [
          "Blog",
          "📝",
          [
            "Blog Post",
            "Blogger",
            "Blog Category"
          ]
        ],


        [
          "Portal",
          "🚪",
          [
            "Portal Settings"
          ]
        ],


        [
          "Knowledge Base",
          "📚",
          [
            "Help Category",
            "Help Article"
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


    "Setup":
      "الإعدادات",

    "Website":
      "الموقع الإلكتروني",

    "Blog":
      "المدونة",

    "Portal":
      "البوابة",

    "Knowledge Base":
      "قاعدة المعرفة",


    "Website Settings":
      "إعدادات الموقع",

    "Website Theme":
      "قالب الموقع",

    "Website Script":
      "سكريبت الموقع",

    "About Us Settings":
      "إعدادات من نحن",

    "Contact Us Settings":
      "إعدادات اتصل بنا",


    "Web Page":
      "صفحة ويب",

    "Web Form":
      "نموذج ويب",

    "Website Sidebar":
      "الشريط الجانبي للموقع",

    "Website Slideshow":
      "عرض شرائح الموقع",

    "Website Route Meta":
      "بيانات مسار الموقع",


    "Blog Post":
      "مقال مدونة",

    "Blogger":
      "كاتب المدونة",

    "Blog Category":
      "تصنيف المدونة",


    "Portal Settings":
      "إعدادات البوابة",


    "Help Category":
      "تصنيف المساعدة",

    "Help Article":
      "مقال مساعدة"

  };


  /* =========================================================
     9. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([

      "Website Settings",

      "About Us Settings",

      "Contact Us Settings",

      "Portal Settings"

    ]);


  const reportNames =
    new Set([]);


  /* =========================================================
     10. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {


    /* =========================
       WEBSITE SETTINGS
    ========================= */

    "Website Settings": {

      icon:
        "⚙️",

      summaryAr:
        "الإعدادات العامة للموقع مثل اسم الموقع والشعار والصفحة الرئيسية وبيانات SEO والتذييل.",

      summaryEn:
        "Configure general website settings including site name, logo, homepage, SEO and footer.",

      stepsAr: [

        "افتح «إعدادات الموقع»",

        "أدخل اسم الموقع",

        "حدد الصفحة الرئيسية",

        "أضف شعار الموقع",

        "أضف Favicon",

        "راجع إعدادات SEO",

        "راجع إعدادات تذييل الموقع",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Open «Website Settings»",

        "Enter website name",

        "Set homepage",

        "Add website logo",

        "Add favicon",

        "Review SEO settings",

        "Review footer settings",

        "Click «Save»"

      ]

    },


    /* =========================
       WEBSITE THEME
    ========================= */

    "Website Theme": {

      icon:
        "🎨",

      summaryAr:
        "تخصيص تصميم الموقع والألوان والخطوط والعناصر المرئية.",

      summaryEn:
        "Customize website design, colors, fonts and visual appearance.",

      stepsAr: [

        "افتح «قالب الموقع»",

        "أنشئ قالباً جديداً",

        "حدد الألوان الرئيسية",

        "حدد الخطوط",

        "عدل تنسيق الأزرار والعناصر",

        "أضف CSS مخصص عند الحاجة",

        "احفظ القالب",

        "فعّل القالب للموقع"

      ],

      stepsEn: [

        "Open «Website Theme»",

        "Create a new theme",

        "Set primary colors",

        "Configure fonts",

        "Customize buttons and components",

        "Add custom CSS if required",

        "Save the theme",

        "Activate the theme"

      ]

    },


    /* =========================
       WEBSITE SCRIPT
    ========================= */

    "Website Script": {

      icon:
        "💻",

      summaryAr:
        "إضافة JavaScript مخصص ليعمل على صفحات الموقع الإلكتروني.",

      summaryEn:
        "Add custom JavaScript that runs on the website pages."

    },


    /* =========================
       ABOUT US
    ========================= */

    "About Us Settings": {

      icon:
        "ℹ️",

      summaryAr:
        "إعداد صفحة من نحن ومعلومات الشركة والرؤية والرسالة.",

      summaryEn:
        "Configure the About Us page and company information."

    },


    /* =========================
       CONTACT US
    ========================= */

    "Contact Us Settings": {

      icon:
        "☎️",

      summaryAr:
        "إعداد صفحة التواصل وعنوان الشركة والبريد وبيانات الاتصال.",

      summaryEn:
        "Configure the Contact Us page, company address and contact information."

    },


    /* =========================
       WEB PAGE
    ========================= */

    "Web Page": {

      icon:
        "🌐",

      summaryAr:
        "إنشاء صفحات ويب مخصصة ونشرها مباشرة على الموقع.",

      summaryEn:
        "Create and publish custom website pages.",

      stepsAr: [

        "اضغط «صفحة ويب جديدة»",

        "أدخل عنوان الصفحة",

        "راجع مسار الصفحة",

        "حدد نوع المحتوى",

        "أضف النصوص والصور",

        "أضف بيانات SEO",

        "فعّل خيار النشر",

        "اضغط «حفظ»",

        "افتح الصفحة للتأكد من التصميم"

      ],

      stepsEn: [

        "Click «New Web Page»",

        "Enter page title",

        "Review page route",

        "Select content type",

        "Add text and images",

        "Add SEO information",

        "Enable published",

        "Click «Save»",

        "Open the page and review the design"

      ]

    },


    /* =========================
       WEB FORM
    ========================= */

    "Web Form": {

      icon:
        "📋",

      summaryAr:
        "إنشاء نموذج يمكن للزوار استخدامه لإرسال البيانات إلى النظام.",

      summaryEn:
        "Create a website form that allows visitors to submit information to the system.",

      stepsAr: [

        "اضغط «نموذج ويب جديد»",

        "أدخل عنوان النموذج",

        "اختر نوع المستند المرتبط",

        "أضف الحقول المطلوبة",

        "حدد الحقول الإلزامية",

        "حدد هل يحتاج المستخدم إلى تسجيل الدخول",

        "أضف رسالة نجاح بعد الإرسال",

        "فعّل النشر",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Web Form»",

        "Enter form title",

        "Select linked DocType",

        "Add required fields",

        "Configure mandatory fields",

        "Set login requirement",

        "Add success message",

        "Enable published",

        "Click «Save»"

      ]

    },


    /* =========================
       WEBSITE SIDEBAR
    ========================= */

    "Website Sidebar": {

      icon:
        "📐",

      summaryAr:
        "إنشاء قائمة جانبية تحتوي على روابط يمكن استخدامها داخل صفحات الموقع.",

      summaryEn:
        "Create a website sidebar containing navigation links."

    },


    /* =========================
       SLIDESHOW
    ========================= */

    "Website Slideshow": {

      icon:
        "🖼️",

      summaryAr:
        "إنشاء عرض صور متحرك لاستخدامه في صفحات الموقع.",

      summaryEn:
        "Create an image slideshow for use on website pages.",

      stepsAr: [

        "اضغط «عرض شرائح جديد»",

        "أدخل اسم العرض",

        "أضف الصور",

        "أضف العناوين والوصف",

        "رتب الصور",

        "اضغط «حفظ»",

        "اربط العرض بصفحة الموقع"

      ],

      stepsEn: [

        "Click «New Website Slideshow»",

        "Enter slideshow name",

        "Add images",

        "Add titles and descriptions",

        "Arrange image order",

        "Click «Save»",

        "Use the slideshow on a website page"

      ]

    },


    /* =========================
       WEBSITE ROUTE META
    ========================= */

    "Website Route Meta": {

      icon:
        "🔗",

      summaryAr:
        "إضافة بيانات SEO وMeta Tags لمسارات محددة في الموقع.",

      summaryEn:
        "Add SEO information and meta tags for specific website routes."

    },


    /* =========================
       BLOG POST
    ========================= */

    "Blog Post": {

      icon:
        "📝",

      summaryAr:
        "إنشاء ونشر مقالات في مدونة الموقع الإلكتروني.",

      summaryEn:
        "Create and publish articles on the website blog.",

      stepsAr: [

        "اضغط «مقال مدونة جديد»",

        "أدخل عنوان المقال",

        "حدد الكاتب",

        "حدد التصنيف",

        "أضف صورة المقال",

        "اكتب محتوى المقال",

        "أضف بيانات SEO",

        "فعّل خيار النشر",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Blog Post»",

        "Enter post title",

        "Select blogger",

        "Select category",

        "Add featured image",

        "Write article content",

        "Add SEO information",

        "Enable published",

        "Click «Save»"

      ]

    },


    /* =========================
       BLOGGER
    ========================= */

    "Blogger": {

      icon:
        "✍️",

      summaryAr:
        "تعريف كتّاب المدونة وإضافة أسمائهم وصورهم ونبذة عنهم.",

      summaryEn:
        "Define blog authors with their names, profile images and biographies."

    },


    /* =========================
       BLOG CATEGORY
    ========================= */

    "Blog Category": {

      icon:
        "🏷️",

      summaryAr:
        "إنشاء تصنيفات لتنظيم مقالات المدونة.",

      summaryEn:
        "Create categories to organize blog articles."

    },


    /* =========================
       PORTAL SETTINGS
    ========================= */

    "Portal Settings": {

      icon:
        "🚪",

      summaryAr:
        "إدارة إعدادات بوابة المستخدمين والعملاء في الموقع.",

      summaryEn:
        "Manage website portal settings for users and customers."

    },


    /* =========================
       HELP CATEGORY
    ========================= */

    "Help Category": {

      icon:
        "📂",

      summaryAr:
        "إنشاء تصنيفات لتنظيم مقالات قاعدة المعرفة.",

      summaryEn:
        "Create categories to organize knowledge base articles."

    },


    /* =========================
       HELP ARTICLE
    ========================= */

    "Help Article": {

      icon:
        "📄",

      summaryAr:
        "إنشاء مقالات مساعدة وأدلة استخدام تظهر في قاعدة المعرفة.",

      summaryEn:
        "Create help articles and user guides for the website knowledge base.",

      stepsAr: [

        "اضغط «مقال مساعدة جديد»",

        "حدد التصنيف",

        "أدخل عنوان المقال",

        "اكتب محتوى الشرح",

        "أضف الصور عند الحاجة",

        "راجع المحتوى",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New Help Article»",

        "Select category",

        "Enter article title",

        "Write help content",

        "Add images if required",

        "Review content",

        "Click «Save»"

      ]

    }

  };


  /* =========================================================
     11. TRANSLATION & HELPERS
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
     14. RENDER WEBSITE CYCLE
  ========================================================= */

  function renderWebsiteCycle() {

    if (!websiteCycle)
      return;


    const title =
      isArabic
        ? "دورة إدارة الموقع"
        : "Website Management Cycle";


    websiteCycle.innerHTML = `

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
              ${websiteCycleCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${websiteCycleCards

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
                  websiteCycleCards.length - 1

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


    websiteCycle.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-cycle-index]"
          );


        if (!element)
          return;


        const card =
          websiteCycleCards[
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
          card.action === "form"
        ) {

          frappe.set_route(
            "Form",
            card.doctype
          );

          return;

        }


        if (
          card.action === "list"
        ) {

          frappe.set_route(
            "List",
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


      /* CARD OPEN / CLOSE */

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

  renderWebsiteCycle();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();