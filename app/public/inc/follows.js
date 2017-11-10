// if (window.location.hostname !== 'follows.com'){
// window.top.location.href = 'https://follows.com'; 
// }

// Stage Call to Action

$(document).ready(function() {
	$('.cta').click(function(e){    
	    $('#stage1-inner').fadeOut('slow', function(){
	        $('#stage2-inner').fadeIn('slow');
	    });
	});
});

// Typed Leadin

$(function(){
      $(".leadin-service").typed({
        strings: ["Twitter followers", "Instagram followers", "Facebook followers"],
        typeSpeed: 100,
        backDelay: 2500,
        loop: true,
      });
});

// Read More

$('#content-truncate').readmore({
  speed: 1375,
  collapsedHeight: 496,
  lessLink: '<a href="#">Show less</a>'
});

// Testimonials

$(document).ready(function (){
	$('#button a').click(function(){
		var integer = $(this).attr('rel');
		$('#myslide .cover').animate({left:-475*(parseInt(integer)-1)})  /*----- Width of div mystuff (here 160) ------ */
		$('#button a').each(function(){
		$(this).removeClass('activebtn');
			if($(this).hasClass('button'+integer)){
				$(this).addClass('activebtn')}
		});
	});	
});

// Followers Counter

$(document).ready(function(){function t(t){var a=$(".number"),n=a.text(),i=n.split(""),o=t.split(""),r=[];a.html("");for(var e=0;e<i.length;e++)a.append('<span data-col="'+e+'">'+i[e]+"</span>"),r.push(o[e]-i[e]);for(var e=0;e<r.length;e++){var p=a.find("span:eq("+e+")");if(p.attr("data-topFinish",p.height()*r[e]*-1),0!==r[e])for(var h=r[e]>0?1:-1,s=Math.abs(r[e]),l=1;s+1>l;l++){var d=p.position().top+p.height()*l*h,f=p.position().left,u=d-s*p.height()*h;a.append('<span data-col="'+e+'" data-topFinish="'+u+'" style="position: absolute; top:'+d+"px; left:"+f+'px;">'+(l*h+ +i[e])+"</span>")}}a.find("span").each(function(){var n=$(this).attr("data-topFinish")+"px";$(this).animate({top:n},function(){a.html(t)})})}$(document).ready(function(){var a=241,n=4;$(".number").html(a.toString());var i=setInterval(function(){return a+=Math.floor(Math.random()*n+2),a>999?(t("1k"),void clearInterval(i)):void t(a.toString())},2300)})});

// Particles

angular.module("particles", []).directive("explosion", ["$interval", function() {
    return {
        restrict: "C",
        template: "<canvas></canvas",
        replace: !0,
        transclude: !0,
        scope: {
            particle: "@",
            count: "=",
            speed: "=",
            size: "=",
            colors: "=",
            spawn: "="
        },
        link: function(t, n) {
            console.log("Starting canvas ", t.particle);
            var a, e, o, r = n[0].getContext("2d"),
                i = [],
                l = t.count || 100,
                c = t.speed || 100,
                s = t.size || 10,
                h = t.colors || ["#f00"],
                d = t.spawn ? 500 / t.spawn : 20,
                u = function() {
                    n.attr({
                        width: $("body").width(),
                        height: $("body").height()
                    }), a = n.attr("width"), e = n.attr("height"), console.log("Size ", a, "x", e)
                },
                f = function() {
                    i.push({
                        x: a / 2,
                        y: e / 2,
                        v: {
                            x: (c << 1) * Math.random() - c,
                            y: (c << 1) * Math.random() - c
                        },
                        s: Math.random() * s,
                        a: 1,
                        c: h[Math.floor(Math.random() * h.length)]
                    })
                },
                p = function() {
                    r.clearRect(0, 0, a, e);
                    for (var t = 0; t < i.length; t++) {
                        var n = i[t];
                        r.globalAlpha = n.a, r.fillStyle = n.c, r.beginPath(), r.arc(n.x, n.y, n.s, 0, 2 * Math.PI), r.fill()
                    }
                },
                v = 0,
                g = function(t) {
                    for (v += t; v > d;) v -= d, f();
                    var n = i.length - l;
                    n > 0 && i.splice(0, n);
                    for (var a = 0; a < i.length; a++) {
                        var e = i[a];
                        e.x += e.v.x * t / 1e3, e.y += e.v.y * t / 1e3, e.a *= .99
                    }
                },
                w = !1,
                m = function(t) {
                    o || (o = t);
                    var n = t - o;
                    o = t, g(n), p(), w || window.requestAnimationFrame(m)
                };
            u(), $(window).on("load", u), window.requestAnimationFrame(m), t.$on("$destroy", function() {
                w = !0
            })
        }
    }
}]);