// Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Theme Settings", {
	onload: function (frm) {
		if (!frm.doc.phone) frm.set_value("phone", "0115110455");
		if (!frm.doc.email) frm.set_value("email", "sales@mubtkir.com");
		if (!frm.doc.website) frm.set_value("website", "www.mubtkir.com");
	},
	refresh: function (frm) {
		if (!frm.doc.phone) frm.set_value("phone", "0115110455");
		if (!frm.doc.email) frm.set_value("email", "sales@mubtkir.com");
		if (!frm.doc.website) frm.set_value("website", "www.mubtkir.com");

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

		// Button to apply all 31 custom blocks to workspaces at once
		frm.add_custom_button(
			__("🚀 Apply All Blocks to Workspaces"),
			function () {
				frappe.confirm(
					__(
						"Are you sure you want to link and apply all 31 custom blocks automatically to their corresponding workspaces?"
					),
					function () {
						frappe.dom.freeze(__("Linking and updating all workspaces in the system..."));
						frappe.call({
							method: "nxt_theme.nxt_theme.doctype.theme_settings.theme_settings.apply_all_blocks_to_workspaces",
							callback: function (r) {
								frappe.dom.unfreeze();
								if (r && r.message) {
									frappe.msgprint({
										title: __("Success"),
										message: __(
											"Applied custom blocks successfully to {0} workspaces!<br><br><b>Updated Workspaces:</b><br>{1}",
											[r.message.count, r.message.updated.join("<br>")]
										),
										indicator: "green",
									});
								}
							},
							error: function (err) {
								frappe.dom.unfreeze();
								frappe.msgprint(__("Error applying blocks: ") + ((err && err.message) ? err.message : ""));
							},
						});
					}
				);
			}
		).addClass("btn-primary");
	},
	after_save: function (frm) {
		frappe.ui.toolbar.clear_cache();
	},
});
