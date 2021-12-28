import frappe
from frappe import _
from frappe.utils import cstr
from frappe.core.doctype.user.user import User
from frappe.desk.notifications import clear_notifications

STANDARD_USERS = ("Guest", "Administrator")

class CustomUser(User):
    __new_password = None
    
    def __setup__(self):
        # because it is handled separately
        self.flags.ignore_save_passwords = ['new_password']
    
    def autoname(self):
        if self.get("is_admin") or self.get("is_guest"):
            self.name = self.first_name
        else:
            self.name = self.email
    
    def make_email_mobile(self):
        if self.mobile_number:
            self.mobile_no= self.dial_code.strip()+self.mobile_number.strip()
            auto_email_domain = frappe.db.get_single_value("System Settings", "domain_for_auto_email") or "example.com"
        
            if self.is_new():
                if not self.email:
                    self.email = self.mobile_no.lstrip("+")+auto_email_domain
                    self.email = self.email.strip().lower()
                    self.auto_email=1 
                    return self.email 
            else:
                self.flags.change_name = False
                old_doc = self.get_doc_before_save()
                if old_doc.email == self.email:
                    if self.auto_email and (old_doc.mobile_no != self.mobile_no):
                        self.email = self.mobile_no.lstrip("+")+auto_email_domain
                        self.email = self.email.strip().lower()
                        self.flags.change_name = True
                        return self.email
                else:
                    self.auto_email=0
                    self.flags.change_name = True
                    return self.email
        else:
            self.email = self.email.strip().lower()
            return self.email
            
    def validate(self):
        self.make_email_mobile()
        super(CustomUser, self).validate()
        
                
    def send_login_mail(self, subject, template, add_args, now=None):
        from frappe.utils.user import get_user_fullname
        from frappe.utils import get_url,get_formatted_email
        from frappe.core.doctype.sms_settings.sms_settings import send_sms
        
        created_by = get_user_fullname(frappe.session['user'])
        if created_by == "Guest":
            created_by = "Administrator"
            
        args = {
			'first_name': self.first_name or self.last_name or "user",
			'user': self.name,
			'title': subject,
			'login_url': get_url(),
			'created_by': created_by
		}
        args.update(add_args)
        sender = frappe.session.user not in STANDARD_USERS and get_formatted_email(frappe.session.user) or None
        if self.auto_email:
            send_sms(
            receiver_list=[self.mobile_no],
            msg=frappe.render_template('roadslink/templates/sms/' + template + '.html', add_args),
            sender_name = sender
        )
        else:
            frappe.sendmail(recipients=self.email, sender=sender, subject=subject,
				template=template, args=args, header=[subject, "green"],
				delayed=(not now) if now!=None else self.flags.delay_emails, retry=3)
        
    def check_if_latest(self):
        """Checks if `modified` timestamp provided by document being updated is same as the
		`modified` timestamp in the database. If there is a different, the document has been
		updated in the database after the current copy was read. Will throw an error if
		timestamps don't match.

		Will also validate document transitions (Save > Submit > Cancel) calling
		`self.check_docstatus_transition`."""
        
        conflict = False
        self._action = "save"
        
        if not self.get('__islocal') and not self.meta.get('is_virtual'):
            if self.meta.issingle:
                modified = frappe.db.sql("""select value from tabSingles
					where doctype=%s and field='modified' for update""", self.doctype)
                
                modified = modified and modified[0][0]
                if modified and modified != cstr(self._original_modified):
                    conflict = True
            else:
                tmp = frappe.db.sql("""select modified, docstatus from `tab{0}`
					where name = %s for update""".format(self.doctype), self.name, as_dict=True)
                if not tmp:
                    frappe.throw(_("Record does not exist"))
                else:
                    tmp = tmp[0]
                    
                modified = cstr(tmp.modified)
                
                if modified and modified != cstr(self._original_modified):
                    conflict = True
                
                #super(User, self).check_docstatus_transition(tmp.docstatus)
                self.check_docstatus_transition(tmp.docstatus)
            
            if conflict:
                frappe.msgprint(_("Applying changes ..."),
					raise_exception=frappe.TimestampMismatchError)
                self.reload()
        else:
            #super(User, self).check_docstatus_transition(0)
            self.check_docstatus_transition(0)