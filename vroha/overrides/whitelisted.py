import frappe
from frappe import _
#from erpnext.portal.product_configurator.utils import get_products_for_website, set_item_group_filters
from roadslink.shopping_cart.product_query import CustomProductQuery
from frappe.desk.search import sanitize_searchfield
from frappe.utils import cstr,cint,escape_html
from frappe.website.utils import is_signup_disabled
from googleapiclient.errors import HttpError
from phonenumbers import parse as parse_phone, phonenumber
from frappe.integrations.doctype.google_contacts.google_contacts import get_google_contacts_object, get_indexed_value



@frappe.whitelist(allow_guest=True)
def get_all_languages(with_language_name=False):
    """Returns all language codes ar, ch etc"""

    def get_language_codes():
        return frappe.db.sql("""select name
        from `tabLanguage` where active=1""", as_dict=1)
    
    def get_all_language_with_name():
        return frappe.db.get_all('Language', ['language_code', 'language_name'], {"active": 1})
        
    if not frappe.db:
        frappe.connect()
            
    if with_language_name:
        #return frappe.cache().get_value('languages_with_name', get_all_language_with_name)
        return get_all_language_with_name()
    else:
        #return frappe.cache().get_value('languages', get_language_codes)
        return get_language_codes()
        
        
@frappe.whitelist(allow_guest=True)
def get_products_html_for_website(txt=None, field_filters=None, attribute_filters=None, start=0, item_group=None):
    search = cstr(txt)
    sanitize_searchfield(search)
    field_filters = frappe.parse_json(field_filters)
    attribute_filters = frappe.parse_json(attribute_filters)
    start = cint(start) 
    item_group = cstr(item_group)
    #print(field_filters.item_group)
    #set_item_group_filters(field_filters)
    
    
    engine = CustomProductQuery()
    items = engine.query(attribute_filters, field_filters, search, start, item_group=item_group)
 
    #items = get_products_for_website(field_filters, attribute_filters)
    html = ''.join(get_html_for_items(items))
        
    if not items:
        html = frappe.render_template('roadslink/www/all/not_found.html', {})
        
    return frappe._dict({
            "html":html,
            "total":len(items)
            })
    
def get_html_for_items(items):
	html = []
	for item in items:
		html.append(frappe.render_template('roadslink/www/all/item_row.html', {
			'item': item
		}))
	return html

@frappe.whitelist()
def get_fields_label(doctype=None):
    
    core_doctypes_list = ('DocType','DocField','DocPerm','DocType Action','DocType Link','Role','Has Role','Page','Module Def','Print Format','Report','Customize Form','Customize Form Field','Property Setter','Custom Field','Client Script')
    meta = frappe.get_meta(doctype)
    
    if doctype in core_doctypes_list:
        return frappe.msgprint(_("Custom Fields cannot be added to core DocTypes."))
    
    if meta.custom:
        return frappe.msgprint(_("Custom Fields can only be added to a standard DocType."))
    
    return [{"value": df.fieldname or "", "label": _(df.label or "")}
        for df in frappe.get_meta(doctype).get("fields")]
    
    
