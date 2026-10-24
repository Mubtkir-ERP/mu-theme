(() => {

  /* =========================================================
     MUBTKIR ERP — POS WORKSPACE
     نقاط البيع
  ========================================================= */

  const root =
    root_element.querySelector("[data-erp-dashboard]");

  const cycleSection =
    root_element.querySelector("[data-purchase-cycle]");

  const statsSection =
    root_element.querySelector("[data-stats-section]");

  const quickActions =
    root_element.querySelector("[data-quick-actions]");

  const content =
    root_element.querySelector("[data-dashboard-content]");

  const footerEl =
    root_element.querySelector("[data-dashboard-footer]");


  if (!root) {
    console.error("POS Dashboard Root Not Found");
    return;
  }


  /* =========================================================
     1. LANGUAGE
  ========================================================= */

  const lang =
    (
      frappe &&
      frappe.boot &&
      frappe.boot.lang
    )
      ? frappe.boot.lang
      : (
          document.documentElement.lang ||
          "en"
        );


  const isArabic =
    String(lang)
      .toLowerCase()
      .indexOf("ar") === 0;


  root.setAttribute(
    "dir",
    isArabic ? "rtl" : "ltr"
  );


  /* =========================================================
     2. HELPERS
  ========================================================= */

  function escapeHtml(value) {

    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function formatNumber(value) {

    const number =
      parseFloat(value) || 0;

    return number.toLocaleString("en-US");
  }


  function formatCurrency(value) {

    const number =
      parseFloat(value) || 0;

    return number.toLocaleString(
      isArabic ? "ar-SA" : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }


  function today() {

    try {

      if (
        frappe.datetime &&
        frappe.datetime.get_today
      ) {

        return frappe.datetime.get_today();

      }

    }

    catch (e) {}

    return new Date()
      .toISOString()
      .slice(0, 10);
  }


  function safeCount(
    doctype,
    filters
  ) {

    return new Promise(function(resolve) {

      try {

        frappe.call({

          method:
            "frappe.client.get_count",

          args: {

            doctype: doctype,

            filters:
              filters || {}

          },

          callback: function(r) {

            resolve(
              r && r.message
                ? r.message
                : 0
            );

          },

          error: function() {

            resolve(0);

          }

        });

      }

      catch (e) {

        console.error(
          "POS Count Error:",
          doctype,
          e
        );

        resolve(0);

      }

    });

  }


  function getTodayPOSInvoices() {

    return new Promise(function(resolve) {

      try {

        frappe.call({

          method:
            "frappe.client.get_list",

          args: {

            doctype:
              "POS Invoice",

            fields: [
              "name",
              "grand_total",
              "is_return"
            ],

            filters: {

              docstatus: 1,

              posting_date:
                today()

            },

            limit_page_length:
              1000

          },

          callback: function(r) {

            resolve(
              r && r.message
                ? r.message
                : []
            );

          },

          error: function() {

            resolve([]);

          }

        });

      }

      catch (e) {

        console.error(
          "POS Invoice Query Error:",
          e
        );

        resolve([]);

      }

    });

  }


  let invoiceCache = null;


  function loadTodayInvoices() {

    if (!invoiceCache) {

      invoiceCache =
        getTodayPOSInvoices();

    }

    return invoiceCache;
  }


  /* =========================================================
     3. POS CYCLE
  ========================================================= */

  const cycleCards = [

    {
      step: 1,

      action: "new",

      doctype:
        "POS Opening Entry",

      ar:
        "فتح الوردية",

      en:
        "Open POS Shift",

      descAr:
        "فتح وردية نقطة البيع وتسجيل الرصيد الافتتاحي.",

      descEn:
        "Start the POS shift and record opening balances."
    },


    {
      step: 2,

      action: "pos",

      ar:
        "فاتورة البيع",

      en:
        "POS Invoice",

      descAr:
        "إضافة المنتجات وإنشاء فاتورة نقطة البيع.",

      descEn:
        "Add items and create the POS invoice."
    },


    {
      step: 3,

      action: "pos",

      ar:
        "استلام الدفع",

      en:
        "Receive Payment",

      descAr:
        "اختيار طريقة الدفع واستلام قيمة الفاتورة.",

      descEn:
        "Select the payment method and collect payment."
    },


    {
      step: 4,

      action: "return",

      ar:
        "مرتجع المبيعات",

      en:
        "POS Return",

      descAr:
        "إنشاء مرتجع من فاتورة نقطة بيع سابقة.",

      descEn:
        "Create a return against an existing POS invoice."
    },


    {
      step: 5,

      action: "new",

      doctype:
        "POS Closing Entry",

      ar:
        "إغلاق الوردية",

      en:
        "Close POS Shift",

      descAr:
        "إغلاق وردية نقطة البيع ومراجعة المبالغ.",

      descEn:
        "Close the POS shift and review payment totals."
    },


    {
      step: 6,

      action: "list",

      doctype:
        "POS Closing Entry",

      ar:
        "مراجعة التسوية",

      en:
        "Reconciliation",

      descAr:
        "مراجعة الورديات المغلقة وتسويات نقطة البيع.",

      descEn:
        "Review closed shifts and POS reconciliation."
    }

  ];


  /* =========================================================
     4. OVERVIEW
  ========================================================= */

  const statsCards = [

    {
      id:
        "today-sales",

      short:
        "SAR",

      ar:
        "مبيعات اليوم",

      en:
        "Today's Sales",

      currency:
        true,

      fetch:
        async function() {

          const rows =
            await loadTodayInvoices();

          let total = 0;

          rows.forEach(
            function(row) {

              if (
                Number(
                  row.is_return || 0
                ) !== 1
              ) {

                total +=
                  Number(
                    row.grand_total || 0
                  );

              }

            }
          );

          return total;
        }
    },


    {
      id:
        "today-invoices",

      short:
        "INV",

      ar:
        "فواتير اليوم",

      en:
        "Today's Invoices",

      fetch:
        async function() {

          const rows =
            await loadTodayInvoices();

          let count = 0;

          rows.forEach(
            function(row) {

              if (
                Number(
                  row.is_return || 0
                ) !== 1
              ) {

                count++;

              }

            }
          );

          return count;
        }
    },


    {
      id:
        "today-returns",

      short:
        "RET",

      ar:
        "مرتجعات اليوم",

      en:
        "Today's Returns",

      fetch:
        async function() {

          const rows =
            await loadTodayInvoices();

          let count = 0;

          rows.forEach(
            function(row) {

              if (
                Number(
                  row.is_return || 0
                ) === 1
              ) {

                count++;

              }

            }
          );

          return count;
        }
    },


    {
      id:
        "today-shifts",

      short:
        "SHIFT",

      ar:
        "عدد الورديات",

      en:
        "POS Shifts",

      fetch:
        function() {

          return safeCount(

            "POS Opening Entry",

            {
              creation: [
                ">=",
                today()
              ]
            }

          );

        }
    }

  ];


  /* =========================================================
     5. QUICK ACTIONS
  ========================================================= */

  const quickButtons = [

    {
      action:
        "pos",

      ar:
        "فتح نقطة البيع",

      en:
        "Open POS"
    },


    {
      action:
        "new",

      doctype:
        "POS Invoice",

      ar:
        "فاتورة جديدة",

      en:
        "New POS Invoice"
    },


    {
      action:
        "return",

      ar:
        "مرتجع جديد",

      en:
        "New Return"
    },


    {
      action:
        "new",

      doctype:
        "POS Closing Entry",

      ar:
        "إغلاق الوردية",

      en:
        "Close Shift"
    }

  ];


  /* =========================================================
     6. DASHBOARD CARDS
  ========================================================= */

  const cards = [

    {
      titleAr:
        "نقاط البيع",

      titleEn:
        "Point of Sale",

      icon:
        "🛒",

      links: [

        "POS Opening Entry",

        "POS Invoice",

        "POS Closing Entry"

      ]
    },


    {
      titleAr:
        "إعدادات نقاط البيع",

      titleEn:
        "POS Settings",

      icon:
        "⚙️",

      links: [

        "POS Profile"

      ]
    },


    {
      titleAr:
        "طرق الدفع",

      titleEn:
        "Payments",

      icon:
        "💳",

      links: [

        "Mode of Payment"

      ]
    },


    {
      titleAr:
        "العملاء",

      titleEn:
        "Customers",

      icon:
        "👥",

      links: [

        "Customer",

        "Customer Group"

      ]
    },


    {
      titleAr:
        "المنتجات والأسعار",

      titleEn:
        "Items & Pricing",

      icon:
        "🏷️",

      links: [

        "Item",

        "Item Price",

        "Price List"

      ]
    },


    {
      titleAr:
        "المستودعات",

      titleEn:
        "Warehouses",

      icon:
        "📦",

      links: [

        "Warehouse"

      ]
    },


    {
      titleAr:
        "برنامج الولاء",

      titleEn:
        "Loyalty",

      icon:
        "🎁",

      links: [

        "Loyalty Program"

      ]
    },


    {
      titleAr:
        "التقارير",

      titleEn:
        "Reports",

      icon:
        "📊",

      links: [

        "POS Register",

        "Sales Analytics"

      ]
    }

  ];


  /* =========================================================
     7. TRANSLATIONS
  ========================================================= */

  const translations = {

    "POS Opening Entry":
      "فتح وردية نقطة البيع",

    "POS Invoice":
      "فاتورة نقطة البيع",

    "POS Closing Entry":
      "إغلاق وردية نقطة البيع",

    "POS Profile":
      "ملف نقطة البيع",

    "Mode of Payment":
      "طريقة الدفع",

    "Customer":
      "العميل",

    "Customer Group":
      "مجموعة العملاء",

    "Item":
      "المنتج",

    "Item Price":
      "سعر المنتج",

    "Price List":
      "قائمة الأسعار",

    "Warehouse":
      "المستودع",

    "Loyalty Program":
      "برنامج الولاء",

    "POS Register":
      "سجل نقاط البيع",

    "Sales Analytics":
      "تحليلات المبيعات"

  };


  function translate(name) {

    if (!isArabic)
      return name;

    return (
      translations[name] ||
      name
    );
  }


  /* =========================================================
     8. REPORTS / TREES
  ========================================================= */

  const reports = {

    "POS Register":
      true,

    "Sales Analytics":
      true

  };


  const trees = {

    "Customer Group":
      true,

    "Warehouse":
      true

  };


  /* =========================================================
     9. ROUTING
  ========================================================= */

  function openList(doctype) {

    try {

      frappe.set_route(
        "List",
        doctype
      );

    }

    catch (e) {

      console.error(
        "Route Error:",
        doctype,
        e
      );

    }

  }


  function openRoute(name) {

    try {

      if (reports[name]) {

        frappe.set_route(
          "query-report",
          name
        );

        return;

      }


      if (trees[name]) {

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

    catch (e) {

      console.error(
        "Route Error:",
        name,
        e
      );

    }

  }


  function newDoc(doctype) {

    try {

      frappe.new_doc(
        doctype
      );

    }

    catch (e) {

      console.error(
        "New Doc Error:",
        doctype,
        e
      );

    }

  }


  function openPOS() {

    try {

      frappe.set_route(
        "point-of-sale"
      );

    }

    catch (e) {

      console.error(
        "POS Route Error:",
        e
      );

      openList(
        "POS Invoice"
      );

    }

  }


  /* =========================================================
     10. RETURN MODAL
  ========================================================= */

  function showReturnModal() {

    const overlay =
      document.createElement("div");

    overlay.className =
      "erp-modal-overlay";

    overlay.setAttribute(
      "dir",
      isArabic
        ? "rtl"
        : "ltr"
    );


    overlay.innerHTML = `

      <div class="erp-modal-box">

        <button
          type="button"
          class="erp-modal-close"
          data-pos-close
        >
          ✕
        </button>


        <div class="erp-modal-header">

          <span class="erp-modal-icon">
            ↩️
          </span>

          <h3 class="erp-modal-title">

            ${
              isArabic
                ? "مرتجع نقطة البيع"
                : "POS Return"
            }

          </h3>

        </div>


        <p class="erp-modal-summary">

          ${
            isArabic
              ? "افتح فاتورة نقطة البيع الأصلية ثم أنشئ المرتجع منها."
              : "Open the original POS Invoice and create the return from it."
          }

        </p>


        <button
          type="button"
          class="erp-quick-btn"
          data-pos-return-list
          style="
            width:100%;
            margin-top:16px;
          "
        >

          ${
            isArabic
              ? "استعراض فواتير نقطة البيع"
              : "View POS Invoices"
          }

        </button>

      </div>

    `;


    root.appendChild(
      overlay
    );


    requestAnimationFrame(
      function() {

        overlay.classList.add(
          "is-visible"
        );

      }
    );


    const closeButton =
      overlay.querySelector(
        "[data-pos-close]"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        function() {

          overlay.remove();

        }
      );

    }


    const listButton =
      overlay.querySelector(
        "[data-pos-return-list]"
      );


    if (listButton) {

      listButton.addEventListener(
        "click",
        function() {

          overlay.remove();

          openList(
            "POS Invoice"
          );

        }
      );

    }


    overlay.addEventListener(
      "click",
      function(event) {

        if (
          event.target === overlay
        ) {

          overlay.remove();

        }

      }
    );

  }


  /* =========================================================
     11. RENDER CYCLE
  ========================================================= */

  function renderCycle() {

    if (!cycleSection)
      return;


    const html =
      cycleCards
        .map(
          function(card, index) {

            const title =
              isArabic
                ? card.ar
                : card.en;


            const description =
              isArabic
                ? card.descAr
                : card.descEn;


            return `

              <div class="erp-cycle-item">

                <button
                  type="button"
                  class="
                    erp-cycle-card
                    cycle-tone-${(index % 4) + 1}
                  "
                  data-pos-cycle="${index}"
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


                ${
                  index <
                  cycleCards.length - 1

                    ? `
                      <span
                        class="erp-cycle-arrow"
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

            `;

          }
        )
        .join("");


    cycleSection.innerHTML = `

      <section class="erp-cycle-container">

        <h2
          class="
            erp-section-title
            erp-cycle-title
          "
        >
          ${
            isArabic
              ? "دورة نقطة البيع"
              : "Point of Sale Cycle"
          }
        </h2>


        <div
          class="erp-cycle-grid"
          style="
            grid-template-columns:
            repeat(
              ${cycleCards.length},
              minmax(0,1fr)
            );
          "
        >
          ${html}
        </div>

      </section>

    `;


    cycleSection.addEventListener(
      "click",
      function(event) {

        const element =
          event.target.closest(
            "[data-pos-cycle]"
          );


        if (!element)
          return;


        const index =
          Number(
            element.getAttribute(
              "data-pos-cycle"
            )
          );


        const card =
          cycleCards[index];


        if (!card)
          return;


        if (
          card.action === "new"
        ) {

          newDoc(
            card.doctype
          );

          return;

        }


        if (
          card.action === "pos"
        ) {

          openPOS();

          return;

        }


        if (
          card.action === "return"
        ) {

          showReturnModal();

          return;

        }


        openRoute(
          card.doctype
        );

      }
    );

  }


  /* =========================================================
     12. RENDER STATS
  ========================================================= */

  function renderStats() {

    if (!statsSection)
      return;


    const cardsHtml =
      statsCards
        .map(
          function(card, index) {

            return `

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
                    data-pos-stat="${card.id}"
                  >
                    0
                  </span>


                  <span class="erp-stat-label">

                    ${escapeHtml(
                      isArabic
                        ? card.ar
                        : card.en
                    )}

                  </span>

                </div>

              </div>

            `;

          }
        )
        .join("");


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
          ${cardsHtml}
        </div>

      </section>

    `;


    statsCards.forEach(
      function(card) {

        Promise
          .resolve()
          .then(
            function() {

              return card.fetch();

            }
          )
          .then(
            function(value) {

              const el =
                statsSection.querySelector(
                  '[data-pos-stat="' +
                  card.id +
                  '"]'
                );


              if (!el)
                return;


              if (card.currency) {

                el.textContent =
                  formatCurrency(value) +
                  (
                    isArabic
                      ? " ر.س"
                      : " SAR"
                  );

              }

              else {

                el.textContent =
                  formatNumber(value);

              }

            }
          )
          .catch(
            function(error) {

              console.error(
                "POS Stat Error:",
                card.id,
                error
              );

            }
          );

      }
    );

  }


  /* =========================================================
     13. RENDER QUICK ACTIONS
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

        ${quickButtons
          .map(
            function(button, index) {

              return `

                <button
                  type="button"
                  class="erp-quick-btn"
                  data-pos-quick="${index}"
                >

                  <span class="erp-quick-label">

                    ${escapeHtml(
                      isArabic
                        ? button.ar
                        : button.en
                    )}

                  </span>

                </button>

              `;

            }
          )
          .join("")}

      </div>

    `;


    quickActions.addEventListener(
      "click",
      function(event) {

        const el =
          event.target.closest(
            "[data-pos-quick]"
          );


        if (!el)
          return;


        const index =
          Number(
            el.getAttribute(
              "data-pos-quick"
            )
          );


        const button =
          quickButtons[index];


        if (!button)
          return;


        if (
          button.action === "pos"
        ) {

          openPOS();

          return;

        }


        if (
          button.action === "return"
        ) {

          showReturnModal();

          return;

        }


        if (
          button.action === "new"
        ) {

          newDoc(
            button.doctype
          );

        }

      }
    );

  }


  /* =========================================================
     14. RENDER LOWER CARDS
  ========================================================= */

  function renderSections() {

    if (!content)
      return;


    const cardsHtml =
      cards
        .map(
          function(card, index) {

            const links =
              card.links
                .map(
                  function(name) {

                    return `

                      <div class="erp-link-row">

                        <button
                          type="button"
                          class="erp-link"
                          data-pos-route="${escapeHtml(name)}"
                        >

                          <span class="erp-link-text">
                            ${escapeHtml(translate(name))}
                          </span>


                          <span class="erp-link-arrow">
                            ${isArabic ? "←" : "→"}
                          </span>

                        </button>
                                ${
                                  (!/report|setting|تقارير|تقرير|إعداد|اعداد/i.test(card[0]) &&
                                   !/report|setting|تقارير|تقرير|إعداد|اعداد/i.test(section[0]) &&
                                   !/report|setting/i.test(item))
                                    ? `<button type="button" class="erp-info-link" data-info-item="${escapeHtml(item)}">${isArabic ? 'تفاصيل' : 'Details'}</button>`
                                    : ''
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
                  tone-${index % 5}
                "
                data-pos-card
              >

                <button
                  type="button"
                  class="erp-card-heading"
                  data-pos-toggle
                  aria-expanded="false"
                >

                  <span class="erp-icon">
                    ${card.icon}
                  </span>


                  <span class="erp-card-title">

                    ${escapeHtml(
                      isArabic
                        ? card.titleAr
                        : card.titleEn
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


    
  function showInfoModal(itemName) {
    const title = isArabic ? (translate(itemName) || itemName) : itemName;
    const summary = isArabic
      ? ('إدارة ومتابعة ' + title + ' وتنفيذ العمليات المرتبطة بها في النظام.')
      : ('Manage and track ' + itemName + ' and perform related operations.');
    const steps = isArabic
      ? [
          'فتح شاشة ' + title,
          'إدخال وتعبئة البيانات الأساسية المطلوبة',
          'مراجعة وتدقيق الحقول الإلزامية',
          'حفظ المستند والاعتماد النهائي'
        ]
      : [
          'Open ' + itemName,
          'Fill in the required information and fields',
          'Review and verify mandatory values',
          'Save and submit the record'
        ];

    const overlay = document.createElement('div');
    overlay.className = 'erp-modal-overlay';
    overlay.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    overlay.innerHTML =
      '<div class="erp-modal-box">' +
        '<button type="button" class="erp-modal-close" data-modal-close>✕</button>' +
        '<div class="erp-modal-header">' +
          '<span class="erp-modal-icon">📄</span>' +
          '<h3 class="erp-modal-title">' + escapeHtml(title) + '</h3>' +
        '</div>' +
        '<p class="erp-modal-summary">' + escapeHtml(summary) + '</p>' +
        '<button type="button" class="erp-modal-toggle-steps" data-modal-toggle-steps>' +
          (isArabic ? '📖 عرض الخطوات' : '📖 Show Steps') +
        '</button>' +
        '<div class="erp-modal-steps" data-modal-steps>' +
          '<ol class="erp-modal-steps-list">' +
            steps.map(s => '<li>' + escapeHtml(s) + '</li>').join('') +
          '</ol>' +
        '</div>' +
      '</div>';

    root.appendChild(overlay);
    setTimeout(() => overlay.classList.add('is-visible'), 10);

    const closeBtn = overlay.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => overlay.remove());
    }
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });

    const toggleBtn = overlay.querySelector('[data-modal-toggle-steps]');
    const stepsBox = overlay.querySelector('[data-modal-steps]');
    if (toggleBtn && stepsBox) {
      toggleBtn.addEventListener('click', () => {
        stepsBox.classList.toggle('is-shown');
      });
    }
  }


content.innerHTML = `

      <section class="erp-module-section">

        <h2 class="erp-section-title">

          ${
            isArabic
              ? "البيانات الرئيسية والتقارير"
              : "Reports & Masters"
          }

        </h2>


        <div class="erp-dashboard-grid">
          ${cardsHtml}
        </div>

      </section>

    `;


    content.addEventListener(
      "click",
      function(event) {
        const infoButton = event.target.closest('[data-info-item]');
        if (infoButton) {
          event.preventDefault();
          event.stopPropagation();
          showInfoModal(infoButton.dataset.infoItem);
          return;
        }


        const routeButton =
          event.target.closest(
            "[data-pos-route]"
          );


        if (routeButton) {

          event.preventDefault();

          const name =
            routeButton.getAttribute(
              "data-pos-route"
            );


          openRoute(name);

          return;

        }


        const toggle =
          event.target.closest(
            "[data-pos-toggle]"
          );


        if (!toggle)
          return;


        const selectedCard =
          toggle.closest(
            "[data-pos-card]"
          );


        if (!selectedCard)
          return;


        const shouldOpen =
          !selectedCard.classList.contains(
            "is-open"
          );


        content
          .querySelectorAll(
            "[data-pos-card]"
          )
          .forEach(
            function(card) {

              if (
                card !== selectedCard
              ) {

                card.classList.remove(
                  "is-open"
                );

              }

            }
          );


        selectedCard
          .classList
          .toggle(
            "is-open",
            shouldOpen
          );

      }
    );

  }


  /* =========================================================
     15. FOOTER
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
                ? "الهاتف الموحد:"
                : "Phone:"
            }
          </span>

          <a
            href="tel:0115110455"
            class="erp-footer-link"
            dir="ltr"
          >
            0115110455
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
                ? "البريد الإلكتروني:"
                : "Email:"
            }
          </span>

          <a
            href="mailto:sales@mubtkir.com"
            class="erp-footer-link"
          >
            sales@mubtkir.com
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
                ? "الموقع:"
                : "Website:"
            }
          </span>

          <a
            href="https://www.mubtkir.com"
            class="erp-footer-link"
            target="_blank"
          >
            www.mubtkir.com
          </a>

        </div>

      </div>

    `;

  }


  /* =========================================================
     16. INIT
     كل جزء مستقل حتى لا تختفي الصفحة
  ========================================================= */

  try {

    renderCycle();

  }

  catch (e) {

    console.error(
      "POS Cycle Error:",
      e
    );

  }


  try {

    renderStats();

  }

  catch (e) {

    console.error(
      "POS Stats Error:",
      e
    );

  }


  try {

    renderQuickActions();

  }

  catch (e) {

    console.error(
      "POS Quick Actions Error:",
      e
    );

  }


  try {

    renderSections();

  }

  catch (e) {

    console.error(
      "POS Cards Error:",
      e
    );

  }


  try {

    renderFooter();

  }

  catch (e) {

    console.error(
      "POS Footer Error:",
      e
    );

  }

})();