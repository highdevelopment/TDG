'use strict';

var Common = require('./common.js');

module.exports = function(Verification) {
    Verification.checkAuth = async(phoneNo, verify_key, time) => {
        try {
            const query = {
                where: {
                    phoneNo: phoneNo,
                    authNo: verify_key,
                    result: 'Y',
                    createdAt: {
                        gt: Date.now() - time
                    }
                }
            }
            const result = await Verification.findOne(query);
            if (result) {
                return Promise.resolve(Common.makeResult(true, 'success'));
            } else {
                return Promise.resolve(Common.makeResult(false, 'failed'));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }
};
