# Copyright (c) 2024, NexTash (SMC-PVT) Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class ThemeSettings(Document):
	def validate(self):
		if frappe.session.user != "Administrator":
			frappe.throw(_("Only Administrator can modify Theme Settings"), frappe.PermissionError)
