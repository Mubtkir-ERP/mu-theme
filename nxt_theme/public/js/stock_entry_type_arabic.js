(() => {
    "use strict";

    const translations = {
        "Disassemble": "تفكيك منتج",
        "Manufacture": "تصنيع",
        "Material Consumption for Manufacture": "استهلاك مواد للتصنيع",
        "Material Issue": "صرف مواد",
        "Material Receipt": "استلام مواد",
        "Material Transfer": "نقل مواد",
        "Material Transfer for Manufacture": "نقل مواد للتصنيع",
        "Repack": "إعادة تعبئة",
        "Send to Subcontractor": "إرسال إلى مقاول فرعي"
    };

    function isArabic() {
        return (
            frappe &&
            frappe.boot &&
            String(frappe.boot.lang || "")
                .toLowerCase()
                .startsWith("ar")
        );
    }

    function patchSearchLink() {
        if (
            !window.frappe ||
            !frappe.call ||
            frappe.call.__mubtkir_stock_entry_patch
        ) {
            return;
        }

        const originalCall = frappe.call;

        frappe.call = function () {
            let opts = arguments[0];

            if (
                opts &&
                typeof opts === "object" &&
                opts.method === "frappe.desk.search.search_link"
            ) {
                const originalCallback = opts.callback;

                opts = {
                    ...opts,

                    callback: function (r) {

                        try {
                            const doctype =
                                opts.args &&
                                opts.args.doctype;

                            if (
                                isArabic() &&
                                doctype === "Stock Entry Type" &&
                                r &&
                                Array.isArray(r.message)
                            ) {
                                r.message =
                                    r.message.map(item => {

                                        if (
                                            item &&
                                            translations[item.value]
                                        ) {
                                            return {
                                                ...item,

                                                // القيمة الحقيقية تبقى إنجليزي
                                                value: item.value,

                                                // المعروض للمستخدم عربي
                                                label:
                                                    translations[
                                                        item.value
                                                    ]
                                            };
                                        }

                                        return item;
                                    });
                            }

                        } catch (e) {
                            console.error(
                                "[MUBTKIR] Stock Entry Type translation error",
                                e
                            );
                        }

                        if (originalCallback) {
                            return originalCallback(r);
                        }
                    }
                };

                return originalCall.call(
                    this,
                    opts
                );
            }

            return originalCall.apply(
                this,
                arguments
            );
        };

        frappe.call.__mubtkir_stock_entry_patch =
            true;

        console.log(
            "[MUBTKIR] Stock Entry Type Arabic patch loaded"
        );
    }

    function init() {

        if (
            !window.frappe ||
            !frappe.call
        ) {
            setTimeout(init, 300);
            return;
        }

        patchSearchLink();
    }

    init();

})();
