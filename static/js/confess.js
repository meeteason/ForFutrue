var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var myneb = new Neb();
myneb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
var account, tx, txhash;
var dapp_address = "n1gV3CB8CeFEfDM83HARRKQgWjkCFNJT4xq";

$(function() {
    var arrs = [];

    function init() {
        var initLength = 5,
            i = 1;
        $.create(arrs[0]);
        var timer = setInterval(function() {
            $.create(arrs[i]);
            i++;
            if (i == initLength) clearInterval(timer);
        }, 2000);
        $('.main').css('height', $('.container').height() - $('.top').height() + 'px');
    }

    myneb.api.call({
        from: dapp_address,
        to: dapp_address,
        value: 0,
        contract: {
            function: "pull",
            args: JSON.stringify([-50, 50])
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    }).then(function(tx) {
        arrs = JSON.parse(tx.result);
        init();
        setTimeout(function() {
            setInterval(function() {
                $.create(arrs[i]);
                $.destroy($($('.row').get(-1)));
                i++;
                if (i == arrs.length) i = 0;
            }, 3500);
        }, 8000);
    });
    var i = 6;
    $('#help-img').click(function() {
        $('#help').show();
    });
    $('#help .close').click(function() {
        $('.mask').hide();
    });
    $('#write-img').click(function() {
        $('#write').show();
    });
    $('#write .close').click(function() {
        $('.mask').hide();
    });
    $('#submit').click(function() {
        if ($('#text').val().length > 200) {
            alert('error');
            return;
        }
        if ($('#name').val().length > 20) {
            alert('error');
            return;
        }
        window.postMessage({
            "target": "contentscript",
            "data": {
                "to": dapp_address,
                "value": "0",
                "contract": {
                    "function": "set",
                    "args": JSON.stringify([$('#text').val(), $('#name').val()])
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
    });
    $('#search-img').click(function() {
        $('#search').show();
    });
    $('#search .close').click(function() {
        $('.mask').hide();
    });
    $('#submit-addr').click(function() {
        myneb.api.call({
            from: dapp_address,
            to: dapp_address,
            value: 0,
            contract: {
                function: "get",
                args: JSON.stringify([$('#address').val().trim()])
            },
            gasPrice: 1000000,
            gasLimit: 2000000,
        }).then(function(tx) {
            var res = JSON.parse(tx.result);
            if (res)
                $('#search-res').html("<div class=\"row\"><div>" + res.text + "</div><div class=right>——" + res.name + "</div></div>");
            else
                $('#search-res').html("<div class=\"row\"><div>这个用户还没有发布过告白哦</div></div>");
        });
    })

});
$.extend({
    create: function(data) {
        var e = $("<div class=\"row\"><div>" + data.text + "</div><div class=right>——" + data.name + "</div></div>");
        e.css('transform', 'translate(0,-100%)');
        $(".main").prepend(e);
        $('.row').matrix({ '5': '+' + e.outerHeight() });
        setTimeout(function() {
            e.matrix({ '3': 1, '5': 0 });
            e.css('opacity', '1');
        });
        return e;
    },
    destroy: function(e) {
        e.css({
            'opacity': '0'
        }).matrix({ '4': 500 });
        setTimeout(function() {
            e.remove();
        }, 1000);
    }
});
$.fn.extend({
    matrix: function(params) {
        this.each(function() {
            var str = $(this).css('transform');
            if (!str) return;
            str = str.substring(7);
            str = str.substring(0, str.length - 1);
            var arr = str.split(', ');
            for (var i = 0; i < 6; i++) {
                arr[i] = arr[i] - 0;
            }
            if (params) {
                for (var key in params) {
                    switch (typeof params[key]) {
                        case 'number':
                            arr[key] = params[key];
                            break;
                        case 'string':
                            arr[key] = eval(arr[key] + params[key]);
                            break;
                    }
                }
                str = arr.join(',');
                str = 'matrix(' + str + ')';
                $(this).css('transform', str);
            }
        });
        return this;
    }
});
