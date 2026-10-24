(() => {

  /* =========================================================
     MUBTKIR ERP — USERS WORKSPACE
     لوحة تحكم المستخدمين والصلاحيات
  ========================================================= */

  const root = root_element.querySelector("[data-erp-dashboard]");
  const userFlow = root_element.querySelector("[data-purchase-cycle]");
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
     2. USER MANAGEMENT FLOW
     إدارة المستخدمين
  ========================================================= */

  const userFlowCards = [

    {
      step: 1,

      action: "new",
      doctype: "User",

      labelEn: "Create User",
      labelAr: "إنشاء مستخدم",

      descriptionEn:
        "Create a new system user and define login information.",

      descriptionAr:
        "إنشاء مستخدم جديد وتحديد بيانات الدخول."
    },


    {
      step: 2,

      action: "route",
      doctype: "Role Profile",

      labelEn: "Assign Roles",
      labelAr: "تعيين الأدوار",

      descriptionEn:
        "Create role profiles and assign groups of roles.",

      descriptionAr:
        "إنشاء ملفات أدوار وتجميع الصلاحيات للمستخدمين."
    },


    {
      step: 3,

      action: "page",
      route: "permission-manager",

      labelEn: "Role Permissions",
      labelAr: "صلاحيات الأدوار",

      descriptionEn:
        "Control read, write, create, submit and other permissions.",

      descriptionAr:
        "تحديد صلاحيات القراءة والإنشاء والتعديل والتسجيل وغيرها."
    },


    {
      step: 4,

      action: "route",
      doctype: "User Permission",

      labelEn: "User Restrictions",
      labelAr: "تقييد المستخدم",

      descriptionEn:
        "Restrict a user to specific companies, branches or records.",

      descriptionAr:
        "تقييد المستخدم على شركات أو فروع أو بيانات محددة."
    },


    {
      step: 5,

      action: "route",
      doctype: "User",

      labelEn: "Enable / Disable",
      labelAr: "تفعيل / تعطيل",

      descriptionEn:
        "Manage active and disabled system users.",

      descriptionAr:
        "إدارة المستخدمين النشطين والمعطلين."
    }

  ];


  /* =========================================================
     3. OVERVIEW
  ========================================================= */

  const statsCards = [

    /* إجمالي المستخدمين */
    {
      id: "total-users",

      short: "USR",

      labelEn: "Total Users",
      labelAr: "إجمالي المستخدمين",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "User",

              filters: {
                user_type: "System User"
              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* المستخدمون النشطون */
    {
      id: "active-users",

      short: "ACT",

      labelEn: "Active Users",
      labelAr: "المستخدمون النشطون",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "User",

              filters: {

                user_type: "System User",

                enabled: 1

              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* المستخدمون المعطلون */
    {
      id: "disabled-users",

      short: "OFF",

      labelEn: "Disabled Users",
      labelAr: "المستخدمون المعطلون",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {

              doctype: "User",

              filters: {

                user_type: "System User",

                enabled: 0

              }

            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    },


    /* الأدوار */
    {
      id: "roles",

      short: "ROL",

      labelEn: "Roles",
      labelAr: "الأدوار",

      fetch: () =>
        new Promise(resolve => {

          frappe.call({

            method: "frappe.client.get_count",

            args: {
              doctype: "Role"
            },

            callback: data =>
              resolve(data?.message || 0),

            error: () =>
              resolve(0)

          });

        })
    }

  ];


  /* =========================================================
     4. QUICK ACTIONS
  ========================================================= */

  const quickActionButtons = [

    {
      action: "new",

      doctype: "User",

      labelEn: "New User",
      labelAr: "مستخدم جديد"
    },


    {
      action: "new",

      doctype: "Role",

      labelEn: "New Role",
      labelAr: "دور جديد"
    },


    {
      action: "page",

      route: "permission-manager",

      labelEn: "Role Permissions",
      labelAr: "صلاحيات الأدوار"
    },


    {
      action: "new",

      doctype: "User Permission",

      labelEn: "User Permission",
      labelAr: "صلاحية مستخدم"
    }

  ];


  /* =========================================================
     5. FOOTER
  ========================================================= */

  const footerInfo = {

    phone: "0115110455",

    email: "sales@mubtkir.com",

    website: "www.mubtkir.com",

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
     6. DASHBOARD SECTIONS
  ========================================================= */

  const sections = [

    [
      "Reports & Masters",

      [

        /* المستخدمون */
        [
          "Users",
          "👤",
          [
            "User"
          ]
        ],


        /* الأدوار */
        [
          "Roles",
          "🪪",
          [
            "Role",
            "Role Profile"
          ]
        ],


        /* الصلاحيات */
        [
          "Permissions",
          "🔐",
          [
            "Role Permission Manager",
            "User Permission"
          ]
        ],


        /* ملفات الوصول */
        [
          "Access Profiles",
          "📂",
          [
            "Role Profile",
            "Module Profile"
          ]
        ],


        /* إعدادات النظام */
        [
          "System Settings",
          "⚙️",
          [
            "System Settings"
          ]
        ],


        /* المراقبة */
        [
          "Activity & Logs",
          "📋",
          [
            "Activity Log",
            "Error Log"
          ]
        ]

      ]

    ]

  ];


  /* =========================================================
     7. ARABIC TRANSLATIONS
  ========================================================= */

  const arabicFallback = {

    "Reports & Masters":
      "البيانات الرئيسية والإعدادات",


    "Users":
      "المستخدمون",

    "Roles":
      "الأدوار",

    "Permissions":
      "الصلاحيات",

    "Access Profiles":
      "ملفات الوصول",

    "System Settings":
      "إعدادات النظام",

    "Activity & Logs":
      "النشاط والسجلات",


    "User":
      "المستخدم",

    "Role":
      "الدور",

    "Role Profile":
      "ملف الأدوار",

    "Role Permission Manager":
      "إدارة صلاحيات الأدوار",

    "User Permission":
      "صلاحيات المستخدم",

    "Module Profile":
      "ملف الوحدات",

    "Activity Log":
      "سجل النشاط",

    "Error Log":
      "سجل الأخطاء"

  };


  /* =========================================================
     8. ROUTE TYPES
  ========================================================= */

  const singleDocs =
    new Set([
      "System Settings"
    ]);


  const specialPages = {

    "Role Permission Manager":
      "permission-manager"

  };


  /* =========================================================
     9. ITEM DESCRIPTIONS
  ========================================================= */

  const itemDescriptions = {


    /* =========================
       USER
    ========================= */

    "User": {

      icon: "👤",

      summaryAr:
        "إنشاء حساب مستخدم وتحديد بيانات الدخول والأدوار وإمكانية الوصول للنظام.",

      summaryEn:
        "Create a user account and define login details, roles, and system access.",

      stepsAr: [

        "اضغط «مستخدم جديد»",

        "أدخل البريد الإلكتروني للمستخدم",

        "أدخل الاسم الأول والاسم الكامل",

        "فعّل المستخدم",

        "حدد نوع المستخدم «System User»",

        "اختر ملف الأدوار أو أضف الأدوار",

        "حدد اللغة عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New User»",

        "Enter user email",

        "Enter first and full name",

        "Enable the user",

        "Set User Type to System User",

        "Select Role Profile or assign roles",

        "Set language if required",

        "Click «Save»"

      ]

    },


    /* =========================
       ROLE
    ========================= */

    "Role": {

      icon: "🪪",

      summaryAr:
        "إنشاء دور وظيفي يتم استخدامه لتحديد صلاحيات المستخدم على المستندات.",

      summaryEn:
        "Create a role used to control user permissions on documents.",

      stepsAr: [

        "اضغط «دور جديد»",

        "أدخل اسم الدور",

        "حدد إذا كان الدور يسمح بالدخول إلى النظام",

        "اضغط «حفظ»",

        "انتقل إلى إدارة صلاحيات الأدوار",

        "حدد صلاحيات الدور على المستندات"

      ],

      stepsEn: [

        "Click «New Role»",

        "Enter role name",

        "Specify Desk access if applicable",

        "Click «Save»",

        "Open Role Permission Manager",

        "Configure document permissions"

      ]

    },


    /* =========================
       ROLE PROFILE
    ========================= */

    "Role Profile": {

      icon: "📂",

      summaryAr:
        "تجميع عدة أدوار داخل ملف واحد لتعيينها للمستخدم بسهولة.",

      summaryEn:
        "Group multiple roles into one profile for easier assignment to users.",

      stepsAr: [

        "اضغط «ملف أدوار جديد»",

        "أدخل اسم الملف",

        "حدد الأدوار المطلوبة",

        "اضغط «حفظ»",

        "افتح المستخدم",

        "اختر ملف الأدوار"

      ],

      stepsEn: [

        "Click «New Role Profile»",

        "Enter profile name",

        "Select required roles",

        "Click «Save»",

        "Open the User",

        "Assign the Role Profile"

      ]

    },


    /* =========================
       USER PERMISSION
    ========================= */

    "User Permission": {

      icon: "🔐",

      summaryAr:
        "تقييد المستخدم بحيث يرى بيانات محددة فقط مثل شركة أو فرع أو عميل أو مستودع معين.",

      summaryEn:
        "Restrict a user to specific records such as company, branch, customer, or warehouse.",

      stepsAr: [

        "اضغط «صلاحية مستخدم جديدة»",

        "اختر المستخدم",

        "حدد نوع المستند المراد التقييد عليه",

        "حدد القيمة المسموح بها",

        "فعّل تطبيق الصلاحية على المستندات المرتبطة عند الحاجة",

        "اضغط «حفظ»"

      ],

      stepsEn: [

        "Click «New User Permission»",

        "Select user",

        "Select Allow DocType",

        "Select allowed value",

        "Apply to linked documents if required",

        "Click «Save»"

      ]

    },


    /* =========================
       ROLE PERMISSION MANAGER
    ========================= */

    "Role Permission Manager": {

      icon: "🛡️",

      summaryAr:
        "تحديد ما يستطيع كل دور القيام به مثل القراءة والإنشاء والتعديل والحذف والتسجيل والإلغاء.",

      summaryEn:
        "Control what each role can do including read, create, write, delete, submit, and cancel.",

      stepsAr: [

        "افتح «إدارة صلاحيات الأدوار»",

        "اختر نوع المستند",

        "اختر الدور",

        "حدد صلاحيات القراءة والإنشاء والتعديل",

        "حدد التسجيل والإلغاء والتعديل بعد التسجيل عند الحاجة",

        "راجع مستوى الصلاحية",

        "احفظ التغييرات"

      ],

      stepsEn: [

        "Open Role Permission Manager",

        "Select DocType",

        "Select Role",

        "Configure Read, Create and Write",

        "Configure Submit, Cancel and Amend if required",

        "Review Permission Level",

        "Save changes"

      ]

    },


    /* =========================
       MODULE PROFILE
    ========================= */

    "Module Profile": {

      icon: "🧩",

      summaryAr:
        "تحديد الوحدات التي يستطيع المستخدم الوصول إليها داخل النظام.",

      summaryEn:
        "Control which modules are available to a user.",

      stepsAr: [

        "اضغط «ملف وحدات جديد»",

        "أدخل اسم الملف",

        "حدد الوحدات المطلوبة",

        "اضغط «حفظ»",

        "اربط الملف بالمستخدم"

      ],

      stepsEn: [

        "Click «New Module Profile»",

        "Enter profile name",

        "Select required modules",

        "Click «Save»",

        "Assign the profile to a user"

      ]

    },


    /* =========================
       SYSTEM SETTINGS
    ========================= */

    "System Settings": {

      icon: "⚙️",

      summaryAr:
        "إعدادات عامة للنظام تشمل اللغة والتاريخ والوقت وبعض خيارات الأمان والصلاحيات.",

      summaryEn:
        "Configure general system settings including language, date, time, security, and permissions.",

      stepsAr: [

        "افتح «إعدادات النظام»",

        "راجع إعدادات اللغة والتاريخ",

        "راجع إعدادات الجلسات",

        "راجع خيارات الصلاحيات",

        "احفظ التغييرات"

      ],

      stepsEn: [

        "Open System Settings",

        "Review language and date settings",

        "Review session settings",

        "Review permission options",

        "Save changes"

      ]

    }

  };


  /* =========================================================
     10. HELPERS
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
     11. INFO MODAL
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
      .querySelector("[data-modal-close]")
      ?.addEventListener(
        "click",
        closeModal
      );


    overlay.addEventListener(

      "click",

      event => {

        if (event.target === overlay)
          closeModal();

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
     12. ROUTING
  ========================================================= */

  function openRoute(name) {

    if (
      !window.frappe ||
      typeof frappe.set_route !== "function"
    )
      return;


    /* Role Permission Manager */

    if (specialPages[name]) {

      frappe.set_route(
        specialPages[name]
      );

      return;

    }


    /* Single Doc */

    if (singleDocs.has(name)) {

      frappe.set_route(
        "Form",
        name
      );

      return;

    }


    /* Normal List */

    frappe.set_route(
      "List",
      name
    );

  }


  /* =========================================================
     13. RENDER USER FLOW
  ========================================================= */

  function renderUserFlow() {

    if (!userFlow)
      return;


    const sectionTitle =
      isArabic
        ? "إدارة المستخدمين"
        : "User Management Flow";


    userFlow.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${escapeHtml(sectionTitle)}
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${userFlowCards.length},
              minmax(0, 1fr)
            );
          "
        >

          ${userFlowCards

            .map(
              (card, index) => {

                const title =
                  isArabic
                    ? card.labelAr
                    : card.labelEn;


                const description =
                  isArabic
                    ? card.descriptionAr
                    : card.descriptionEn;


                const arrow =
                  index <
                  userFlowCards.length - 1

                    ? `
                      <span
                        class="erp-cycle-arrow"
                        aria-hidden="true"
                      >
                        ${isArabic ? "←" : "→"}
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
                      data-user-flow-index="${index}"
                    >

                      <span class="erp-cycle-number">
                        ${card.step}
                      </span>


                      <span class="erp-cycle-card-title">
                        ${escapeHtml(title)}
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


    userFlow.addEventListener(

      "click",

      event => {

        const element =
          event.target.closest(
            "[data-user-flow-index]"
          );


        if (!element)
          return;


        const card =
          userFlowCards[
            Number(
              element.dataset.userFlowIndex
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
          card.action === "page"
        ) {

          frappe.set_route(
            card.route
          );

          return;

        }


        openRoute(
          card.doctype
        );

      }

    );

  }


  /* =========================================================
     14. RENDER STATS
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


        if (element) {

          element.textContent =
            formatNumber(value);

        }

      });

    });

  }


  /* =========================================================
     15. QUICK ACTIONS
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


        if (
          button.action === "page"
        ) {

          frappe.set_route(
            button.route
          );

          return;

        }


        frappe.new_doc(
          button.doctype
        );

      }

    );

  }


  /* =========================================================
     16. RENDER SECTIONS
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
                                    ${isArabic ? "←" : "→"}
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
     17. FOOTER
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
     18. EVENTS
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


      /* CARD TOGGLE */

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
     19. INIT
  ========================================================= */

  renderUserFlow();

  renderStats();

  renderQuickActions();

  renderSections();

  renderFooter();

})();