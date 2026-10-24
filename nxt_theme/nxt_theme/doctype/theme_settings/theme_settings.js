// Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Theme Settings", {
	refresh: function (frm) {
		const isAr = (frappe.boot && (frappe.boot.lang === "ar" || frappe.boot.language === "ar")) ||
					 document.documentElement.dir === "rtl" ||
					 document.documentElement.lang === "ar";

		const skin_options = isAr
			? [
				{ value: "razor", label: "عصري أنيق (Razor)" },
				{ value: "echo", label: "كلاسيكي فاتح (Echo)" },
				{ value: "exort", label: "تدرج فخم (Exort)" },
				{ value: "viper", label: "رمادي هادئ (Viper)" },
				{ value: "shuriken", label: "شريط مدمج (Shuriken)" },
			  ]
			: [
				{ value: "razor", label: "Modern Dark (Razor)" },
				{ value: "echo", label: "Classic Light (Echo)" },
				{ value: "exort", label: "Emerald Gradient (Exort)" },
				{ value: "viper", label: "Minimal Slate (Viper)" },
				{ value: "shuriken", label: "Compact Sidebar (Shuriken)" },
			  ];

		frm.set_df_property("skin", "options", skin_options);
	},
	after_save: function (frm) {
		frappe.ui.toolbar.clear_cache();
	},
});
