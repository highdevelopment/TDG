'use strict';
var Common = require('./common.js');

module.exports = function(CashLog) {
    CashLog.disableRemoteMethodByName("upsert");
    CashLog.disableRemoteMethodByName("find");
    CashLog.disableRemoteMethodByName("replaceOrCreate");
    CashLog.disableRemoteMethodByName("create");
  
    CashLog.disableRemoteMethodByName("prototype.updateAttributes");
    CashLog.disableRemoteMethodByName("findById");
    CashLog.disableRemoteMethodByName("exists");
    CashLog.disableRemoteMethodByName("replaceById");
    CashLog.disableRemoteMethodByName("deleteById");
  
    CashLog.disableRemoteMethodByName("createChangeStream");
  
    CashLog.disableRemoteMethodByName("count");
    CashLog.disableRemoteMethodByName("findOne");
  
    CashLog.disableRemoteMethodByName("update");
    CashLog.disableRemoteMethodByName("upsertWithWhere");


    // register
    CashLog.managerChargeCash = async(access_token, amount, payment_method) => {
        const Store = CashLog.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            storeObj.cash = storeObj.cash + amount;
            const count = await CashLog.count();
            const data = {
                payment_no: 1000 + count + 1,
                cash: storeObj.cash,
                amount: amount,
                type: 'charge',
                payment_method: payment_method,
                releasedAt: Date(),
                createdAt: Date(),
                storeName: storeObj.storeName,
                manager_name: storeObj.manager_name,
            }
            const cashLogObj = await storeObj.cashLog.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', cashLogObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('managerChargeCash', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'amount', type: 'number', required: true, description: '결제량'},
            {arg: 'payment_method', type: 'string', required: false, description: '결제방식 (none 무통장입금)'},
        ],
        description: [
            '(매니저웹) 충전\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'cash: 현재 매장의 캐쉬\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'releasedAt: 결제일\n'
            ]
        },
        http: {path:'/manager-charge', verb: 'post'}
    });

    
    
    CashLog.getManagerChargeLogs = async(access_token, startDate, endDate) => {
        const Store = CashLog.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const qurey = {
                fields: ['payment_no', 'cash', 'amount', 'type', 'releasedAt', 'payment_method', 'verify', 'storeName', 'manager_name'],
                where: {
                    type: 'charge',
                    releasedAt: {
                        between: [startDate, endDate]
                    }
                }
            };
            const results = await storeObj.cashLog.find(qurey);
            return Promise.resolve(Common.makeResult(true, 'success', results));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('getManagerChargeLogs', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'startDate', type: 'date', required: true, description: "조회시작일"},
            {arg: 'endDate', type: 'date', required: true, description: "조회마감일"}
        ],
        description: [
            '(매니저웹) 충전내역\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'releasedAt: 결제일\n',
                'payment_method: 결제방식 (none 무통장입금)\n',
                'verify: 0: 승인대기, 1: 대기, 2: 삭제됨',
                'storeName: 매장이름\n',
                'manager_name: 매니저이름\n'
            ]
        },
        http: {path:'/get-manager-chargelogs', verb: 'get'}
    });


    
    // register
    CashLog.managerPaymentCash = async(storeId) => {
        const Store = CashLog.app.models.Store;
        try {
            const storeObj = await Store.findById(storeId);
            if (!storeObj) {
              return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
            }
            
            const qurey = {
                fields: ['releasedAt'],
                where: {
                    type: 'pay',
                },
                order: 'releasedAt DESC'
            };
            const res_payment = await Store.getPaymentAmount(storeObj);
            const res_cashlog = await storeObj.cashLog.findOne(qurey);
            if (res_cashlog) {
                if (res_cashlog.releasedAt.getYear() == res_payment.lastPaidDate.getYear() &&
                res_cashlog.releasedAt.getMonth() == res_payment.lastPaidDate.getMonth()) {
                    return Promise.resolve(Common.makeResult(false, 'alreay paid'));
                }
            }
            storeObj.cash = storeObj.cash - res_payment.payment_month;
            const count = await CashLog.count();
            const data = {
                payment_no: 1000 + count + 1, 
                cash: storeObj.cash,
                amount: res_payment.payment_month,
                type: 'pay',
                payment_method: 'tdg',
                releasedAt: Date(),
                createdAt: Date(),
                storeName: storeObj.storeName,
                manager_name: storeObj.manager_name,
            }
            await storeObj.updateAttribute('cash', storeObj.cash);
            const cashLogObj = await storeObj.cashLog.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', cashLogObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('managerPaymentCash', {
        accepts: [
            {arg: 'storeId', type: 'string', required: true, description: "매장아이디"},
        ],
        description: [
            '(매니저웹) 지불\n'
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'cash: 현재 매장의 캐쉬\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'releasedAt: 결제일\n'
            ]
        },
        http: {path:'/manager-payment', verb: 'post'}
    });


    CashLog.getManagerPayLogs = async(access_token, year) => {
        const Store = CashLog.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const startDate = new Date(year, 0, 0, 0, 0, 0, 0);
            const endDate = new Date(year + 1, 0, 0, 0, 0, 0, 0);
            const qurey = {
                fields: ['payment_no', 'amount', 'releasedAt', 'storeName', 'manager_name'],
                where: {
                    type: 'pay',
                    releasedAt: {
                        between: [startDate, endDate]
                    }
                }
            };
            const results = await storeObj.cashLog.find(qurey);
            return Promise.resolve(Common.makeResult(true, 'success', results));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('getManagerPayLogs', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'year', type: 'number', required: true, description: "조회년도"},
        ],
        description: [
            '(매니저웹) 납부내역\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'amount: 결제량\n',
                'releasedAt: 납부일\n',
            ]
        },
        http: {path:'/get-manager-paylogs', verb: 'get'}
    });


    
    CashLog.getNewChargeLogs = async() => {
        try {
            const qurey = {
                fields: ['id', 'payment_no', 'cash', 'amount', 'type', 'createdAt', 'payment_method', 'verify', 'storeName', 'manager_name'],
                where: {
                    type: 'charge',
                    verify: 0,
                },
                order: 'createdAt DESC'
            };
            const logs = await CashLog.find(qurey);
            return Promise.resolve(Common.makeResult(true, 'success', logs));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('getNewChargeLogs', {
        accepts: [
        ],
        description: [
            '(어드민웹) 충전현황 (새로 등록된 충전로그들)\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'createdAt: 충전일\n',
                'payment_method: 결제방식 (none 무통장입금)\n',
                'verify: 0: 승인대기, 1: 대기, 2: 삭제됨\n',
                'storeName: 매장이름\n',
                'manager_name: 매니저이름\n'
            ]
        },
        http: {path:'/get-new-chargelogs', verb: 'get'}
    });
    
    CashLog.verifyChargeLog = async(logId) => {
        const Store = CashLog.app.models.Store;
        try {
            const logObj = await CashLog.findById(logId);
            if (!logObj) return Promise.resolve(Common.makeResult(false, 'wrong logId'));
            if (logObj.verify == 1) return Promise.resolve(Common.makeResult(false, 'this cash log is verified already', '이 기록은 이미 승인된 캐쉬입니다. 페이지를 다시 로드해주십시오.'));
            if (logObj.amount <= 0) return Promise.resolve(Common.makeResult(false, 'error', '충전금액이 잘못되였습니다. 다시 확인해주세요.'));
            const data = {
                verify: 1,
                releasedAt: Date()
            }
            const results = await logObj.updateAttributes(data);
            if (results) {
                let storeObj = await Store.findById(logObj.storeId);
                storeObj = await storeObj.updateAttribute('cash', storeObj.cash + logObj.amount);
                if (storeObj) {
                    return Promise.resolve(Common.makeResult(true, 'success', storeObj));
                } else {
                    return Promise.resolve(Common.makeResult(false, 'error', '삭제된 매장의 기록입니다. 확인해주세요.'));
                }
            }
            return Promise.resolve(Common.makeResult(false, 'error', '자료기지접근실패'));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('verifyChargeLog', {
        accepts: [
            {arg: 'logId', type: 'string', required: true, description: "로그아이디" },
        ],
        description: [
            '(어드민웹) 충전승인 (새로 등록된 충전로그를 승인)\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'releasedAt: 결제일\n',
                'payment_method: 결제방식 (none 무통장입금)\n',
                'verify: 0: 승인대기, 1: 대기, 2: 삭제됨',
                'storeName: 매장이름\n',
                'manager_name: 매니저이름\n'
            ]
        },
        http: {path:'/verify-chargelog', verb: 'post'}
    });

    CashLog.getChargeLogs = async(startDate, endDate) => {
        try {
            endDate.setDate(endDate.getDate() + 1);
            const qurey = {
                fields: ['payment_no', 'cash', 'amount', 'type', 'releasedAt', 'payment_method', 'verify', 'storeName', 'manager_name'],
                where: {
                    type: 'charge',
                    verify: 1,
                    releasedAt: {
                        between: [startDate, endDate]
                    }
                },
                order: 'releasedAt DESC'
            };
            const results = await CashLog.find(qurey);
            return Promise.resolve(Common.makeResult(true, 'success', results));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CashLog.remoteMethod('getChargeLogs', {
        accepts: [
            {arg: 'startDate', type: 'date', required: true, description: "조회시작일, 기정값(한달전)" },
            {arg: 'endDate', type: 'date', required: true, description: "조회마감일, 기정값(현재 시간)"}
        ],
        description: [
            '(어드민웹) 충전내역\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'payment_no: 결제번호\n',
                'amount: 결제량\n',
                'type: charge: 충전, pay: 납부, excharge: 환전\n',
                'releasedAt: 결제일\n',
                'payment_method: 결제방식 (none 무통장입금)\n',
                'verify: 0: 승인대기, 1: 대기, 2: 삭제됨',
                'storeName: 매장이름\n',
                'manager_name: 매니저이름\n'
            ]
        },
        http: {path:'/get-chargelogs', verb: 'get'}
    });

};
