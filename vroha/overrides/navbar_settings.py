from frappe.core.doctype.navbar_settings.navbar_settings import NavbarSettings

class CustomNavbarSettings(NavbarSettings):
    def validate(self):
        self.my_custom_code()

    def my_custom_code(self):
        pass