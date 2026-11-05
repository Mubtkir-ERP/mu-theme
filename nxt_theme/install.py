import frappe

ROLE_NAME = "Company Switcher Manager"


# ---------------------------------------------------------------------------
# دور مبدّل الشركات
# ---------------------------------------------------------------------------
def ensure_role():
	"""إنشاء دور مبدّل الشركات إن لم يكن موجوداً (يُستدعى عند التثبيت وقبل الترحيل)."""
	if not frappe.db.exists("Role", ROLE_NAME):
		frappe.get_doc(
			{
				"doctype": "Role",
				"role_name": ROLE_NAME,
				"desk_access": 1,
			}
		).insert(ignore_permissions=True)

	# Auto-install mu_booking and mu_car_care if present in bench apps but not yet installed on site
	try:
		all_apps = frappe.get_all_apps(with_internal_apps=False)
		installed_apps = frappe.get_installed_apps()
		if "mu_booking" in all_apps and "mu_booking" not in installed_apps:
			from frappe.installer import install_app

			install_app("mu_booking", verbose=True, set_as_patched=True)
			frappe.db.commit()
		if "mu_car_care" in all_apps and "mu_car_care" not in installed_apps:
			from frappe.installer import install_app

			install_app("mu_car_care", verbose=True, set_as_patched=True)
			frappe.db.commit()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "nxt_theme: Auto-install apps")


def after_install():
	ensure_role()


# ملاحظة: كتل Custom HTML Block تُشحن عبر آلية fixtures (راجع hooks.py + مجلد fixtures)
# بدل إنشائها برمجياً، لضمان نقل html/script/style بدقة تامة دون أي فقد أو تهريب.
