// login.js
// don't remove this line (used in test)

window.disable_signup = {{ disable_signup and "true" or "false" }};

window.login = {};

window.verify = {};

function yesnoCheck() {
	if (document.getElementById('mobileradio').checked) {
		$(".mobilepart").removeClass("d-none")
		$(".emailpart").addClass("d-none")
	}else{
		$(".mobilepart").addClass("d-none")
		$(".emailpart").removeClass("d-none")
	} 

}

login.bind_events = function () {
	$(window).on("hashchange", function () {
		login.route();
	});

	$("#form-login").on("submit", function (event) {
		event.preventDefault();
		var args = {};
		args.cmd = "login";
		args.usr = frappe.utils.xss_sanitise(($("#login_email").val() || "").trim());
		args.pwd = $("#login_password").val();
		args.device = "desktop";
		if (!args.usr || !args.pwd) {
			frappe.msgprint('{{ _("Both login and password required") }}');
			return false;
		}
		login.call(args);
		return false;
	});

	$("#form-signup").on("submit", function (event) {
		event.preventDefault();
		var args = {};
		args.cmd = "frappe.core.doctype.user.user.sign_up";
		args.email = ($("#signup_email").val() || "").trim();
		args.dial_country = ($("#signup_dial").val() || "").trim();
		args.dial_code = ($("#signup_dial option:selected").data('telcode') || "").trim();
		args.mobile = ($("#signup_mobile").val() || "").trim();
		args.redirect_to = frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to"));
		args.full_name = frappe.utils.xss_sanitise(($("#signup_fullname").val() || "").trim());
		if (!args.mobile){
			if (!args.email || !validate_email(args.email) || !args.full_name) {
				login.set_status('{{ _("Valid name and email/mobile required") }}', 'red');
				return false;
			}
		}else{
			if(args.email){
				if (!validate_email(args.email)) {
					login.set_status('{{ _("Valid email") }}', 'red');
					return false;
				}
			}
			if(!args.full_name){
				login.set_status('{{ _("Valid name required") }}', 'red');
				return false;
			}
		}
		
		login.call(args);
		return false;
	});

	$("#form-forgot").on("submit", function (event) {
		event.preventDefault();
		var args = {};
		args.cmd = "frappe.core.doctype.user.user.reset_password";
		args.user = ($("#forgot_email").val() || "").trim();
		if (!args.user) {
			login.set_status('{{ _("Valid Login id required.") }}', 'red');
			return false;
		}
		login.call(args);
		return false;
	});

	$(".toggle-password").click(function () {
		var input = $($(this).attr("toggle"));
		if (input.attr("type") == "password") {
			input.attr("type", "text");
			$(this).html(
				`<i class="fot-sm feather-eye-off i-right text-grey-500 pr-0"></i>`
			);
		} else {
			input.attr("type", "password");
			$(this).html(
				`<i class="fot-sm feather-eye i-right text-grey-500 pr-0"></i>`
			);
			
		}
	});

	{% if ldap_settings and ldap_settings.enabled %}
	$(".btn-ldap-login").on("click", function () {
		var args = {};
		args.cmd = "{{ ldap_settings.method }}";
		args.usr = ($("#login_email").val() || "").trim();
		args.pwd = $("#login_password").val();
		args.device = "desktop";
		if (!args.usr || !args.pwd) {
			login.set_status('{{ _("Both login and password required") }}', 'red');
			return false;
		}
		login.call(args);
		return false;
	});
	{% endif %}
}


login.route = function () {
	var route = window.location.hash.slice(1);
	if (!route) route = "login";
	login[route]();
}

login.reset_sections = function () {
	$("div.for-login").removeClass("d-block");
	$("div.for-forgot").removeClass("d-block");
	$("div.for-signup").removeClass("d-block");

	$('.card-body .indicator' ).not( $( ".signup-disabled .indicator" ) ).each(function () {
		$(this).removeClass().addClass('indicator').addClass('blue')
			.text($(this).attr('data-text'));
	});
}

login.login = function () {
	login.reset_sections();
	$("div.for-login").addClass("d-block");
}

login.email = function () {
	login.reset_sections();
	$("div.for-login").addClass("d-block");
	$("#login_email").focus();
}

login.forgot = function () {
	login.reset_sections();
	$("div.for-forgot").addClass("d-block");
	$("#forgot_email").focus();
}

login.signup = function () {
	login.reset_sections();
	$("div.for-signup").addClass("d-block");
	$("#signup_fullname").focus();
}


// Login
login.call = function (args, callback) {
	login.set_status('{{ _("Verifying...") }}', 'blue');

	return frappe.call({
		type: "POST",
		args: args,
		callback: callback,
		freeze: true,
		statusCode: login.login_handlers
	});
}

login.set_status = function (message, color) {
	$('.login-card.d-block .primary-act').text(message)
	if (color == "red") {
		$('.login-card.d-block .form-control').addClass("invalid");
	}
}

login.set_invalid = function (message) {
	$(".login-card.d-block .card-body").addClass('invalid-form-wiggle');
	setTimeout(() => {
		$(".login-card.d-block .card-body").removeClass('invalid-form-wiggle');
	}, 500)
	login.set_status(message, 'red');
	$("#login_password").focus();
}

