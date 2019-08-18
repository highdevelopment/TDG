'use strict';

module.exports = function(AccessLogs) {
    AccessLogs.registerLog = async(userObj, type, documentObj) => {
        try {
            const query = {
                where: {
                    type: type,
                    documentId: documentObj.id.toString()
                }
            }
            const logObj = await userObj.AccessLogs.findOne(query);
            let result;
            if (logObj) {
                result = await logObj.updateAttribute('readAt', Date());
            } else {
                result = await userObj.AccessLogs.create({
                    readAt: Date(),
                    type: type,
                    documentId: documentObj.id
                });
                await documentObj.updateAttribute('visit', documentObj.visit + 1);
            }
            return Promise.resolve(logObj);
        } catch(e) {
            return Promise.reject(e);
        }
    }

    AccessLogs.unreadDocuments = async(userObj) => {
        const Notices = AccessLogs.app.models.Notices;
        const Event = AccessLogs.app.models.Event;
        const result = {
            notices: [],
            events: [],
            questions: []
        };
        try {
            const query_doc = {
                fields: ['id', 'title', 'createdAt'],
                where: {
                    createdAt: {gte: Date.now() - 1000 * 3600 * 24 * 7}
                }
            }
            const notices = await Notices.find(query_doc);
            const events = await Event.find(query_doc);
            await Promise.all(notices.map(async notice => {
                const query = {
                    where: {
                        type: 0,
                        documentId: notice.id
                    }
                }
                const logObj = await userObj.AccessLogs.findOne(query);
                if (!logObj) {
                    result.notices.push(notice);
                }
            }))
            await Promise.all(events.map(async event => {
                const query = {
                    where: {
                        type: 1,
                        documentId: event.id
                    }
                }
                const logObj = await userObj.AccessLogs.findOne(query);
                if (!logObj) {
                    result.events.push(event);
                }
            }))
            return Promise.resolve(result);
        } catch(e) {
            return Promise.reject(e);
        }
    }
};
