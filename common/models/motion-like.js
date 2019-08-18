'use strict';

module.exports = function(Motionlike) {
    Motionlike.registerLike = async(motionObj, userId) => {
        try {
            const query = {
                where: {
                    accountId: userId
                }
            }
            const logObj = await motionObj.likes.findOne(query);
            let result;
            if (!logObj) {
                result = await motionObj.likes.create({
                    createdAt: Date(),
                    accountId: userId
                });
                const count = await motionObj.likes.count();
                await motionObj.updateAttribute('like', count);
            }
            return Promise.resolve(result);
        } catch(e) {
            return Promise.reject(e);
        }
    }
};