login.login_handlers = (function () {
	var get_error_handler = function (default_message) {
		return function (xhr, data) {
			if (xhr.responseJSON) {
				data = xhr.responseJSON;
			}

			var message = default_message;
			if (data._server_messages) {
				message = ($.map(JSON.parse(data._server_messages || '[]'), function (v) {
					// temp fix for messages sent as dict
					try {
						return JSON.parse(v).message;
					} catch (e) {
						return v;
					}
				}) || []).join('<br>') || default_message;
			}

			if (message === default_message) {
				login.set_invalid(message);
			} else {
				login.reset_sections();
			}

		};
	}

	var login_handlers = {
		200: function (data) {
			if (data.message == 'Logged In') {
				login.set_status('{{ _("Success") }}', 'green');
				window.location.href = frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to")) || data.home_page;
			} else if (data.message == 'Password Reset') {
				window.location.href = frappe.utils.sanitise_redirect(data.redirect_to);
			} else if (data.message == "No App") {
				login.set_status("{{ _('Success') }}", 'green');
				if (localStorage) {
					var last_visited =
						localStorage.getItem("last_visited")
						|| frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to"));
					localStorage.removeItem("last_visited");
				}

				if (data.redirect_to) {
					window.location.href = frappe.utils.sanitise_redirect(data.redirect_to);
				}

				if (last_visited && last_visited != "/login") {
					window.location.href = last_visited;
				} else {
					//window.location.href = data.home_page;
					window.location.href = "/me";
				}
			} else if (window.location.hash === '#forgot') {
				if (data.message === 'not found') {
					login.set_status('{{ _("Not a valid user") }}', 'red');
				} else if (data.message == 'not allowed') {
					login.set_status('{{ _("Not Allowed") }}', 'red');
				} else if (data.message == 'disabled') {
					login.set_status('{{ _("Not Allowed: Disabled User") }}', 'red');
				} else {
					login.set_status('{{ _("Instructions Emailed") }}', 'green');
				}


			} else if (window.location.hash === '#signup') {
				if (cint(data.message[0]) == 0) {
					login.set_status(data.message[1], 'red');
				} else {
					login.set_status('{{ _("Success") }}', 'green');
					frappe.msgprint(data.message[1])
				}
				//login.set_status(__(data.message), 'green');
			}

			//OTP verification
			if (data.verification && data.message != 'Logged In') {
				login.set_status('{{ _("Success") }}', 'green');

				document.cookie = "tmp_id=" + data.tmp_id;

				if (data.verification.method == 'OTP App') {
					continue_otp_app(data.verification.setup, data.verification.qrcode);
				} else if (data.verification.method == 'SMS') {
					continue_sms(data.verification.setup, data.verification.prompt);
				} else if (data.verification.method == 'Email') {
					continue_email(data.verification.setup, data.verification.prompt);
				}
			}
		},
		401: get_error_handler('{{ _("Invalid Login. Try again.") }}'),
		417: get_error_handler('{{ _("Oops! Something went wrong") }}')
	};

	return login_handlers;
})();

frappe.ready(function () {

	login.bind_events();
	yesnoCheck();

	if (!window.location.hash) {
		window.location.hash = "#login";
	} else {
		$(window).trigger("hashchange");
	}

	$(document).trigger('login_rendered');
});

var verify_token = function (event) {
	$("#form-verify").on("submit", function (eventx) {
		eventx.preventDefault();
		var args = {};
		args.cmd = "login";
		args.otp = $("#login_token").val();
		args.tmp_id = frappe.get_cookie('tmp_id');
		if (!args.otp) {
			frappe.msgprint('{{ _("Login token required") }}');
			return false;
		}
		login.call(args);
		return false;
	});
}

		

var request_otp = function (r) {
	$('.sign-up-in-wrapper').html(
		`<div class='card overflow-hidden rounded-xxl ml-auto mr-auto error-card'>
			<div class="card-body rounded-0 text-left signup-disabled">
				<span class="indicator blue" data-text="Verification">{{ _("Verification") }}</span>
				<p id="otp_div"></p>
				<form id="form-verify" role="form">		
					<div class="form-group mb-3">
						<input type="text" id="login_token" autocomplete="off" class="style2-input pl-5 form-control text-grey-900 font-xsss fw-600" placeholder={{ _("Verification Code") }} required="" autofocus="">                        
					</div>
				</form>
				<div class="col-sm-12 p-0 text-left">
					<div class="form-group mb-1">
						<button type="submit" form="form-verify" id="verify_token" class="form-control text-center style2-input text-white fw-600 bg-dark border-0 p-0">{{ _("Verify") }}</a>
					</div>
					<h6 class="text-grey-500 font-xsss fw-500 mt-0 mb-0 lh-32"><a href="/login" class="fw-700 ml-1">{{ _("Login") }}</a></h6>
				</div>
			</div>
		</div>`
	);
	// add event handler for submit button
	verify_token();
}

var continue_otp_app = function (setup, qrcode) {
	request_otp();

	if (setup) {
		$('#otp_div').text('{{ _("Enter Code displayed in OTP App.") }}');
	} else {
		$('#otp_div').text('{{ _("OTP setup using OTP App was not completed. Please contact Administrator.") }}');
	}
}

var continue_sms = function (setup, prompt) {
	request_otp();
	
	if (setup) {
		$('#otp_div').text('{{ _("SMS is sent at your number.") }}');
	} else {		
		$('#otp_div').text(prompt || '{{ _("SMS was not sent. Please contact Administrator.") }}');
	}
}

var continue_email = function (setup, prompt) {
	request_otp();

	if (setup) {
		$('#otp_div').text('{{ _("Verification code is sent at the email.") }}');
	} else {
		$('#otp_div').text(prompt || '{{ _("Verification code email not sent. Please contact Administrator.") }}');
	}
}
