frappe.ui.form.on('Custom Field', {
	setup: function(frm) {
		frm.set_query('dt', function(doc) {
			var filters = [
				//['DocType', 'issingle', '=', 0],
				['DocType', 'custom', '=', 0],
				['DocType', 'name', 'not in', ['DocType', 'DocField', 'DocPerm', 'Role', 'Has Role',
                'Page', 'Module Def', 'Print Format', 'Report', 'Customize Form',
                'Customize Form Field', 'Property Setter', 'Custom Field', 'Client Script']],
				['DocType', 'restrict_to_domain', 'in', frappe.boot.active_domains]
			];
			if(frappe.session.user!=="Administrator") {
				filters.push(['DocType', 'module', 'not in', ['Core', 'Custom']])
			}
			return {
				"filters": filters
			}
		});
	}
});