'use strict';

var Common = require('./common.js');

module.exports = function(AppNotify) {

    AppNotify.disableRemoteMethodByName("upsert");
    AppNotify.disableRemoteMethodByName("find");
    AppNotify.disableRemoteMethodByName("replaceOrCreate");
    AppNotify.disableRemoteMethodByName("create");
  
    AppNotify.disableRemoteMethodByName("prototype.updateAttributes");
    AppNotify.disableRemoteMethodByName("findById");
    AppNotify.disableRemoteMethodByName("exists");
    AppNotify.disableRemoteMethodByName("replaceById");
    AppNotify.disableRemoteMethodByName("deleteById");
  
    AppNotify.disableRemoteMethodByName("createChangeStream");
  
    AppNotify.disableRemoteMethodByName("count");
    AppNotify.disableRemoteMethodByName("findOne");
  
    AppNotify.disableRemoteMethodByName("update");
    AppNotify.disableRemoteMethodByName("upsertWithWhere");

    AppNotify.registerDevice = async(device_token, userObj) => {
        // var Accounts = AppNotify.app.models.Accounts;
        const query = {
            where: {
                access_token: device_token
            }
        }
        const appNotifies = await AppNotify.find(query);
        if (appNotifies.length > 0) {
        } else {
            const data = {
                access_token: device_token,
                createdAt: Date()
            }
            const appNotify = await userObj.app_notify.create(data);
        }
        return Promise.resolve(appNotify);
    }
};
