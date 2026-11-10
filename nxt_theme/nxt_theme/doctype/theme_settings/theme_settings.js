// Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Theme Settings", {
	onload: function (frm) {
		if (!frm.doc.phone) frm.set_value("phone", "+966126810486");
		if (!frm.doc.email) frm.set_value("email", "sales@mubtkir.com");
		if (!frm.doc.website) frm.set_value("website", "www.mubtkir.com");

		// Sync all custom HTML blocks into database so they always exist and appear in dropdown
		frappe.call({
			method: "nxt_theme.nxt_theme.doctype.theme_settings.theme_settings.sync_custom_html_blocks",
		});
	},
	refresh: function (frm) {
		if (!frm.doc.phone) frm.set_value("phone", "+966126810486");
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

		// Button to load and persist default workspace block mappings into table
		const loadDefaultsLabel = isAr ? "📥 ملء وحفظ التوزيع الافتراضي" : "📥 Load Default Mappings";
		frm.add_custom_button(loadDefaultsLabel, function () {
			frappe.call({
				method: "nxt_theme.nxt_theme.doctype.theme_settings.theme_settings.reload_default_workspace_mappings",
				freeze: true,
				freeze_message: isAr ? "جاري ملء وحفظ التوزيع الافتراضي للكتل..." : "Populating and saving default mappings...",
				callback: function (r) {
					if (!r.exc) {
						frm.reload_doc();
						frappe.show_alert({
							message: isAr
								? "تم ملء وحفظ جدول التوزيع بنجاح في قاعدة البيانات!"
								: "Default workspace mappings saved successfully!",
							indicator: "green",
						});
					}
				},
			});
		});

		// Button to apply all custom blocks to workspaces at once
		const btnLabel = isAr ? "🚀 تطبيق الكتل على مساحات العمل" : "🚀 Apply All Blocks to Workspaces";
		const confirmMsg = isAr
			? "هل أنت متأكد من رغبتك في تطبيق الكتل المحددة في الجدول على مساحات العمل في النظام؟"
			: "Are you sure you want to apply the mapped custom blocks to your workspaces?";
		const freezeMsg = isAr
			? "جاري ربط وتحديث كافة مساحات العمل في النظام..."
			: "Linking and updating all workspaces in the system...";
		const successTitle = isAr ? "تم بنجاح" : "Success";
		const errorPrefix = isAr ? "حدث خطأ أثناء تطبيق الكتل: " : "Error applying blocks: ";

		frm.add_custom_button(
			btnLabel,
			function () {
				const executeApply = function () {
					frappe.confirm(
						confirmMsg,
						function () {
							frappe.dom.freeze(freezeMsg);
							frappe.call({
								method: "nxt_theme.nxt_theme.doctype.theme_settings.theme_settings.apply_all_blocks_to_workspaces",
								callback: function (r) {
									frappe.dom.unfreeze();
									if (r && r.message) {
										const msgTemplate = isAr
											? "تم تطبيق الكتل المخصصة بنجاح على {0} مساحة عمل!<br><br><b>مساحات العمل المحدثة:</b><br>{1}"
											: "Applied custom blocks successfully to {0} workspaces!<br><br><b>Updated Workspaces:</b><br>{1}";
										frappe.msgprint({
											title: successTitle,
											message: __(
												msgTemplate,
												[r.message.count, r.message.updated.join("<br>")]
											),
											indicator: "green",
										});
										frappe.ui.toolbar.clear_cache();
									}
								},
								error: function (err) {
									frappe.dom.unfreeze();
									frappe.msgprint(errorPrefix + ((err && err.message) ? err.message : ""));
								},
							});
						}
					);
				};

				// إذا كانت هناك تعديلات غير محفوظة في الجدول، حفظها أولاً قبل التطبيق
				if (frm.is_dirty()) {
					frm.save().then(function () {
						executeApply();
					});
				} else {
					executeApply();
				}
			}
		).addClass("btn-primary");
	},
	after_save: function (frm) {
		frappe.ui.toolbar.clear_cache();
	},
});