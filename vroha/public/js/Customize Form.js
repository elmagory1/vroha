frappe.provide("frappe.customize_form");

frappe.ui.form.on("Customize Form", {

	onload: function(frm) {
		frm.disable_save();
		frm.set_query("doc_type", function() {
			return {
				translate_values: false,
				filters: [
					//["DocType", "issingle", "=", 0],
					["DocType", "custom", "=", 0],
					[
						"DocType",
						"name",
						"not in",
						['DocType', 'DocField', 'DocPerm', 'Role', 'Has Role',
		'Page', 'Module Def', 'Print Format', 'Report', 'Customize Form',
		'Customize Form Field', 'Property Setter', 'Custom Field', 'Client Script']
					],
					[
						"DocType",
						"restrict_to_domain",
						"in",
						frappe.boot.active_domains
					]
				]
			};
		});
    }
});