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
			for ws_name, lucide_icon in LUCIDE_WORKSPACE_ICONS.items():
				target = ws_name
				if not frappe.db.exists("Workspace", target):
					alt = ws_name.replace("&", "and")
					if frappe.db.exists("Workspace", alt):
						target = alt
					elif frappe.db.exists("Workspace", ws_name.lower()):
						target = ws_name.lower()
					else:
						# بحث بالعنوان العربي
						target = frappe.db.get_value("Workspace", {"title": ws_name}, "name")
						if not target:
							continue

				curr_icon = frappe.db.get_value("Workspace", target, "icon") or ""
				# تحديث إذا كانت فارغة أو اسم قديم
				if not curr_icon or curr_icon.startswith("fal fa-") or curr_icon.startswith("fa fa-") or curr_icon in (
					"home", "selling", "stock", "buying", "accounting", "small-file", "file", "folder", "assets", "users"
				):
					frappe.db.set_value("Workspace", target, "icon", lucide_icon, update_modified=True)

			frappe.db.commit()
			frappe.clear_cache()
	except Exception:
		pass

