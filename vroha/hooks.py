from . import __version__ as app_version

app_name = "vroha"
app_title = "Vroha"
app_publisher = "Vroha"
app_description = "Frappe as a LMS"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "desk@vroha.com"
app_license = "copyright"
app_logo_url = "/assets/vroha/images/logo.svg"




# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/vroha/css/vroha.css"
# app_include_js = "/assets/vroha/js/vroha.js"
app_include_js = "deskcustom.bundle.js"

# include js, css files in header of web template
#"/assets/vroha/css/custom.css",
web_include_css = []
web_include_js = ["/assets/vroha/js/vroha.js","controls.bundle.js", "dialog.bundle.js"]

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "vroha/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Website Slideshow" : "public/js/Website Slideshow.js",
	"Web Page Version": "public/js/frappe/utils/web_template.js",
	"Customize Form": "public/js/Customize Form.js",
	"Custom Field": "public/js/Custom Field.js",
	"User": "public/js/User.js"
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

website_context = {
	"favicon": 	"assets/vroha/images/favicon.svg",
	"splash_image": "assets/vroha/images/logo.svg"
}

update_website_context = 'vroha.overrides.update_context.website_context'


email_brand_image = "assets/vroha/images/logo.jpg"

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "home"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

website_redirects = [
    {"source": "/index", "target": "/home"}
]

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "vroha.utils.jinja_methods",
# 	"filters": "vroha.utils.jinja_filters"
# }

# Installation
# ------------

#before_install = "vroha.setup.install.before_install"
after_install = "vroha.setup.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "vroha.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
 	"Navbar Settings": "vroha.overrides.navbar_settings.CustomNavbarSettings",
	"User": "vroha.overrides.user.CustomUser",
	"Customer": "vroha.overrides.customer.CustomCustomer",
	"Supplier": "vroha.overrides.supplier.CustomSupplier",
	"Contact": "vroha.overrides.contact.CustomContact",
	"Address": "vroha.overrides.address.CustomAddress",
	"Item Group": "vroha.overrides.item_group.CustomItemGroup",
	"Web Page": "vroha.overrides.web_page.CustomWebPage",
	"Web Form": "vroha.overrides.web_form.CustomWebForm",
	"Customize Form": "vroha.overrides.customize_form.CustomCustomizeForm"
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"vroha.tasks.all"
# 	],
# 	"daily": [
# 		"vroha.tasks.daily"
# 	],
# 	"hourly": [
# 		"vroha.tasks.hourly"
# 	],
# 	"weekly": [
# 		"vroha.tasks.weekly"
# 	],
# 	"monthly": [
# 		"vroha.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "vroha.install.before_tests"

# Overriding Methods
# ------------------------------
#/Users/bagback/stuffs/projects/sunil/sunil/apps/frappe/frappe/core/doctype/user/user.py
override_whitelisted_methods = {
 	#"frappe.desk.doctype.event.event.get_events": "vroha.event.get_events"
    "erpnext.portal.product_configurator.utils.get_products_html_for_website": "vroha.overrides.whitelisted.get_products_html_for_website",
    "frappe.translate.get_all_languages": "vroha.overrides.whitelisted.get_all_languages",
    "frappe.custom.doctype.custom_field.custom_field.get_fields_label": "vroha.overrides.whitelisted.get_fields_label",
    "frappe.core.doctype.user.user.sign_up": "vroha.overrides.whitelisted.sign_up",
    "frappe.integrations.doctype.google_contacts.google_contacts.sync": "vroha.overrides.whitelisted.sync"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "vroha.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"vroha.auth.validate"
# ]

fixtures = [
    {
    	"doctype":"Custom Field",
       	"filters": {
            "name": ["in", ["Language-active","Customer-status","Customer-is_partner","Customer-partner_section","Item-minimum_quantity","Item-learning_product_type","Website Slideshow Item-label", "Item-free_to_enroll","Item-skills","Item-rating","Item-total_ratings", "Item-item_video","Brand-website_image", "Website Slideshow Item-video", "Website Slideshow Item-sticker_back", "Website Slideshow Item-sticker_text", "Item Group-items_slideshow", "Website Slideshow Item-tag", "Top Bar Item-class", "Web Page Block-add_section", "Web Page Block-row_div_con_sec_end", "Web Page Block-row_class", "Web Page Block-add_row", "Web Page Block-add_div", "Web Page-page_div_class", "Web Page Block-div_class", "Item Group-category_color","Item-category_color", "Top Bar Item-icon_class", "Item Group-category_icon","Web Page-language", "Country-dial_code", "User-dial_country", "User-dial_code", "User-mobile_number", "User-auto_email", "User-column_break_origin", "Selling Settings-supplier_need_verification", "Supplier-verified", "Selling Settings-learning_enabled", "Website Settings-color_theme", "System Settings-domain_for_auto_email"]]
		}
    },
    {
    	"doctype":"Property Setter",
       	"filters": {
            "name": ["in", ["Item-slideshow-hidden", "Item-slideshow-read_only", "Item Group-slideshow-hidden", "Item Group-slideshow-read_only", "Item-main-max_attachments", "Item-item_name-translatable", "User-mobile_no-read_only", "User-send_welcome_email-default", "User-email-mandatory_depends_on", "User-email-reqd", "User-mobile_no-mandatory_depends_on", "User-mobile_no-hidden", "Contact Phone-phone-reqd", "Contact Phone-phone-read_only", "Contact Phone-phone-unique", "Contact Phone-phone-in_list_view", "User-phone-unique", "User-phone-hidden", "User-phone-read_only", "Address-phone-options", "Address-phone-unique", "Address-phone-read_only", "Customer-customer_name-read_only_depends_on", "Customer-customer_name-fetch_from", "Customer-gender-fetch_from"]]
		}
    },

    {
        "doctype": "Portal Settings"
	},

    {
		"doctype": "Website Settings"
	},

    {
		"doctype": "Products Settings"
	},

    {
		"doctype": "Contact Us Settings"
	},

    {
		"doctype": "Website social links"
	},

    {
        "doctype": "Energy Point Settings"
	},


    {
    	"doctype": "Web Form",
    	"filters": {
    		"name": ["in", ["addresses", "issues"]]
    	}
    },

    {
		"doctype": "Web Page",
		"filters": {
			"name": ["in", ["homepage","about","contact", "members","psychometric","drms","english","management","traffic","training"]]
		}
	}
]
