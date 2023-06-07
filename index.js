"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memcached = require("memcached");
const KEY = `account1/balance`;
const DEFAULT_BALANCE = 100;
const memcachedClient = new memcached(`${process.env.ENDPOINT}:${process.env.PORT}`);
exports.chargeRequestMemcached = async function (input) {
    const remainingBalanceResult = await getBalanceMemcached(KEY);
    const originalBalance = Number(remainingBalanceResult[KEY]);
    var remainingBalance = originalBalance;
    const cas = Number(remainingBalanceResult.cas);
    const charges = getCharges();
    var isAuthorized = authorizeRequest(remainingBalance, charges);
    if (!authorizeRequest(remainingBalance, charges)) {
        return {
            remainingBalance,
            isAuthorized,
            charges: 0,
        };
    }
    remainingBalance = await chargeMemcached(KEY, remainingBalance, charges, cas);
    isAuthorized = originalBalance !== remainingBalance;
    return {
        remainingBalance,
        charges,
        isAuthorized,
    };
};
function authorizeRequest(remainingBalance, charges) {
    return remainingBalance >= charges;
}
function getCharges() {
    return DEFAULT_BALANCE / 20;
}
async function getBalanceMemcached(key) {
    return new Promise((resolve, reject) => {
        memcachedClient.gets(key, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
async function chargeMemcached(key, remainingBalance, charges, cas) {
    return new Promise((resolve, reject) => {
        memcachedClient.cas(key, remainingBalance-charges, cas, 0, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                if (result) {
                    return resolve(remainingBalance-charges);
                }
                return resolve(remainingBalance);
            }
        });
    });
}
