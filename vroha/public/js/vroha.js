// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt
/* eslint-disable no-console */

//import hljs from 'frappe/website/js/syntax_highlight';

import hljs from 'roadslink/website/js/syntax_highlight';

frappe.provide("website");
frappe.provide("frappe.awesome_bar_path");
window.cur_frm = null;

$.extend(frappe, {
	boot: {
		lang: 'en'
	},
	_assets_loaded: [],
	require: async function(links, callback) {
		if (typeof (links) === 'string') {
			links = [links];
		}
		for (let link of links) {
			await this.add_asset_to_head(link);
		}
		callback && callback();
	},
	add_asset_to_head(link) {
		return new Promise(resolve => {
			if (frappe._assets_loaded.includes(link)) return resolve();
			let el;
			if(link.split('.').pop() === 'js') {
				el = document.createElement('script');
				el.type = 'text/javascript';
				el.src = link;
			} else {
				el = document.createElement('link');
				el.type = 'text/css';
				el.rel = 'stylesheet';
				el.href = link;
			}
			document.getElementsByTagName('head')[0].appendChild(el);
			el.onload = () => {
				frappe._assets_loaded.push(link);
				resolve();
			};
		});
	},
	hide_message: function() {
		$('.message-overlay').remove();
	},
	xcall: function(method, params) {
		return new Promise((resolve, reject) => {
			frappe.call({
				method: method,
				args: params,
				callback: (r) => {
					resolve(r.message);
				},
				error: (r) => {
					reject(r.message);
				}
			});
		});
	},
	call: function(opts) {
		// opts = {"method": "PYTHON MODULE STRING", "args": {}, "callback": function(r) {}}
		if (typeof arguments[0]==='string') {
			opts = {
				method: arguments[0],
				args: arguments[1],
				callback: arguments[2]
			}
		}

		frappe.prepare_call(opts);
		if(opts.freeze) {
			frappe.freeze();
		}
		return $.ajax({
			type: opts.type || "POST",
			url: "/",
			data: opts.args,
			dataType: "json",
			headers: { "X-Frappe-CSRF-Token": frappe.csrf_token, "X-Frappe-CMD": (opts.args && opts.args.cmd  || '') || '' },
			statusCode: opts.statusCode || {
				404: function() {
					frappe.msgprint(__("Not found"));
				},
				403: function() {
					frappe.msgprint(__("Not permitted"));
				},
				200: function(data) {
					if(opts.callback)
						opts.callback(data);
					if(opts.success)
						opts.success(data);
				}
			}
		}).always(function(data) {
			if(opts.freeze) {
				frappe.unfreeze();
			}

			// executed before statusCode functions
			if(data.responseText) {
				try {
					data = JSON.parse(data.responseText);
				} catch (e) {
					data = {};
				}
			}
			frappe.process_response(opts, data);
		});
	},
	prepare_call: function(opts) {
		if(opts.btn) {
			$(opts.btn).prop("disabled", true);
		}

		if(opts.msg) {
			$(opts.msg).toggle(false);
		}

		if(!opts.args) opts.args = {};

		// method
		if(opts.method) {
			opts.args.cmd = opts.method;
		}

		$.each(opts.args, function(key, val) {
			if (typeof val != "string" && val !== null) {
				opts.args[key] = JSON.stringify(val);
			}
		});

		if(!opts.no_spinner) {
			//NProgress.start();
		}
	},
	process_response: function(opts, data) {
		//if(!opts.no_spinner) NProgress.done();

		if(opts.btn) {
			$(opts.btn).prop("disabled", false);
		}

		if (data._server_messages) {
			var server_messages = JSON.parse(data._server_messages || '[]');
			server_messages.map((msg) => {
				// temp fix for messages sent as dict
				try {
					return JSON.parse(msg);
				} catch (e) {
					return msg;
				}
			}).join('<br>');

			if(opts.error_msg) {
				$(opts.error_msg).html(server_messages).toggle(true);
			} else {
				frappe.msgprint(server_messages);
			}
		}

		if(data.exc) {
			// if(opts.btn) {
			// 	$(opts.btn).addClass($(opts.btn).is('button') || $(opts.btn).hasClass('btn') ? "btn-danger" : "text-danger");
			// 	setTimeout(function() { $(opts.btn).removeClass("btn-danger text-danger"); }, 1000);
			// }
			try {
				var err = JSON.parse(data.exc);
				if($.isArray(err)) {
					err = err.join("\n");
				}
				console.error ? console.error(err) : console.log(err);
			} catch(e) {
				console.log(data.exc);
			}

		} else{
			// if(opts.btn) {
			// 	$(opts.btn).addClass($(opts.btn).is('button') || $(opts.btn).hasClass('btn') ? "btn-success" : "text-success");
			// 	setTimeout(function() { $(opts.btn).removeClass("btn-success text-success"); }, 1000);
			// }
		}
		if(opts.msg && data.message) {
			$(opts.msg).html(data.message).toggle(true);
		}

		if(opts.always) {
			opts.always(data);
		}
	},
	show_message: function(text, icon) {
		if(!icon) icon="fa fa-refresh fa-spin";
		frappe.hide_message();
		$('<div class="message-overlay"></div>')
			.html('<div class="content"><i class="'+icon+' text-muted"></i><br>'
				+text+'</div>').appendTo(document.body);
	},
	send_message: function(opts, btn) {
		return frappe.call({
			type: "POST",
			method: "frappe.www.contact.send_message",
			btn: btn,
			args: opts,
			callback: opts.callback
		});
	},
	has_permission: function(doctype, docname, perm_type, callback) {
		return frappe.call({
			type: "GET",
			method: "frappe.client.has_permission",
			no_spinner: true,
			args: {doctype: doctype, docname: docname, perm_type: perm_type},
			callback: function(r) {
				if(!r.exc && r.message.has_permission) {
					if(callback) {
						return callback(r);
					}
				}
			}
		});
	},
	render_user: function() {
		$('.user-image-wrapper').html(frappe.avatar("w30"));
		$('.user-image-wrapperme').html(frappe.avatar("w65"));
		
		if (frappe.is_user_logged_in()) {
			//$(".btn-login-area").toggle(false);
			//$(".logged-in").toggle(true);
			//$(".user-image").attr("src", frappe.get_cookie("user_image"));
			
			//$('.user-image-sidebar').html(frappe.avatar(null, 'avatar-medium', null, null, null, true));
			//$('.user-image-myaccount').html(frappe.avatar(null, 'avatar-large', null, null, null, true));
		}
	},
	freeze_count: 0,
	freeze: function(msg) {
		// blur
		if(!$('#freeze').length) {
			var freeze = $('<div id="freeze" class="modal-backdrop fade"></div>')
				.appendTo("body");

			freeze.html(repl('<div class="freeze-message-container"><div class="freeze-message">%(msg)s</div></div>',
				{msg: msg || ""}));

			setTimeout(function() {
				freeze.addClass("in");
			}, 1);

		} else {
			$("#freeze").addClass("in");
		}
		frappe.freeze_count++;
	},
	unfreeze: function() {
		if(!frappe.freeze_count) return; // anything open?
		frappe.freeze_count--;
		if(!frappe.freeze_count) {
			var freeze = $('#freeze').removeClass("in");
			setTimeout(function() {
				if(!frappe.freeze_count) {
					freeze.remove();
				}
			}, 150);
		}
	},

	trigger_ready: function() {
		frappe.ready_events.forEach(function(fn) {
			fn();
		});
	},

	highlight_code_blocks: function() {
		hljs.initHighlighting();
	},
	bind_filters: function() {
		// set in select
		$(".filter").each(function() {
			var key = $(this).attr("data-key");
			var val = frappe.utils.get_url_arg(key).replace(/\+/g, " ");

			if(val) $(this).val(val);
		});

		// search url
		var search = function() {
			var args = {};
			$(".filter").each(function() {
				var val = $(this).val();
				if(val) args[$(this).attr("data-key")] = val;
			});

			window.location.href = location.pathname + "?" + $.param(args);
		};

		$(".filter").on("change", function() {
			search();
		});
	},
	
	do_search: function(datapath,val=null) {
		frappe.set_search_path(datapath);

		var path = (frappe.awesome_bar_path && frappe.awesome_bar_path[location.pathname]
			|| window.search_path || location.pathname);

		if(val){
			window.location.href = "/" + path + "?txt=" + encodeURIComponent(val);
		}else{
			window.location.href = "/" + path;
		}

		
	},
	set_search_path: function(path) {
		frappe.awesome_bar_path[location.pathname] = path;
	},
	make_navbar_active: function() {
		var pathname = window.location.pathname;
		$(".navbar-nav a.active").removeClass("active");
		$(".navbar-nav a").each(function() {
			var href = $(this).attr("href");
			if(href===pathname) {
				$(this).addClass("active");
				return false;
			}
		});
		//active parent
		$('.dropdown-item.active').parent().parent(".nav-item").children().addClass("active");

		//active sidebar
		if(location.pathname !== "/"){
			$('.side-drop-items a[href*="'+location.pathname+'"]').addClass("active");
			$('.side-drop-item.active').parent().parent().prev().addClass("active");
		}
	},
	is_user_logged_in: function() {
		return frappe.get_cookie("user_id") !== "Guest" && frappe.session.user !== "Guest";
	},
	add_switch_to_desk: function() {
		$('.switch-to-desk').removeClass('d-none');
	},
	add_link_to_headings: function() {
		$('.doc-content .from-markdown').find('h2, h3, h4, h5, h6').each((i, $heading) => {
			let id = $heading.id;
			let $a = $('<a class="no-underline">')
				.prop('href', '#' + id)
				.attr('aria-hidden', 'true')
				.html(`
					<svg xmlns="http://www.w3.org/2000/svg" style="width: 0.8em; height: 0.8em;" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
					</svg>
				`);
			$($heading).append($a);
		});
	},
	setup_lazy_images: function() {
		// Use IntersectionObserver to only load images that are visible in the viewport
		// Fallback for browsers that don't support it
		// To use this feature, instead of adding an img tag, add
		// <div class="website-image-lazy" data-class="img-class" data-src="image.jpg" data-alt="image"></div>

		function replace_with_image(target) {
			const $target = $(target);
			const attrs = $target.data();
			const data_string = Object.keys(attrs)
				.map(key => `${key}="${attrs[key]}"`)
				.join(' ');
			$target.replaceWith(`<img ${data_string}>`);
		}

		if (!window.IntersectionObserver) {
			$('.website-image-lazy').each((_, el) => {
				replace_with_image(el);
			});
			return;
		}

		const io = new IntersectionObserver(
			entries => {
				entries.forEach(e => {
					if (e.intersectionRatio > 0) {
						io.unobserve(e.target);
						replace_with_image(e.target);
					}
				});
			}, {
				threshold: [0, 0.2, 0.4, 0.6],
			});

		$('.website-image-lazy').each((_, el) => {
			// Start observing an element
			io.observe(el);
		});
	},
	show_language_picker() {
			
		frappe.call("frappe.translate.get_all_languages", {
			with_language_name: true
		}).then(res => {
			let language_list = res.message;
			let language_codes = [];
			let language_switcher = $("#language-switcher .form-control");
			language_list.forEach(language_doc => {
				language_codes.push(language_doc.language_code);
				language_switcher
					.append(
						$("<option></option>")
							.attr("value", language_doc.language_code)
							.text(language_doc.language_name)
					);
			});
			$("#language-switcher").removeClass('hide');
			let language = frappe.get_cookie('preferred_language');

			if(frappe.session.user !== "Guest"){
					language = window.logged_lang
					language = language || (language_codes.includes(navigator.language) ? navigator.language : 'en');

					language_switcher.val(language);
					document.documentElement.lang = language;

					language_switcher.change(() => {
						let lang = language_switcher.val();
						frappe.call({
							method: 'frappe.client.set_value',
							//method: 'roadslink.roadslink.utils.set_lang_info',
							args: {
								doctype: "User",
								name: frappe.session.user,
								fieldname: "language",
								value:lang
								//user: frappe.session.user,
								//value: lang
							},
							freeze: true,
							callback: (r) => {
								if(!r.exc) {
									window.location.reload();
								}
							}
						});
					});

				
			}else{
				language = language || (language_codes.includes(navigator.language) ? navigator.language : 'en');

				language_switcher.val(language);
				document.documentElement.lang = language;

				language_switcher.change(() => {
					let lang = language_switcher.val();
					frappe.call("frappe.translate.set_preferred_language_cookie", {
						"preferred_language": lang
					}).then(() => {
						window.location.reload();
					});
				});
			}
		});
	},
	handlePreloader(){
		setInterval(function(){ 
			$('.preloader').fadeOut(300);
		}, 400);
		setInterval(function(){ 
			$('body').addClass('loaded');
		}, 600); 

	}
});

