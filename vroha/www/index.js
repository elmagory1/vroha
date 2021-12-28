$(() => {
	class ProductListing {
		constructor() {
			this.bind_filters();
			this.restore_filters_state();
		}

		bind_filters() {
			this.field_filters = {};
			this.attribute_filters = {};
			this.txt;
			this.start = 0;
			this.nextclass;

			$('.btn-prev, .btn-next').on('click', (e) => {
				const $btn = $(e.currentTarget);
				if($btn[0].classList.contains('btn-next')){
					this.nextclass = "btn-next"
				}else{
					this.nextclass = "btn-prev"
				}
				this.make_filters();			
			});

			$('.product-filter').on('change', frappe.utils.debounce((e) => {
				const $checkbox = $(e.currentTarget);
				const is_checked = $checkbox.is(':checked');

				if ($checkbox.is('.attribute-filter')) {
					const {
						attributeName: attribute_name,
						attributeValue: attribute_value
					} = $checkbox.data();

					if (is_checked) {
						this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name] || [];
						this.attribute_filters[attribute_name].push(attribute_value);
					} else {
						this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name] || [];
						this.attribute_filters[attribute_name] = this.attribute_filters[attribute_name].filter(v => v !== attribute_value);
					}

					if (this.attribute_filters[attribute_name].length === 0) {
						delete this.attribute_filters[attribute_name];
					}
				} else if ($checkbox.is('.field-filter')) {
					const {
						filterName: filter_name,
						filterValue: filter_value
					} = $checkbox.data();

					if (is_checked) {
						this.field_filters[filter_name] = this.field_filters[filter_name] || [];
						this.field_filters[filter_name].push(filter_value);
					} else {
						this.field_filters[filter_name] = this.field_filters[filter_name] || [];
						this.field_filters[filter_name] = this.field_filters[filter_name].filter(v => v !== filter_value);
					}

					if (this.field_filters[filter_name].length === 0) {
						delete this.field_filters[filter_name];
					}
				}

				if(frappe.utils.get_query_params().txt){
					this.txt = frappe.utils.get_query_params().txt.replace(/[-[/\]{}()*+?.,\\^$|#\s]/g, '\\$&');
				}

				this.make_filters();
			

			}, 1000));
		}

		make_filters() {
			if(this.nextclass){
				if(this.nextclass ==  "btn-next"){
					this.start = frappe.utils.get_query_params().start || parseInt(this.start)
					this.start= this.start + parseInt($("#page_items").val())
				}else{
					this.start = frappe.utils.get_query_params().start || parseInt(this.start)
					this.start= this.start - parseInt($("#page_items").val())
				}
			}
			const query_string = get_query_string({
				txt: if_key_exists(this.txt),
				field_filters: JSON.stringify(if_key_exists(this.field_filters)),
				attribute_filters: JSON.stringify(if_key_exists(this.attribute_filters)),
				start: this.start
			});
			
		
			if (query_string){
				window.history.pushState('filters', '', `${location.pathname}?` + query_string);
				$('.page_content input').prop('disabled', true);
				this.get_items_with_filters()
					.then(result => {
						$('.products-list').html(result.html);
						$('.owl-carousel').addClass("d-none");
						$("#page_items").attr("data-real-length", result.total)

						if(this.nextclass){
							$('.btn-prev').removeClass("d-none")	
						}
						if($("#page_items").attr('data-real-length') >= $("#page_items").val()){
							$('.btn-next').removeClass("d-none")
			
						}else{
							$('.btn-next').addClass("d-none")
						}
						

					})
					.then(data => {
						$('.page_content input').prop('disabled', false);
						return data;
					})
					.catch(() => {
						$('.page_content input').prop('disabled', false);
					});
			}else{
				window.location.href = location.pathname;
			}

		}

		restore_filters_state() {
			const filters = frappe.utils.get_query_params();
			let {txt,field_filters, attribute_filters,start} = filters;
			let set_link_mydropdown = location.pathname.slice(1)
			if (set_link_mydropdown != "all"){
				$('.searchselect').val()
			}

			if (txt) {
				this.txt = txt.replace(/[-[/\]{}()*+?.,\\^$|#\s]/g, '\\$&');
			}

			if (field_filters) {
				field_filters = JSON.parse(field_filters);
				for (let fieldname in field_filters) {
					const values = field_filters[fieldname];
					const selector = values.map(value => {
						return `input[data-filter-name="${fieldname}"][data-filter-value="${value}"]`;
					}).join(',');
					$(selector).prop('checked', true);
				}
				this.field_filters = field_filters;
			}
			if (attribute_filters) {
				attribute_filters = JSON.parse(attribute_filters);
				for (let attribute in attribute_filters) {
					const values = attribute_filters[attribute];
					const selector = values.map(value => {
						return `input[data-attribute-name="${attribute}"][data-attribute-value="${value}"]`;
					}).join(',');
					$(selector).prop('checked', true);
				}
				this.attribute_filters = attribute_filters;
			}
			if (start) {
				this.start = start;
			}
		}

		get_items_with_filters() {
			const { txt, attribute_filters, field_filters,start} = this;
			const args = {
				txt:if_key_exists(txt),
				field_filters: if_key_exists(field_filters),
				attribute_filters: if_key_exists(attribute_filters),
				start:start,
				item_group: $("#parent_group").val()
			};

			const item_group = $(".item-group-content").data('item-group');
			//if (item_group) {
				//Object.assign(field_filters, { item_group });
			//}
			return new Promise((resolve, reject) => {
				frappe.call('erpnext.portal.product_configurator.utils.get_products_html_for_website', args)
					.then(r => {
						if (r.exc) reject(r.exc);
						else {
							resolve(r.message);
						}
					})
					.fail(reject);
			});
		}
	}

	new ProductListing();

	function get_query_string(object) {
		const url = new URLSearchParams();
		for (let key in object) {
			const value = object[key];
			if (value) {
				url.append(key, value);
			}
		}
		return url.toString();
	}

	function if_key_exists(obj) {
		let exists = false;
		for (let key in obj) {
			if (obj.hasOwnProperty(key) && obj[key]) {
				exists = true;
				break;
			}
		}
		return exists ? obj : undefined;
	}
});

