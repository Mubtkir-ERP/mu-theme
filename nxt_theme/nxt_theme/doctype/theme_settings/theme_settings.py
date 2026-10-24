# Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
# For license information, please see license.txt

import json
import os
import frappe
from frappe import _
from frappe.model.document import Document


DEFAULT_PHONE = "0115110455"
DEFAULT_EMAIL = "sales@mubtkir.com"
DEFAULT_WEBSITE = "www.mubtkir.com"


class ThemeSettings(Document):
	def validate(self):
		if frappe.session.user != "Administrator":
			frappe.throw(_("Only Administrator can modify Theme Settings"), frappe.PermissionError)

		if not self.phone:
			self.phone = DEFAULT_PHONE
		if not self.email:
			self.email = DEFAULT_EMAIL
		if not self.website:
			self.website = DEFAULT_WEBSITE


def boot_session(bootinfo):
	try:
		doc = frappe.get_cached_doc("Theme Settings")
		bootinfo.theme_settings = {
			"phone": doc.phone or DEFAULT_PHONE,
			"email": doc.email or DEFAULT_EMAIL,
			"website": doc.website or DEFAULT_WEBSITE,
			"skin": doc.skin or "razor",
		}
	except Exception:
		bootinfo.theme_settings = {
			"phone": DEFAULT_PHONE,
			"email": DEFAULT_EMAIL,
			"website": DEFAULT_WEBSITE,
			"skin": "razor",
		}


def setup_theme_defaults():
	try:
		if not frappe.db.exists("DocType", "Theme Settings"):
			return
		doc = frappe.get_doc("Theme Settings")
		changed = False
		if not doc.phone:
			doc.phone = DEFAULT_PHONE
			changed = True
		if not doc.email:
			doc.email = DEFAULT_EMAIL
			changed = True
		if not doc.website:
			doc.website = DEFAULT_WEBSITE
			changed = True
		if changed:
			doc.flags.ignore_permissions = True
			doc.save()
			frappe.db.commit()
	except Exception as e:
		frappe.log_error(f"Error setting Theme Settings defaults: {str(e)}")


def after_migrate():
	setup_theme_defaults()
	try:
		apply_all_blocks_to_workspaces(auto_run=True)
	except Exception as e:
		frappe.log_error(f"Error in after_migrate theme blocks sync: {str(e)}")


@frappe.whitelist()
def apply_all_blocks_to_workspaces(auto_run=False):
	if not auto_run and frappe.session.user != "Administrator":
		frappe.throw(_("Only Administrator can perform this action"), frappe.PermissionError)

	blocks_json_path = os.path.join(
		frappe.get_app_path("nxt_theme"), "public", "blocks", "all_blocks.json"
	)
	if not os.path.exists(blocks_json_path):
		blocks_json_path = os.path.join(
			frappe.get_app_path("nxt_theme"), "blocks", "all_blocks.json"
		)

	if not os.path.exists(blocks_json_path):
		return {"error": "all_blocks.json not found", "count": 0}

	with open(blocks_json_path, "r", encoding="utf-8") as f:
		blocks_data = json.load(f)

	created_or_updated_blocks = []
	updated_workspaces = []
	skipped_workspaces = []

	has_chb_doctype = frappe.db.exists("DocType", "Custom HTML Block")

	for item in blocks_data:
		block_name = item.get("custom_block_name") or item.get("name") or item.get("label")
		if not block_name:
			continue

		# 1. إنشاء أو تحديث مستند Custom HTML Block
		if has_chb_doctype:
			try:
				if not frappe.db.exists("Custom HTML Block", block_name):
					chb = frappe.new_doc("Custom HTML Block")
					chb.custom_block_name = block_name
					chb.html = item.get("html", "")
					chb.style = item.get("style", "")
					chb.script = item.get("script", "")
					chb.flags.ignore_permissions = True
					chb.insert()
				else:
					chb = frappe.get_doc("Custom HTML Block", block_name)
					chb.html = item.get("html", "")
					chb.style = item.get("style", "")
					chb.script = item.get("script", "")
					chb.flags.ignore_permissions = True
					chb.save()
				created_or_updated_blocks.append(block_name)
			except Exception as e:
				frappe.log_error(f"Error creating Custom HTML Block {block_name}: {str(e)}")

		# 2. ربط الكتلة بمساحة العمل المقابلة
		candidates = [
			block_name,
			block_name.capitalize(),
			block_name.lower(),
			block_name.replace(" ", "-"),
			block_name.replace(" _ ", " & "),
			block_name.replace(" _ ", " and "),
		]
		if block_name.lower() == "selling":
			candidates.extend(["Selling", "Sales", "sales"])
		elif block_name.lower() == "stock":
			candidates.extend(["Stock", "Inventory"])
		elif block_name.lower() == "hr":
			candidates.extend(["HR", "Human Resources", "hr"])
		elif block_name == "Shift _ Attendance":
			candidates.extend(["Shift & Attendance", "Shift and Attendance", "Attendance"])
		elif block_name == "ERPNext Settings":
			candidates.extend(["Settings", "ERPNext Settings"])
		elif block_name == "ERPNext Integrations":
			candidates.extend(["Integrations", "ERPNext Integrations"])
		elif block_name == "Financial Reports":
			candidates.extend(["Accounting Reports", "Financial Reports"])

		ws_name = None
		for c in candidates:
			if frappe.db.exists("Workspace", c):
				ws_name = c
				break

		if not ws_name:
			skipped_workspaces.append(block_name)
			continue

		try:
			ws = frappe.get_doc("Workspace", ws_name)
			content_data = [
				{
					"type": "custom_block",
					"data": {
						"custom_block_name": block_name,
						"col": 12,
					},
				}
			]
			ws.content = json.dumps(content_data)
			ws.set("custom_blocks", [{"custom_block_name": block_name}])
			ws.flags.ignore_permissions = True
			ws.save()
			updated_workspaces.append(f"{ws_name} ➔ {block_name}")
		except Exception as e:
			frappe.log_error(f"Error linking workspace {ws_name} to block {block_name}: {str(e)}")

	frappe.db.commit()
	frappe.clear_cache()

	return {
		"blocks_synced": len(created_or_updated_blocks),
		"updated": updated_workspaces,
		"skipped": skipped_workspaces,
		"count": len(updated_workspaces),
	}