frappe.setup_search = function (target) {
	if (typeof target === "string") {
		target = $(target);
	}

	let $common_dropdown_menu = target.find('.dropdown-menu');
	let $input = target.find('input');
	let dropdownItems;
	let offsetIndex = 0;
	let inputobj;
	let inputobjval;
	let $dropdown_menu;
	let $selected_cat  = $('.searchselect').val()

	target.find('.searchselect').on('change', frappe.utils.debounce((e) => {
		$selected_cat = e.currentTarget.value
	}, 200));

	$input.on('input', frappe.utils.debounce((e) => {
		inputobj = e.currentTarget
		inputobjval= inputobj.value
		inputobjval= typeof inputobjval === 'string' || inputobjval instanceof String ? inputobjval : '';
		inputobjval.replace(/[-[/\]{}()*+?.,\\^$|#\s]/g, '\\$&');

		if (!inputobjval) {
			clear_dropdown();
			$('.deep-search').removeClass("d-none");
			return;
		}else{
			let $main_parents = $(inputobj).parents(".dropdown-menusearch")
			$dropdown_menu = $main_parents.find('.dropdown-menu'); 
			$deep_search = $main_parents.find('.deep-search'); 
		}

		if($selected_cat){
			e.currentTarget.attributes['data-scope'].value = $selected_cat
		}

		
		frappe.call({
			method: 'roadslink.search.web_search',
			args: {
				scope: e.currentTarget.attributes['data-scope'].value || null,
				query: inputobjval+'*',
				limit: 5
			}
		}).then(r => {
			let results = r.message || [];
			let dropdown_html;
			if (results.length == 0) {
				dropdown_html = `<div class="dropdown-item text-grey-700"><b>${__('No results found')}</b>`;
				$deep_search.removeClass("d-none");
			} else {
				$deep_search.addClass("d-none");
				dropdown_html = results.map(r => {
					return `<a class="dropdown-item" href="/${r.path}">
						<h6>${r.title_highlights || r.title}</h6>
						<div style="white-space: normal;">${r.content_highlights}</div>
					</a>`;
				}).join('');
			}
			$dropdown_menu.html(dropdown_html);
			$dropdown_menu.addClass('show');
			dropdownItems = $dropdown_menu.find(".dropdown-item");
		});
	}, 500));
	/*
	$input.on('focus', (e) => {
		inputobj = e.currentTarget;
		$(inputobj).trigger('input');
	});
	*/


	// Clear dropdown when clicked
	$(window).on('click', function(event){
		clear_dropdown();
	});

	target.on('click', function(event){
		event.stopPropagation();
	});

	function clear_dropdown() {
		offsetIndex = 0;
		$common_dropdown_menu.html('');
		$common_dropdown_menu.removeClass('show');
		dropdownItems = undefined;
	}

	$('.deep-search').on('click', function () {
		if($selected_cat){
			$(this).attr('data-pathscope',$selected_cat);
		}
		if (typeof inputobjval !== 'undefined'){
			frappe.do_search($(this).attr('data-pathscope'), inputobjval);
		}else{
			frappe.do_search($(this).attr('data-pathscope'));
		}
		return false;
	});
};


// Utility functions
window.valid_email = function(id) {
	// eslint-disable-next-line
	// copied regex from frappe/utils.js validate_type
	return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/.test(id.toLowerCase());
}

window.validate_email = valid_email;

window.cstr = function(s) {
	return s==null ? '' : s+'';
}

window.is_null = function is_null(v) {
	if(v===null || v===undefined || cstr(v).trim()==="") return true;
};

window.is_html = function is_html(txt) {
	if(txt.indexOf("<br>")==-1 && txt.indexOf("<p")==-1
		&& txt.indexOf("<img")==-1 && txt.indexOf("<div")==-1) {
		return false;
	}
	return true;
};

window.ask_to_login = function ask_to_login() {
	if(!frappe.is_user_logged_in()) {
		if(localStorage) {
			localStorage.setItem("last_visited",
				window.location.href.replace(window.location.origin, ""));
		}
		window.location.href = "login";
	}
};

$( window ).on( "load", function() {
	frappe.handlePreloader();
});

// check if logged in? $(document).ready(function() { is removed as its deprecated and its equivalent is
$(function() {
	window.full_name = frappe.get_cookie("full_name");
	var logged_in = frappe.is_user_logged_in();
	$("#website-login").toggleClass("hide", logged_in ? true : false);
	$("#website-post-login").toggleClass("hide", logged_in ? false : true);
	$(".logged-in").toggleClass("hide", logged_in ? false : true);

	//frappe.bind_navbar_search();

	// switch to app link
	if(frappe.get_cookie("system_user")==="yes" && logged_in) {
		frappe.add_switch_to_desk();
	}

	frappe.render_user();
	frappe.setup_lazy_images();

	$(document).trigger("page-change");
	if($(this).scrollTop() > 10 ){
		$('.scroll-header').addClass('bg-white shadow-xss');
	}
	$(window).on('scroll', function(){
        if ($(this).scrollTop() > 10) {
           $('.scroll-header').addClass('bg-white shadow-xss');
        } else {
           $('.scroll-header').removeClass('bg-white shadow-xss');
        }
    })
	$('.nav-show').on('click', function () {
        // $(this).toggleClass('active');
        $('.navigation.web-menu').addClass('nav-active');
		$('.backdrop').removeClass('d-none');
    });

	$('.filter-show').on('click', function () {
        $('.navigation.filter-menu').addClass('nav-active');
    });

	$('.close-filter').on('click', function () {
        $('.navigation.filter-menu').removeClass('nav-active');
    });
	
	$('.backdrop').on('click', function () {
        $('.navigation').removeClass('nav-active');
		$('.backdrop').addClass('d-none');
        return false;
    });

	
	$("#footer-subscribe-button").click(function() {

		if($("#footer-subscribe-email").val() && validate_email($("#footer-subscribe-email").val())) {
			$("#footer-subscribe-email").attr('disabled', true);
			$("#footer-subscribe-button").html("Sending...")
				.attr("disabled", true);
			erpnext.subscribe_to_newsletter({
				email: $("#footer-subscribe-email").val(),
				callback: function(r) {
					if(!r.exc) {
						$("#footer-subscribe-button").html(__("Added"))
							.attr("disabled", true);
					} else {
						$("#footer-subscribe-button").html(__("Error: Not a valid id?"))
							.addClass("btn-danger").attr("disabled", false);
						$("#footer-subscribe-email").val("").attr('disabled', false);
					}
				}
			});
		}
		else
			frappe.msgprint(frappe._("Please enter valid email address"))
		}
	);

});

$(document).on("page-change", function() {
	$(document).trigger("apply_permissions");
	$('.dropdown-toggle').dropdown();

	//multilevel dropdown fix
	$('.dropdown-menu .dropdown-submenu .dropdown-toggle').on('click', function(e) {
		e.stopPropagation();
		$(this).parent().parent().parent().addClass('open');
	});

	$.extend(frappe, frappe.get_cookies());
	frappe.session = {'user': frappe.user_id};

	frappe.datetime.refresh_when();
	frappe.trigger_ready();
	frappe.bind_filters();
	frappe.highlight_code_blocks();
	frappe.add_link_to_headings();
	frappe.make_navbar_active();
	// scroll to hash
	if (window.location.hash) {
		var element = document.getElementById(window.location.hash.substring(1));
		element && element.scrollIntoView(true);
	}

});


frappe.ready(function() {
	if (window.show_language_picker){
		frappe.show_language_picker();
	}

	$('.menu-search-icon').on('click', function() {
		$('.app-header-search').addClass('show');
	});
	$('.searchbox-close').on('click', function() {
		$('.app-header-search').removeClass('show');
	});
	
	frappe.require('/assets/roadslink/universe/vendor/owl-carousel/js/owl.carousel.min.js', () => {
		// chat.js is loaded
		$('.course-slide').owlCarousel({
			loop:true,
			rtl:(window.layout_direction == "rtl")?true:false,
			margin:10,
			nav:true,
			autoplay:true,
			dots:true,
			items:1,
		})
		$('.category-slide').owlCarousel({
			loop:false,
			margin:10,
			rtl:(window.layout_direction == "rtl")?true:false,
			nav:true,
			autoplay:false,
			dots:false,
			navText:['<i class="ti-angle-left"></i>','<i class="ti-angle-right"></i>'],
			autoWidth:true
		})
		$('.product-slide').owlCarousel({
			loop:false,
			rtl:(window.layout_direction == "rtl")?true:false,
			margin:11,
			nav:true,
			autoplay:false,
			dots:true,
			items:4,
			navText:['<i class="ti-angle-left icon-nav"></i>','<i class="ti-angle-right icon-nav"></i>'],
			responsive:{
                0:{
                    items:1,
                },
                670:{
                    items:2,
                },
                990:{
                    items:3,
                },
				1320:{
					items:4,
				}
    
            }
		})
		$('.brand-slider').owlCarousel({
            loop:true,
            rtl:(window.layout_direction == "rtl")?true:false,
            margin:20,
            nav:false,
            autoplay:true,
            dots:false,
            items:4,
            responsive:{
                0:{
                    items:2,
                },
                600:{
                    items:3,
                },
                1200:{
                    items:4,
                }
    
            }
        })
		
		$('.feedback-slider').owlCarousel({
			loop:true,
			rtl:(window.layout_direction == "rtl")?true:false,
			margin:15,
			nav:true,
			autoplay:true,
			dots:false,
			items:5,
			navText:['<i class="ti-angle-left"></i>','<i class="ti-angle-right"></i>'],
			responsive:{
				0:{
					items:1,
				},
				600:{
					items:2,
				},
				1200:{
					items:3,
				}
	
			}
		})
	})
	frappe.socketio.init(window.socketio_port);
});

