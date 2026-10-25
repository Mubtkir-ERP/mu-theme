(function () {

    /* =====================================================
       MUBTKIR ERP — MANUFACTURING
    ===================================================== */

    var attempts = 0;
    var maxAttempts = 20;


    function startDashboard() {

        attempts++;

        var scope;

        if (
            typeof root_element !== "undefined" &&
            root_element
        ) {
            scope = root_element;
        } else {
            scope = document;
        }


        var root =
            scope.querySelector("[data-erp-dashboard]");

        var cycleSection =
            scope.querySelector("[data-purchase-cycle]");

        var statsSection =
            scope.querySelector("[data-stats-section]");

        var quickActions =
            scope.querySelector("[data-quick-actions]");

        var content =
            scope.querySelector("[data-dashboard-content]");

        var footerEl =
            scope.querySelector("[data-dashboard-footer]");


        if (
            !root ||
            !cycleSection ||
            !statsSection ||
            !quickActions ||
            !content
        ) {

            if (attempts < maxAttempts) {

                setTimeout(
                    startDashboard,
                    250
                );

            } else {

                console.error(
                    "Manufacturing Dashboard HTML not found"
                );

            }

            return;
        }


        if (
            root.getAttribute(
                "data-manufacturing-loaded"
            ) === "1"
        ) {
            return;
        }


        root.setAttribute(
            "data-manufacturing-loaded",
            "1"
        );


        /* =================================================
           LANGUAGE
        ================================================= */

        var lang = "en";

        try {

            if (
                window.frappe &&
                frappe.boot &&
                frappe.boot.lang
            ) {

                lang = frappe.boot.lang;

            }

        } catch (e) {}


        var isArabic =
            String(lang)
                .toLowerCase()
                .indexOf("ar") === 0;


        root.setAttribute(
            "dir",
            isArabic ? "rtl" : "ltr"
        );


        /* =================================================
           HELPERS
        ================================================= */

        function text(ar, en) {

            return isArabic
                ? ar
                : en;

        }


        function escapeHtml(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function formatNumber(value) {

            var number =
                parseFloat(value) || 0;

            return number.toLocaleString(
                "en-US"
            );

        }


        function newDoc(doctype) {

            try {

                frappe.new_doc(
                    doctype
                );

            } catch (e) {

                console.error(
                    "Manufacturing New Doc Error:",
                    doctype,
                    e
                );

            }

        }


        function openList(doctype) {

            try {

                frappe.set_route(
                    "List",
                    doctype
                );

            } catch (e) {

                console.error(
                    "Manufacturing Route Error:",
                    doctype,
                    e
                );

            }

        }


        function openReport(report) {

            try {

                frappe.set_route(
                    "query-report",
                    report
                );

            } catch (e) {

                console.error(
                    "Manufacturing Report Error:",
                    report,
                    e
                );

            }

        }


        function getCount(
            doctype,
            filters,
            callback
        ) {

            try {

                frappe.call({

                    method:
                        "frappe.client.get_count",

                    args: {

                        doctype:
                            doctype,

                        filters:
                            filters || {}

                    },

                    callback:
                        function (r) {

                            var value = 0;

                            if (
                                r &&
                                r.message !== undefined
                            ) {
                                value = r.message;
                            }

                            callback(value);

                        },

                    error:
                        function () {
                            callback(0);
                        }

                });

            } catch (e) {

                callback(0);

            }

        }


        /* =================================================
           1. MANUFACTURING CYCLE
        ================================================= */

        var cycle = [

            {
                ar:
                    "إنشاء منتج",

                en:
                    "Create Item",

                descAr:
                    "تعريف المنتج النهائي والمواد الخام المطلوبة.",

                descEn:
                    "Define finished goods and required raw materials.",

                action:
                    "new",

                target:
                    "Item"
            },


            {
                ar:
                    "إنشاء BOM",

                en:
                    "Create BOM",

                descAr:
                    "تحديد مكونات المنتج وكميات المواد المطلوبة للتصنيع.",

                descEn:
                    "Define product components and required material quantities.",

                action:
                    "new",

                target:
                    "BOM"
            },


            {
                ar:
                    "خطة الإنتاج",

                en:
                    "Production Plan",

                descAr:
                    "تخطيط الكميات المطلوب تصنيعها والمواد المطلوبة.",

                descEn:
                    "Plan production quantities and material requirements.",

                action:
                    "new",

                target:
                    "Production Plan"
            },


            {
                ar:
                    "أمر العمل",

                en:
                    "Work Order",

                descAr:
                    "إنشاء أمر العمل للمنتج وتحديد كمية التصنيع.",

                descEn:
                    "Create a work order and define production quantity.",

                action:
                    "new",

                target:
                    "Work Order"
            },


            {
                ar:
                    "صرف المواد",

                en:
                    "Material Transfer",

                descAr:
                    "نقل المواد الخام إلى مستودع تحت التصنيع.",

                descEn:
                    "Transfer raw materials to work-in-progress.",

                action:
                    "new",

                target:
                    "Stock Entry"
            },


            {
                ar:
                    "تنفيذ التصنيع",

                en:
                    "Manufacture",

                descAr:
                    "تسجيل عملية التصنيع واستهلاك المواد الخام.",

                descEn:
                    "Record manufacturing and consume raw materials.",

                action:
                    "new",

                target:
                    "Stock Entry"
            },


            {
                ar:
                    "استلام المنتج",

                en:
                    "Finished Goods",

                descAr:
                    "استلام المنتج النهائي في المستودع بعد اكتمال التصنيع.",

                descEn:
                    "Receive finished goods into stock after production.",

                action:
                    "list",

                target:
                    "Work Order"
            }

        ];


        var cycleHtml = "";


        for (
            var i = 0;
            i < cycle.length;
            i++
        ) {

            cycleHtml +=

                '<div class="erp-cycle-item">' +

                    '<button ' +
                    'type="button" ' +
                    'class="erp-cycle-card cycle-tone-' +
                    ((i % 4) + 1) +
                    '" data-mfg-cycle="' +
                    i +
                    '">' +

                        '<span class="erp-cycle-number">' +
                            (i + 1) +
                        '</span>' +

                        '<span class="erp-cycle-card-title">' +

                            escapeHtml(
                                text(
                                    cycle[i].ar,
                                    cycle[i].en
                                )
                            ) +

                        '</span>' +

                        '<span class="erp-cycle-description">' +

                            escapeHtml(
                                text(
                                    cycle[i].descAr,
                                    cycle[i].descEn
                                )
                            ) +

                        '</span>' +

                    '</button>' +

                    (
                        i < cycle.length - 1

                        ? '<span class="erp-cycle-arrow">' +
                            (
                                isArabic
                                    ? "←"
                                    : "→"
                            ) +
                          '</span>'

                        : ""
                    ) +

                '</div>';

        }


        cycleSection.innerHTML =

            '<section class="erp-cycle-container">' +

                '<h2 class="erp-section-title erp-cycle-title">' +

                    text(
                        "دورة التصنيع",
                        "Manufacturing Cycle"
                    ) +

                '</h2>' +

                '<div class="erp-cycle-grid" ' +
                'style="grid-template-columns:repeat(' +
                cycle.length +
                ',minmax(0,1fr));">' +

                    cycleHtml +

                '</div>' +

            '</section>';


        cycleSection.addEventListener(
            "click",
            function (event) {

                var button =
                    event.target.closest(
                        "[data-mfg-cycle]"
                    );


                if (!button) {
                    return;
                }


                var index =
                    parseInt(
                        button.getAttribute(
                            "data-mfg-cycle"
                        ),
                        10
                    );


                var item =
                    cycle[index];


                if (!item) {
                    return;
                }


                if (
                    item.action === "new"
                ) {

                    newDoc(
                        item.target
                    );

                } else {

                    openList(
                        item.target
                    );

                }

            }
        );


        /* =================================================
           2. OVERVIEW
        ================================================= */

        statsSection.innerHTML =

            '<section class="erp-overview-container">' +

                '<h2 class="erp-section-title">' +

                    text(
                        "نظرة عامة",
                        "Overview"
                    ) +

                '</h2>' +

                '<div class="erp-stats-grid">' +


                    '<div class="erp-stat-card overview-tone-1">' +

                        '<div class="erp-stat-icon">WO</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-mfg-work-orders>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "أوامر العمل المفتوحة",
                                    "Open Work Orders"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-2">' +

                        '<div class="erp-stat-icon">BOM</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-mfg-bom>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "قوائم المواد الفعالة",
                                    "Active BOMs"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-3">' +

                        '<div class="erp-stat-icon">PP</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-mfg-production-plans>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "خطط الإنتاج",
                                    "Production Plans"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                    '<div class="erp-stat-card overview-tone-4">' +

                        '<div class="erp-stat-icon">JOB</div>' +

                        '<div class="erp-stat-info">' +

                            '<span class="erp-stat-value" data-mfg-job-cards>0</span>' +

                            '<span class="erp-stat-label">' +

                                text(
                                    "بطاقات العمل المفتوحة",
                                    "Open Job Cards"
                                ) +

                            '</span>' +

                        '</div>' +

                    '</div>' +


                '</div>' +

            '</section>';


        getCount(
            "Work Order",
            {
                docstatus: 1,
                status: [
                    "not in",
                    [
                        "Completed",
                        "Stopped",
                        "Cancelled"
                    ]
                ]
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-mfg-work-orders]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "BOM",
            {
                is_active: 1,
                docstatus: 1
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-mfg-bom]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "Production Plan",
            {
                docstatus: [
                    "<",
                    2
                ]
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-mfg-production-plans]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        getCount(
            "Job Card",
            {
                docstatus: 0
            },
            function (value) {

                var el =
                    statsSection.querySelector(
                        "[data-mfg-job-cards]"
                    );

                if (el) {
                    el.textContent =
                        formatNumber(value);
                }

            }
        );


        /* =================================================
           3. QUICK ACTIONS
        ================================================= */

        quickActions.innerHTML =

            '<h2 class="erp-section-title">' +

                text(
                    "اختصارات سريعة",
                    "Quick Actions"
                ) +

            '</h2>' +

            '<div class="erp-quick-grid">' +

                '<button class="erp-quick-btn" data-mfg-new-bom>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "BOM جديد",
                            "New BOM"
                        ) +
                    '</span>' +
                '</button>' +

                '<button class="erp-quick-btn" data-mfg-new-work-order>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "أمر عمل جديد",
                            "New Work Order"
                        ) +
                    '</span>' +
                '</button>' +

                '<button class="erp-quick-btn" data-mfg-new-production-plan>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "خطة إنتاج جديدة",
                            "New Production Plan"
                        ) +
                    '</span>' +
                '</button>' +

                '<button class="erp-quick-btn" data-mfg-new-stock-entry>' +
                    '<span class="erp-quick-label">' +
                        text(
                            "قيد تصنيع جديد",
                            "New Stock Entry"
                        ) +
                    '</span>' +
                '</button>' +

            '</div>';


        quickActions
            .querySelector(
                "[data-mfg-new-bom]"
            )
            .addEventListener(
                "click",
                function () {

                    newDoc(
                        "BOM"
                    );

                }
            );


        quickActions
            .querySelector(
                "[data-mfg-new-work-order]"
            )
            .addEventListener(
                "click",
                function () {

                    newDoc(
                        "Work Order"
                    );

                }
            );


        quickActions
            .querySelector(
                "[data-mfg-new-production-plan]"
            )
            .addEventListener(
                "click",
                function () {

                    newDoc(
                        "Production Plan"
                    );

                }
            );


        quickActions
            .querySelector(
                "[data-mfg-new-stock-entry]"
            )
            .addEventListener(
                "click",
                function () {

                    newDoc(
                        "Stock Entry"
                    );

                }
            );


        /* =================================================
           4. DESCRIPTIONS
        ================================================= */

        var descriptions = {

            "BOM": {

                titleAr:
                    "قائمة المواد BOM",

                titleEn:
                    "BOM",

                summaryAr:
                    "تحديد مكونات المنتج النهائي والكميات والعمليات المطلوبة لتصنيعه.",

                summaryEn:
                    "Define raw materials, quantities and operations required to manufacture the finished item.",

                stepsAr: [
                    "إنشاء BOM جديد",
                    "اختيار المنتج النهائي",
                    "تحديد الكمية",
                    "إضافة المواد الخام",
                    "تحديد كمية كل مادة",
                    "إضافة العمليات عند الحاجة",
                    "مراجعة التكلفة",
                    "حفظ واعتماد BOM"
                ],

                stepsEn: [
                    "Create BOM",
                    "Select finished item",
                    "Enter quantity",
                    "Add raw materials",
                    "Enter material quantities",
                    "Add operations if required",
                    "Review cost",
                    "Save and submit"
                ]

            },


            "Production Plan": {

                titleAr:
                    "خطة الإنتاج",

                titleEn:
                    "Production Plan",

                summaryAr:
                    "تجميع متطلبات التصنيع وتحديد الكميات والمواد اللازمة للإنتاج.",

                summaryEn:
                    "Plan production quantities and calculate required raw materials.",

                stepsAr: [
                    "إنشاء خطة إنتاج",
                    "إضافة المنتجات المطلوب تصنيعها",
                    "تحديد الكميات",
                    "جلب BOM",
                    "حساب المواد المطلوبة",
                    "مراجعة المخزون",
                    "إنشاء أوامر العمل"
                ],

                stepsEn: [
                    "Create Production Plan",
                    "Add items to manufacture",
                    "Enter quantities",
                    "Fetch BOM",
                    "Calculate materials",
                    "Review stock",
                    "Create Work Orders"
                ]

            },


            "Work Order": {

                titleAr:
                    "أمر العمل",

                titleEn:
                    "Work Order",

                summaryAr:
                    "أمر تنفيذ التصنيع للمنتج مع تحديد الكمية وBOM والمستودعات.",

                summaryEn:
                    "Manufacturing order specifying item, quantity, BOM and warehouses.",

                stepsAr: [
                    "إنشاء أمر عمل",
                    "اختيار المنتج",
                    "تحديد BOM",
                    "إدخال كمية التصنيع",
                    "تحديد مستودع المواد الخام",
                    "تحديد مستودع تحت التصنيع",
                    "تحديد مستودع المنتج النهائي",
                    "حفظ واعتماد أمر العمل"
                ],

                stepsEn: [
                    "Create Work Order",
                    "Select item",
                    "Select BOM",
                    "Enter production quantity",
                    "Set source warehouse",
                    "Set WIP warehouse",
                    "Set finished goods warehouse",
                    "Save and submit"
                ]

            },


            "Job Card": {

                titleAr:
                    "بطاقة العمل",

                titleEn:
                    "Job Card",

                summaryAr:
                    "متابعة العملية الإنتاجية والوقت والموظفين المشاركين في كل مرحلة.",

                summaryEn:
                    "Track manufacturing operations, time and employees involved.",

                stepsAr: [
                    "فتح بطاقة العمل",
                    "مراجعة أمر العمل",
                    "تحديد العملية",
                    "تسجيل وقت البداية",
                    "تسجيل الموظفين",
                    "تسجيل الكمية المنجزة",
                    "إنهاء العملية"
                ],

                stepsEn: [
                    "Open Job Card",
                    "Review Work Order",
                    "Select operation",
                    "Record start time",
                    "Assign employees",
                    "Record completed quantity",
                    "Complete operation"
                ]

            },


            "Stock Entry": {

                titleAr:
                    "القيد المخزني للتصنيع",

                titleEn:
                    "Manufacturing Stock Entry",

                summaryAr:
                    "صرف المواد الخام أو تسجيل التصنيع واستلام المنتج النهائي.",

                summaryEn:
                    "Transfer raw materials or record manufacture and finished goods receipt.",

                stepsAr: [
                    "إنشاء قيد مخزني",
                    "اختيار نوع العملية",
                    "ربط أمر العمل",
                    "مراجعة المواد الخام",
                    "تحديد المستودعات",
                    "مراجعة الكميات",
                    "حفظ واعتماد القيد"
                ],

                stepsEn: [
                    "Create Stock Entry",
                    "Select purpose",
                    "Link Work Order",
                    "Review raw materials",
                    "Select warehouses",
                    "Review quantities",
                    "Save and submit"
                ]

            }

        };


        /* =================================================
           DETAILS MODAL
        ================================================= */

        function showDetails(name) {

            var data =
                descriptions[name];


            if (!data) {
                return;
            }


            var steps =
                isArabic
                    ? data.stepsAr
                    : data.stepsEn;


            var list = "";


            for (
                var i = 0;
                i < steps.length;
                i++
            ) {

                list +=
                    "<li>" +
                    escapeHtml(
                        steps[i]
                    ) +
                    "</li>";

            }


            var overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "erp-modal-overlay";


            overlay.setAttribute(
                "dir",
                isArabic ? "rtl" : "ltr"
            );


            overlay.innerHTML =

                '<div class="erp-modal-box">' +

                    '<button class="erp-modal-close" data-mfg-modal-close>✕</button>' +

                    '<div class="erp-modal-header">' +

                        '<span class="erp-modal-icon">🏭</span>' +

                        '<h3 class="erp-modal-title">' +

                            escapeHtml(
                                text(
                                    data.titleAr,
                                    data.titleEn
                                )
                            ) +

                        '</h3>' +

                    '</div>' +

                    '<p class="erp-modal-summary">' +

                        escapeHtml(
                            text(
                                data.summaryAr,
                                data.summaryEn
                            )
                        ) +

                    '</p>' +

                    '<div class="erp-modal-steps is-shown" data-mfg-steps>' +

                        '<ol class="erp-modal-steps-list">' +
                            list +
                        '</ol>' +
                    '</div>' +
                    '<div style="margin-top: 18px;">' +
                        '<button type="button" class="erp-quick-btn" data-modal-launch style="width: 100%; min-height: 42px;">' +
                            '<span class="erp-quick-label">' + text("فتح الشاشة", "Open Screen") + '</span>' +
                        '</button>' +
                    '</div>' +
                '</div>';


            root.appendChild(
                overlay
            );


            setTimeout(
                function () {

                    overlay.classList.add(
                        "is-visible"
                    );

                },
                10
            );


            var close =
                overlay.querySelector(
                    "[data-mfg-modal-close]"
                );


            if (close) {

                close.addEventListener(
                    "click",
                    function () {

                        overlay.remove();

                    }
                );

            }


            var launchBtn =
                overlay.querySelector(
                    "[data-modal-launch]"
                );

            if (launchBtn) {
                launchBtn.addEventListener(
                    "click",
                    function () {
                        overlay.remove();
                        navigate(name);
                    }
                );
            }

        }


        /* =================================================
           5. LOWER CARDS
        ================================================= */

        var cards = [

            {
                titleAr:
                    "قوائم المواد",

                titleEn:
                    "BOM",

                icon:
                    "🧩",

                links: [
                    "BOM"
                ]
            },


            {
                titleAr:
                    "التخطيط",

                titleEn:
                    "Production Planning",

                icon:
                    "📋",

                links: [
                    "Production Plan"
                ]
            },


            {
                titleAr:
                    "أوامر العمل",

                titleEn:
                    "Work Orders",

                icon:
                    "🏭",

                links: [
                    "Work Order"
                ]
            },


            {
                titleAr:
                    "بطاقات العمل",

                titleEn:
                    "Job Cards",

                icon:
                    "🛠",

                links: [
                    "Job Card",
                    "Operation"
                ]
            },


            {
                titleAr:
                    "المواد والمخزون",

                titleEn:
                    "Materials & Stock",

                icon:
                    "📦",

                links: [
                    "Stock Entry",
                    "Item",
                    "Warehouse"
                ]
            },


            {
                titleAr:
                    "محطات العمل",

                titleEn:
                    "Workstations",

                icon:
                    "⚙",

                links: [
                    "Workstation",
                    "Workstation Type"
                ]
            },


            {
                titleAr:
                    "الإعدادات",

                titleEn:
                    "Settings",

                icon:
                    "⚙",

                links: [
                    "Manufacturing Settings"
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
                    "BOM Stock Report",
                    "Production Analytics",
                    "Work Order Summary"
                ]
            }

        ];


        var translations = {

            "BOM":
                "قائمة المواد",

            "Production Plan":
                "خطة الإنتاج",

            "Work Order":
                "أمر العمل",

            "Job Card":
                "بطاقة العمل",

            "Operation":
                "العملية",

            "Stock Entry":
                "القيد المخزني",

            "Item":
                "المنتج",

            "Warehouse":
                "المستودع",

            "Workstation":
                "محطة العمل",

            "Workstation Type":
                "نوع محطة العمل",

            "Manufacturing Settings":
                "إعدادات التصنيع",

            "BOM Stock Report":
                "تقرير مخزون BOM",

            "Production Analytics":
                "تحليلات الإنتاج",

            "Work Order Summary":
                "ملخص أوامر العمل"

        };


        var reports = {

            "BOM Stock Report":
                true,

            "Production Analytics":
                true,

            "Work Order Summary":
                true

        };


        function translate(name) {

            if (!isArabic) {
                return name;
            }

            return (
                translations[name] ||
                name
            );

        }


        function navigate(name) {

            if (
                reports[name]
            ) {

                openReport(
                    name
                );

                return;
            }


            openList(
                name
            );

        }


        var cardsHtml = "";


        for (
            var c = 0;
            c < cards.length;
            c++
        ) {

            var card =
                cards[c];


            var linksHtml = "";


            for (
                var j = 0;
                j < card.links.length;
                j++
            ) {

                var name =
                    card.links[j];


                var details = "";


                /*
                 * بدون شرح للتقارير والإعدادات
                 */

                if (
                    !reports[name] &&
                    name !== "Manufacturing Settings" &&
                    descriptions[name]
                ) {

                    details =

                        '<button ' +
                        'type="button" ' +
                        'class="erp-info-link" ' +
                        'data-mfg-info="' +
                        escapeHtml(name) +
                        '">' +

                            text(
                                "تفاصيل",
                                "Details"
                            ) +

                        '</button>';

                }


                linksHtml +=

                    '<div class="erp-link-row">' +

                        '<button ' +
                        'type="button" ' +
                        'class="erp-link" ' +
                        'data-mfg-card="' +
                        c +
                        '" ' +
                        'data-mfg-link="' +
                        j +
                        '">' +

                            '<span class="erp-link-text">' +

                                escapeHtml(
                                    translate(name)
                                ) +

                            '</span>' +

                            '<span class="erp-link-arrow">' +

                                (
                                    isArabic
                                        ? "←"
                                        : "→"
                                ) +

                            '</span>' +

                        '</button>' +

                        details +

                    '</div>';

            }


            cardsHtml +=

                '<article class="erp-card is-open tone-' +
                (c % 5) +
                '" data-mfg-card-container>' +

                    '<button class="erp-card-heading" data-mfg-card-toggle>' +

                        '<span class="erp-icon">' +
                            card.icon +
                        '</span>' +

                        '<span class="erp-card-title">' +

                            escapeHtml(
                                text(
                                    card.titleAr,
                                    card.titleEn
                                )
                            ) +

                        '</span>' +

                        '<span class="erp-card-chevron">⌄</span>' +

                    '</button>' +

                    '<div class="erp-card-links">' +
                        linksHtml +
                    '</div>' +

                '</article>';

        }


        content.innerHTML =

            '<section class="erp-module-section">' +

                '<h2 class="erp-section-title">' +

                    text(
                        "البيانات الرئيسية والتقارير",
                        "Masters & Reports"
                    ) +

                '</h2>' +

                '<div class="erp-dashboard-grid">' +
                    cardsHtml +
                '</div>' +

            '</section>';


        content.addEventListener(
            "click",
            function (event) {


                var info =
                    event.target.closest(
                        "[data-mfg-info]"
                    );


                if (info) {

                    event.preventDefault();
                    event.stopPropagation();


                    showDetails(
                        info.getAttribute(
                            "data-mfg-info"
                        )
                    );

                    return;
                }


                var link =
                    event.target.closest(
                        "[data-mfg-link]"
                    );


                if (link) {

                    var cardIndex =
                        parseInt(
                            link.getAttribute(
                                "data-mfg-card"
                            ),
                            10
                        );


                    var linkIndex =
                        parseInt(
                            link.getAttribute(
                                "data-mfg-link"
                            ),
                            10
                        );


                    var name =
                        cards[
                            cardIndex
                        ].links[
                            linkIndex
                        ];


                    navigate(
                        name
                    );

                    return;
                }


                var toggle =
                    event.target.closest(
                        "[data-mfg-card-toggle]"
                    );


                if (!toggle) {
                    return;
                }


                var selected =
                    toggle.closest(
                        "[data-mfg-card-container]"
                    );


                if (!selected) {
                    return;
                }


                var shouldOpen =
                    !selected.classList.contains(
                        "is-open"
                    );


                var all =
                    content.querySelectorAll(
                        "[data-mfg-card-container]"
                    );


                for (
                    var x = 0;
                    x < all.length;
                    x++
                ) {

                    if (
                        all[x] !== selected
                    ) {

                        all[x]
                            .classList
                            .remove(
                                "is-open"
                            );

                    }

                }


                selected.classList.toggle(
                    "is-open",
                    shouldOpen
                );

            }
        );


        /* =================================================
           6. FOOTER
        ================================================= */

        if (footerEl) {

            footerEl.innerHTML =

                '<div class="erp-footer-inner">' +

                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">☎</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "الهاتف الموحد:",
                                "Phone:"
                            ) +

                        '</span>' +

                        '<a href="tel:${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || \"0115110455\"}" ' +
                        'class="erp-footer-link" ' +
                        'dir="ltr">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.phone) || "0115110455") +

                        '</a>' +

                    '</div>' +


                    '<span class="erp-footer-sep">|</span>' +


                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">✉</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "البريد الإلكتروني:",
                                "Email:"
                            ) +

                        '</span>' +

                        '<a href="mailto:${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || \"sales@mubtkir.com\"}" ' +
                        'class="erp-footer-link">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.email) || "sales@mubtkir.com") +

                        '</a>' +

                    '</div>' +


                    '<span class="erp-footer-sep">|</span>' +


                    '<div class="erp-footer-item">' +

                        '<span class="erp-footer-icon">◎</span>' +

                        '<span class="erp-footer-label">' +

                            text(
                                "الموقع:",
                                "Website:"
                            ) +

                        '</span>' +

                        '<a href="https://${(window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || \"www.mubtkir.com\"}" ' +
                        'class="erp-footer-link" ' +
                        'target="_blank" ' +
                        'rel="noopener">' +

                            ((window.frappe && frappe.boot && frappe.boot.theme_settings && frappe.boot.theme_settings.website) || "www.mubtkir.com") +

                        '</a>' +

                    '</div>' +

                '</div>';

        }


        console.log(
            "Manufacturing Dashboard Loaded Successfully"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    setTimeout(
        startDashboard,
        100
    );

})();