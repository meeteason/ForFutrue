var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var Transaction = require("nebulas").Transaction;
var Unit = require("nebulas").Unit;
var myneb = new Neb();
var NebPay = require("nebpay");
var nebPay = new NebPay();


// ****Testnet****//
myneb.setRequest(new HttpRequest("https://testnet.nebulas.io"));
var dapp_address = "n1xXUSQdCYvP6USG26JrSQo7rM85fSSoC9U";


// ****Maintnet****//
// myneb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
// var dapp_address = "n1gPvty9KV4X4EypTuKYT4Q4cBikVacfkpu";


$(function () {


    //设置时间选择器
    $('#txtExpire').datepicker({
        format: "yyyy-mm-dd 23:59:59",
        language: "zh-CN",
        clearBtn: true,
        todayHighlight: true,
        startDate: dayjs().format("YYYY-MM-DD")
    });
    //提交写入
    $("#saveWrite").click(function () {
        var date = dayjs($('#txtExpire').val())
        if (date.isValid()) {
            var expire = date.diff(dayjs())
            if (expire > 0) {
                var cover = $("#coverData").prop("checked")
                showLoading();
                write($("#txtContent").val(), expire, cover, function (data) {
                    var alertSuccess = $("#modalWrite .alert-danger"),
                        alertError = $("#modalWrite .alert-success")
                    hideLoading();
                    if (data.code == 0) {
                        console.log("wirte success,and then get your content...")
                        alertSuccess.alert()
                        localStorage.setItem("yourAddress", data.data.from)
                        $("#txtAddress").val(data.data.from)
                        getYours(data.data.from).then(function (rep) {
                            console.log("get yours success", rep)
                        })

                    } else {
                        console.error(data)
                    }
                })
            } else {
                // The date time wrong
                //TODO
            }
        } else {
            // TODO
        }
    });

    $("#btnGetWrite").click(function () {
        var _address = $("#txtAddress").val()
        if (!!_address && _address.length == 35 && _address.startsWith("n1")) {
            showLoading()
            getYours(_address).then(function (rep) {
                hideLoading();
                var data = JSON.parse(rep.result)
                showYourCentent(data)
            })
        } else {
            //the address wrong format
            //TODO
        }
    });

    var yourAddress = localStorage.getItem("yourAddress")
    if (!!yourAddress) {
        getYours(yourAddress)
    }
})

function showYourCentent(data) {
    if (data.status == 1) {
        $("#modalFind pre").html(data.content)
        $("#modalFind").modal("show");
        console.log(data.content)
    } else if (data.status == -1) {
        console.log("未写入任何信息")
    } else if (data.status == -2) {
        //设置倒计时
        $(".count_down").countDown({
            startTimeStr: dayjs().format("YYYY/MM/DD HH:mm:ss"), //开始时间
            endTimeStr: dayjs(data.expire).format("YYYY/MM/DD HH:mm:ss"), //结束时间
            daySelector: ".day_num",
            hourSelector: ".hour_num",
            minSelector: ".min_num",
            secSelector: ".sec_num"
        });

        $(".count_down").show()
        console.log("时间未到，不能展示")

    }
}

function getCount() {
    return myneb.api.call({
        from: dapp_address,
        to: dapp_address,
        value: 0,
        contract: {
            function: "getCount",
            args: "[]"
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    })
}

function getDate() {
    return myneb.api.call({
        from: dapp_address,
        to: dapp_address,
        value: 0,
        contract: {
            function: "getDate",
            args: "[]"
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    });
}

function getYours(yourAddress) {
    var _from = yourAddress || dapp_address
    return myneb.api.call({
        from: _from,
        to: dapp_address,
        value: 0,
        contract: {
            function: "getYours",
            args: "[]"
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    });
}

function write(content, expire, cover, callback) {
    var _content = content,
        _expire = expire || 6000,
        _cover = cover || true,
        _call = callback || $.noop;
    if (!_content && _content.length <= 0) {
        console.log("内容不能为空")
        _call.call(this, {
            code: 1,
            msg: "内容不能为空"
        })
    } else if (_expire < 0) {
        console.log("过期时间不能为负数")
        _call.call(this, {
            code: 1,
            msg: "过期时间不能为负数"
        })
    } else {

        var callArgs = JSON.stringify([_content, _expire, _cover]);

        var _loopCall = null;
        var _listener = function (rep) {
            //   debugger;
            console.log(rep)
            if (typeof rep == "string" && rep.indexOf("Error") != -1) {
                clearTimeout(_loopCall)
            }
        }

        var serialNumber = nebPay.call(dapp_address, 0, "Write", callArgs, {
            qrcode: {
                showQRCode: true,
                container: undefined
            },
            goods: {
                name: "wirte",
                desc: "Wirte something for your futrue"
            },
            listener: _listener
        });
        // debugger;
        var _loopFunc = function () {
            console.log(serialNumber)
            nebPay.queryPayInfo(serialNumber).then(function (rep) {
                var data = JSON.parse(rep)
                if (data.code == 0) {
                    _call.call(this, data)
                } else {
                    _loopCall = setTimeout(_loopFunc, 1000)
                }
            }).catch(function (error) {
                console.error("run write error", error)
                _loopCall = setTimeout(_loopFunc, 1000)
            })
        }
        _loopCall = setTimeout(_loopFunc, 1000)
    }


}


function showLoading() {
    $("#modalLoading").modal("show")
}

function hideLoading() {
    $("#modalLoading").modal("hide")
}