frappe.ui.form.on('User', {
    after_save: function(frm) {
        frappe.set_route("Form", "User", frm.doc.email);    
    }

});