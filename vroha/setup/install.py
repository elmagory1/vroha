# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt
#
#
from __future__ import print_function, unicode_literals

import frappe
from frappe import _

#def before_install():

def after_install():
    add_desc()
    import_dial_code()
    frappe.db.commit()


def add_desc():
    frappe.db.set_value('Homepage', 'Homepage' , 'description', 'This is an example website auto-generated from Vroha.')
    frappe.db.set_value('Website Settings', 'Website Settings' , 'app_name', 'Vroha')


def import_dial_code():
	from vroha.feeds.dial_code import get_all
	from frappe.utils import update_progress_bar

	data = get_all()

	for i, name in enumerate(data):
		update_progress_bar("Updating country dial_code info", i, len(data))
		country = frappe._dict(data[name])
		add_dial_code(name, country)

def add_dial_code(name, country):
    if frappe.db.exists("Country", name):
        frappe.db.set_value("Country", name, "dial_code", country.dial_code)
