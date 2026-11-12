import frappe

LUCIDE_WORKSPACE_ICONS = {
	"Home": "layout-grid",
	"Selling": "shopping-bag",
	"Stock": "package",
	"Buying": "shopping-cart",
	"Accounting": "wallet",
	"Payables": "arrow-left",
	"Receivables": "arrow-right",
	"Financial Reports": "file-text",
	"Accounting Reports": "file-text",
	"Assets": "building",
	"Manufacturing": "cog",
	"Quality": "shield-check",
	"Projects": "folder",
	"CRM": "pie-chart",
	"Support": "headphones",
	"HR": "user-check",
	"Leaves": "calendar-off",
	"Payroll": "banknote",
	"Salary Payout": "banknote",
	"Expense Claims": "receipt",
	"Recruitment": "users",
	"Performance": "pie-chart",
	"Employee Lifecycle": "users",
	"Shift & Attendance": "calendar-days",
	"Shift _ Attendance": "calendar-days",
	"Website": "globe",
	"Tools": "wrench",
	"Users": "users",
	"ERPNext Settings": "settings",
	"Settings": "settings",
	"ERPNext Integrations": "plug",
	"Integrations": "plug",
	"Build": "wrench",
	"ZATCA": "receipt",
	"Whatsapp": "message-circle",
	"Gas Operations": "flame",
	"Container Rental System": "truck",
	"Car Care": "car",
	"Party Bookings": "calendar-days",
	"Bank Reconciliation": "landmark",
	"Tax & Benefits": "calculator",
	"POSNext": "receipt",
	"Gold Management": "gem",
	"Healthcare": "heart-pulse",
}

def execute():
	# 1. تحديث رقم الهاتف الافتراضي في قاعدة البيانات مباشرة لـ Theme Settings
	try:
		if frappe.db.exists("DocType", "Theme Settings"):
			frappe.db.sql("""
				UPDATE `tabSingles`
				SET value = '+966126810486'
				WHERE doctype = 'Theme Settings'
				  AND field = 'phone'
				  AND (value = '0115110455' OR value IS NULL OR value = '')
			""")
	except Exception:
		pass

	# 2. تحديث أيقونات مساحات العمل في tabWorkspace إلى أيقونات Lucide الحديثة
	try:
		if frappe.db.exists("DocType", "Workspace"):
			from nxt_theme.events.sidebar import ARABIC_WORKSPACE_ICONS, DEFAULT_WORKSPACE_ICONS

			workspaces = frappe.get_all("Workspace", fields=["name", "title", "icon"])
			for ws in workspaces:
				name = ws.get("name") or ""
				title = ws.get("title") or ""
				curr_icon = (ws.get("icon") or "").strip()

				lucide_icon = (
					LUCIDE_WORKSPACE_ICONS.get(name)
					or ARABIC_WORKSPACE_ICONS.get(title)
					or ARABIC_WORKSPACE_ICONS.get(name)
					or DEFAULT_WORKSPACE_ICONS.get(name)
					or DEFAULT_WORKSPACE_ICONS.get(title)
				)

				is_legacy = (
					not curr_icon
					or curr_icon.startswith("fa")
					or " " in curr_icon
					or curr_icon in (
						"home", "selling", "stock", "buying", "accounting", "small-file", "file",
						"folder", "assets", "users", "tools", "settings"
					)
				)

				if lucide_icon and is_legacy:
					frappe.db.set_value("Workspace", name, "icon", lucide_icon, update_modified=False)

			frappe.db.commit()
			frappe.clear_cache()
	except Exception:
		pass

