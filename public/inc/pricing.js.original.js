var SLIDER = SLIDER || (function(){
	var _args = {};

	return {
		init: function(Args) {
			_args = Args;
		},
		create: function() {
			function numberWithCommas(x) {
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
//THIS IS WHERE TO input slidervalues
			var sliderValues = _args[0];
            //console.log("Args 0 is ", _args[0]);
			var quantitySlider = $('.quantity-slider').slider({
				animate: true,
				range: 'min',
				value: _args[2],
				min: 0,
				max: sliderValues.length - 1,
				step: 1,
				slide: function(event, ui) {
					calculateTotal();
					setTimeout(function() {
						calculateTotal();
					}, 200);
				}
			});

			var calculateTotal = function() {


				var quantity = sliderValues[quantitySlider.slider('option', 'value')];
				var pricePer = _args[3];
				var discount = 0;

				$(_args[1]).each(function(key, value) {
					if (quantity >= value.quantity) {
						discount = value.discount;
					}
				});

				var total = Math.round(parseInt((pricePer * quantity) - ((pricePer * quantity) * discount), 10));

				$('.quantity').html(numberWithCommas(quantity));
				$('input.quantity').val(quantity);
				$('.price').html('$' + numberWithCommas(total));
                $('input.total').val(total);
				$('.discount').html('(' + numberWithCommas(Math.round(parseInt(discount * 100, 10))) + '% discount)');
                var interval = $('.interval-container input[type="radio"][name="interval-radio"]:checked').val();
                if(typeof interval == 'undefined'){
                    interval = $('#radios input[type="radio"][name="colorCheckbox"]:checked').val();
                }
                if(interval == 'recurring' && $('#totalammount').length == 1){
                    var total = parseInt($('#totalammount').text());
                    $('input.total').val(total);
                }
			};
            var getServiceImage= function(category){

                var img = '';
                switch (category){
                    case 'facebook':
                        img = 'img/pricing/facebook-circle.png';
                        break;
                    case 'twitter':
                        img = 'img/pricing/twitter-circle.png';
                        break;
                    case 'instagram':
                        img = 'img/pricing/instagram-circle.png';
                        break;
                    default :
                        img = '';
                }
                return img;
            };
            // for authorize.net payment

            // var authorizeNetProcess = function(url, interval, alternate){
            //     calculateTotal();
            //     var check_interval = $('.interval-container input[type="radio"][name="interval-radio"]:checked').val();
            //     if(typeof check_interval == 'undefined'){
            //         check_interval = $('#radios input[type="radio"][name="colorCheckbox"]:checked').val();
            //     }

            //     var amount = Math.round($('input.total').val());
            //     var name = _args[4];
            //     var category = _args[6];

            //     var service_logo = getServiceImage(category);
            //     var quantity = $('.quantity').html();
            //     if(check_interval == "recurring"){
            //         var description_1 = $.trim($('#description-1').text());
            //         description_1 = description_1.replace("Number of ", "");
            //         var description_2 = $.trim($('#description-2').text());
            //         description_2 = description_2.replace("Max Number of ", "");
            //         var description = description_2 + ' | '+ description_1 + ' | ' + url;
            //     }else {

            //         if(interval == 'monthly'){
            //             var description = quantity + '+ ' + _args[5] + ' Per Month' + url;
            //         }
            //         else{
            //             var description = quantity + '+ ' + _args[5] + url;
            //         }
            //     }
            //     $('#service-name').text(name);
            //     $('#service-description').text(description);
            //     if(interval == 'monthly'){
            //         if(check_interval != "recurring") {
            //             amount = amount - (amount / 10);
            //         }
            //         $('#amount-text').text('Subscribe $' + Math.round(amount));
            //     }else {
            //         $('#amount-text').text('Pay $' + amount);
            //     }
            //     $('#authorizenet-payment-error').hide();

            //     $('.plgo').css('background', 'url('+service_logo+') no-repeat rgba(0,0,0,0)');
            //     $('.plgo').css('background-size', '100%');
            //     $(".overCls").fadeIn(300);
            //     $(".myPopPage").addClass("animated zoomIn");
            //     $("#customer_email").focus();
            // };

            // $('#authorizenet-form').submit(function(){
            //     $('#authorizenet-payment-error').hide();
            //     var url = $('input[type="text"]:visible').val();
            //     var interval = $('.interval-container input[type="radio"][name="interval-radio"]:checked').val();
            //     var payment_mode = interval;
            //     if(typeof interval == 'undefined'){
            //         interval = $('#radios input[type="radio"][name="colorCheckbox"]:checked').val();
            //         payment_mode = interval;
            //     }
            //     var amount = Math.round($('input.total').val());
            //     var name = _args[4];
            //     var quantity = $('.quantity').html();
            //     if(interval == "recurring"){
            //         var description_1 = $.trim($('#description-1').text());
            //         description_1 = description_1.replace("Number of ", "");
            //         description_1 = description_1.replace(" per post", "");
            //         var description_2 = $.trim($('#description-2').text());
            //         description_2 = description_2.replace("Max Number of ", "");
            //         var description = description_2 + ' | '+ description_1 + ' | ' + url;
            //         interval = 'monthly';
            //         quantity = "";
            //     }else {
            //         if(interval == 'monthly'){
            //             var description = quantity + '+ ' + _args[5] + ' Per Month - ' + url;
            //         }
            //         else{
            //             var description = quantity + '+ ' + _args[5] + ' - ' +url;
            //         }
            //     }
            //     if(interval == 'monthly'){
            //         if(payment_mode != "recurring") {
            //             amount = Math.round(amount - (amount / 10));
            //         }
            //         var amount_text = 'Subscribe $' + amount;
            //     }else{
            //         var amount_text = 'Pay $'+amount;
            //     }
            //     var country = $('#select_country').find('select option:selected').text();
            //     var formData = $(this).serializeArray();
            //     formData.push({name:'customer_country', value:country});
            //     formData.push({name:'price', value:amount});
            //     formData.push({name:'service_name', value:name});
            //     formData.push({name:'service_description', value:description});
            //     formData.push({name:'service_quantity', value:quantity});
            //     formData.push({name:'url', value:url});
            //     formData.push({name:'interval', value:interval});
            //     $('#amount-text').text('Please Wait ...');
            //     $('#amount-text').attr('disabled', 'disabled');
            //     $.ajax({
            //         url : window.location.origin+'/authorize-net-payment.php',
            //         type : 'POST',
            //         data : formData,
            //         success : function(resp){
            //             try {
            //                 var data = JSON.parse(resp);
            //                 if (data.status == 1) {
            //                     $('#amount-text').text('Success');
            //                     window.location.href = 'https://follows.com/success';
            //                 }
            //                 else {
            //                     $('#amount-text').text(amount_text);
            //                     $('#amount-text').removeAttr('disabled');
            //                     $('#authorizenet-payment-error').text(data.message).show();
            //                 }
            //             }catch(e) {
            //                 $('#amount-text').text(amount_text);
            //                 $('#amount-text').removeAttr('disabled');
            //                 $('#authorizenet-payment-error').text('Some Error Occurred, Please Try Again').show();
            //             }

            //         },
            //         error : function(resp){
            //             $('#amount-text').text(amount_text);
            //             $('#amount-text').removeAttr('disabled');
            //             $('#authorizenet-payment-error').text('Some Error Occurred, Please Try Again').show();
            //         }
            //     });
            //     return false;
            // });

			$(function() {
				calculateTotal();

                $('.place-order').on('click touchstart',function(){
                    var alternate = false;
                    var paymentMethod = $('.select-payment input[type="radio"][name="payment-radio"]:checked').val();
                    var interval = $('.interval-container input[type="radio"][name="interval-radio"]:checked').val();
                    var url = $('input[type="text"]:visible').val();

                    if (!interval) {
                        var selectedInterval =  $('#radios input[type="radio"][name="colorCheckbox"]:checked').val();
                        if (selectedInterval == 'recurring') {
                            interval = 'monthly';
                            alternate = true;
                        }else{
                            url = ' - ' + url;
                        }
                    }else{
                        if (url) {
                            url = ' - ' + url;
                        }
                    }
                    switch (paymentMethod) {
                        case 'authorizenet':
                            
                            break;
                    }
                });

				$('input[type="text"]').on('keyup', function() {
					$(this).removeClass('error');
				});
				});

		}
	};
}());