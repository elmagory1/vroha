frappe.provide('frappe.ui.misc');
frappe.ui.misc.about = function() {
	if(!frappe.ui.misc.about_dialog) {
		var d;
		frappe.db.get_doc('Website social links')

    	.then(doc => {
			d = new frappe.ui.Dialog({title: __(doc.welcome_text)});

			var fragment = doc.social_links.map(r => {
				if(r.show_desk == 1){
					return `<p><i class='fa ${r.font_desk} fa-fw'></i>
						<b>${__(r.title)}:</b> <a href='${r.url}'>${__(r.label)}</a>
						</p>`;
				}
			}).join('');

			$(d.body).html(fragment);

			frappe.ui.misc.about_dialog = d;
			frappe.ui.misc.about_dialog.show();

		});	

	}


}