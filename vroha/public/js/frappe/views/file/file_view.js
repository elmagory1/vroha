
frappe.views.FileView = class FileViewCustom extends frappe.views.FileView{  

	show() {
        if(!frappe.user.has_role("Customer","Packers User") || frappe.user.has_role("Administrator","System Manager")){
            super.show();
        }else{
            frappe.msgprint({
                message: __('This page you trying to visit is not available or else you do not have a permission to visit this page.'),
                title: __('Page Not Found'),
                indicator: 'red',
                primary_action: {
                    action: function() {
                        frappe.set_route('app');
                    }
                },
                primary_action_label: __('Home')
           });
        }
        

	}
	
};
