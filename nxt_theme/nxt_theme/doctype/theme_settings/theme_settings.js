// Copyright (c) 2024, MUBTKIR and contributors
// For license information, please see license.txt

frappe.ui.form.on("Theme Settings", {
	after_save: function (frm) {
		frappe.ui.toolbar.clear_cache();
	},
});
