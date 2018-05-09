"use strict";

var ForFuture = function () {
    LocalContractStorage.defineProperty(this, "Owner");
    LocalContractStorage.defineProperty(this, "Count",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });
    LocalContractStorage.defineMapProperty(this, "Content", {
        stringify: function (obj) {
            return JSON.stringify(obj);
        },
        parse: function (str) {
            return JSON.parse(str);
        }
    });
};

ForFuture.prototype = {
    init: function () {
        this.Owner = Blockchain.transaction.from;
        this.Count = 0;
    },
    _isOwner: function () {
        return this.Owner === Blockchain.transaction.from ? true : false;
    },
    transfer: function (address, value) {
        if (this._isOwner()) {
            Blockchain.transfer(address, value);
        } else {
            throw new Error("only owner invoke")
        }
    },
    Write(str, expire, cover) {
        if (!str && !expire) {
            throw new Error(" Invalid arguments");
        }
        var fromAddress = Blockchain.transaction.from,
            _expire = new BigNumber(expire),
            now = new BigNumber(Date.now());

        if (_expire.isNaN()) {
            throw new Error(" Invalid arguments");
        }
        if (!_expire.gte(0)) {
            throw new Error("expire time mustbe great than 0");
        }

        var calculateExpire = now.plus(_expire).toString();

        var beforeContent = this.Content.get(fromAddress);
        if (!beforeContent) {
            this.Content.put(fromAddress, {
                text: str,
                expire: calculateExpire
            })
            this.Count +=1;
        } else {
            if (!!cover) {
                this.Content.put(fromAddress, {
                    text: str,
                    expire: calculateExpire
                })
            } else {
                return {
                    statues: -1,
                    msg: "your are write something already,if u want cover your writed ,use cover=true"
                };
            }
        }


    },
    getYours() {
        var fromAddress = Blockchain.transaction.from,
            saveContent = this.Content.get(fromAddress);

        if (!saveContent) {
            return {
                status: -1
            };
        } else {
            var expireDate = new BigNumber(saveContent.expire),
                now = new BigNumber(Date.now());
            if (now.lte(expireDate)) {
                return {
                    status: -2,
                    expire: saveContent.expire
                };
            } else {
                return {
                    status: 1,
                    content: saveContent.text
                };
            }
        }
    },
    getDate:function(){
        return Date.now();
    },
    getCount:function(){
        return this.Count;
    }
}
module.exports = ForFuture;