@frappe.whitelist(allow_guest=True)
def sign_up(email, dial_country, dial_code, mobile, full_name, redirect_to):
    auto_email=0
    if is_signup_disabled():
        frappe.throw(_('Sign Up is disabled'), title='Not Allowed')
        
    if email:
        user = frappe.db.get("User", {"email": email})
        auto_email = 0
    else:
        auto_email_domain = frappe.db.get_single_value("System Settings", "domain_for_auto_email") or "example.com"
        mobile_no= dial_code+mobile.strip()
        email = mobile_no.lstrip("+")+auto_email_domain
        user = frappe.db.get("User", {"email": email})
        auto_email = 1
        
    if user:
        if user.enabled:
            return 0, _("Already Registered")
        else:
            return 0, _("Registered but disabled")
    else:
        if frappe.db.get_creation_count('User', 60) > 300:
            frappe.respond_as_web_page(_('Temporarily Disabled'),
				_('Too many users signed up recently, so the registration is disabled. Please try back in an hour'),
				http_status_code=429)
        
        from frappe.utils import random_string
        user = frappe.get_doc({
			"doctype":"User",
			"email": email,
			"dial_country": dial_country,
			"dial_code": dial_code,
			"mobile_number": mobile,
			"first_name": escape_html(full_name),
			"enabled": 1,
			"auto_email": auto_email,
			"new_password": random_string(10),
			"user_type": "Website User"
		})
        user.flags.ignore_permissions = True
        user.flags.ignore_password_policy = True
        user.insert()
        
        default_role = frappe.db.get_value("Portal Settings", None, "default_role")
        if default_role:
            user.add_roles(default_role)
        
        if redirect_to:
            frappe.cache().hset('redirect_after_login', user.name, redirect_to)
            
        if user.flags.email_sent:
            return 1, _(" \n Please check your email/mobile for verification")
        else:
            return 2, _(" \n Please ask your administrator to verify your sign-up")
        
        
@frappe.whitelist()
def sync(g_contact=None):
	filters = {"enable": 1}

	if g_contact:
		filters.update({"name": g_contact})

	google_contacts = frappe.get_list("Google Contacts", filters=filters)

	for g in google_contacts:
		return sync_contacts_from_google_contacts(g.name)
        
        
def sync_contacts_from_google_contacts(g_contact):
	
    google_contacts, account = get_google_contacts_object(g_contact)

    if not account.pull_from_google_contacts:
        return

    results = []
    contacts_updated = 0

    sync_token = account.get_password(fieldname="next_sync_token", raise_exception=False) or None
    contacts = frappe._dict()

    while True:
        try:
            contacts = google_contacts.people().connections().list(resourceName='people/me', pageToken=contacts.get("nextPageToken"),
                syncToken=sync_token, pageSize=2000, requestSyncToken=True, personFields="names,emailAddresses,organizations,phoneNumbers").execute()

        except HttpError as err:
            frappe.throw(_("Google Contacts - Could not sync contacts from Google Contacts {0}, error code {1}.").format(account.name, err.resp.status))

        for contact in contacts.get("connections", []):
            results.append(contact)

        if not contacts.get("nextPageToken"):
            if contacts.get("nextSyncToken"):
                frappe.db.set_value("Google Contacts", account.name, "next_sync_token", contacts.get("nextSyncToken"))
                frappe.db.commit()
            break

    frappe.db.set_value("Google Contacts", account.name, "last_sync_on", frappe.utils.now_datetime())

    for idx, connection in enumerate(results):
        frappe.publish_realtime('import_google_contacts', dict(progress=idx+1, total=len(results)), user=frappe.session.user)

        for name in connection.get("names"):
            if name.get("metadata").get("primary"):
                contacts_updated += 1
                contact = frappe.get_doc({
                    "doctype": "Contact",
                    "first_name": name.get("givenName") or "",
                    "middle_name": name.get("middleName") or "",
                    "last_name": name.get("familyName") or "",
                    "designation": get_indexed_value(connection.get("organizations"), 0, "title"),
                    "pulled_from_google_contacts": 1,
                    "google_contacts": account.name,
                    "company_name": get_indexed_value(connection.get("organizations"), 0, "name")
                })

                for email in connection.get("emailAddresses", []):
                    contact.add_email(email_id=email.get("value"), is_primary=1 if email.get("metadata").get("primary") else 0)

                for phone in connection.get("phoneNumbers", []):
                    dial_code = "+"+cstr(parse_phone(phone.get("value")).country_code)
                    country = frappe.get_value("Country",{"dial_code": dial_code}, "name")
                    phone_number = cstr(parse_phone(phone.get("value")).national_number).replace(" ", "")
                    
                    contact.add_phone(dial_country=country,phone=phone_number, is_primary_phone=1 if phone.get("metadata").get("primary") else 0)

                contact.insert(ignore_permissions=True)

    return _("{0} Google Contacts synced.").format(contacts_updated) if contacts_updated > 0 \
        else _("No new Google Contacts synced.")
    