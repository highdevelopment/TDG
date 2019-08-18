'use strict';

var Common = require('./common.js');

module.exports = function(Event) {
    Event.disableRemoteMethodByName("upsert");
    Event.disableRemoteMethodByName("find");
    Event.disableRemoteMethodByName("replaceOrCreate");
    Event.disableRemoteMethodByName("create");
  
    Event.disableRemoteMethodByName("prototype.updateAttributes");
    Event.disableRemoteMethodByName("findById");
    Event.disableRemoteMethodByName("exists");
    Event.disableRemoteMethodByName("replaceById");
    Event.disableRemoteMethodByName("deleteById");
  
    Event.disableRemoteMethodByName("createChangeStream");
  
    Event.disableRemoteMethodByName("count");
    Event.disableRemoteMethodByName("findOne");
  
    Event.disableRemoteMethodByName("update");
    Event.disableRemoteMethodByName("upsertWithWhere");


    
    Event.getEvents_v2 = async(search, condition, pageNum, pageIndex) => {
        if (!search) search = '';
        if (!condition) condition = 0;
        const query = {
            where: {
                title: {like: search, options: 'i'}
            },
            limit: pageNum,
            skip: pageNum * pageIndex,
            order: 'modifiedAt DESC'
        }
        if (condition == 1 || condition == 2) {
            query.where.status = condition;
        }
        try {
            const events = await Event.find(query);
            const length = await Event.count(query.where);
            events.map(event => {
                event.photo = event.photo ? Common.FILE_SERVER_PATH + event.photo : '';
            })
            return Promise.resolve(Common.makeResult(true, 'success', {
                events: events,
                length: length
            }));
        } catch(e) {
            return Promise.reject(e);
        }
    }

    Event.getEvents = async(search, condition, pageNum, pageIndex) => {
        if (!search) search = '';
        if (!condition) condition = 0;
        const query = {
            where: {
                title: {like: search, options: 'i'}
            },
            limit: pageNum,
            skip: pageNum * pageIndex,
            order: 'modifiedAt DESC'
        }
        if (condition == 1 || condition == 2) {
            query.where.status = condition;
        }
        try {
            const events = await Event.find(query);
            events.map(event => {
                event.photo = event.photo ? Common.FILE_SERVER_PATH + event.photo : '';
            })
            return Promise.resolve(Common.makeResult(true, 'success', events));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Event.remoteMethod('getEvents', {
        accepts: [
            {arg: 'search', type: 'string', description: '검색문자렬, 빈문자렬일때 전체검색, 아니면 제목검색'},
            {arg: 'condition', type: 'number', description: '전체 0, 종료된 이벤트 1, 진행중인 이벤트 2'},
            {arg: 'pageNum', type: 'number'},
            {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(전체) 전체이벤트창에서 이벤트내용목록\n'
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'title: 이벤트제목\n',
                'content: 이벤트내용\n',
                'photo: 이벤트 이미지파일경로\n',
                'visit: 조회수\n',
                'status: 0: 대기중, 1: 진행중, 2: 완료\n',
                'startAt: 시작날짜\n',
                'endAt: 마감날짜\n',
            ]
        },
        http: {path:'/get-events', verb: 'get'}
    });


    // register
    Event.registerEvent = async(title, content, photo, image_main, startAt, endAt) => {
        try {
            const Container = Event.app.models.Container;
            const data = {
                title: title,
                content: content,
                photo: photo,
                image_main: image_main,
                status: 0,
                startAt: startAt,
                endAt: endAt,
                createdAt: Date(),
                modifiedAt: Date(),
            }
            let eventObj = await Event.create(data);
            if (photo) {
                const newPath = await Container.ayncMoveFile(photo, 'event/' + eventObj.id);
                if (newPath) {
                    eventObj = await eventObj.updateAttribute('photo', newPath);
                } else {
                    return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                }
            }
            if (image_main) {
                const newPath = await Container.ayncMoveFile(image_main, 'event/' + eventObj.id);
                if (newPath) {
                    eventObj = await eventObj.updateAttribute('image_main', newPath);
                } else {
                    return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                }
            }
            return Promise.resolve(Common.makeResult(true, 'success', eventObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Event.remoteMethod('registerEvent', {
        accepts: [
            {arg: 'title', type: 'string', required: true, description: '제목'},
            {arg: 'content', type: 'string', required: true, description: '내용'},
            {arg: 'photo', type: 'string', required: false, description: '이미지파일경로'},
            {arg: 'image_main', type: 'string', required: false, description: '메인이미지파일경로'},
            {arg: 'startAt', type: 'string', required: false, description: '시작날짜'},
            {arg: 'endAt', type: 'string', required: false, description: '마감날짜'},
        ],
        description: [
            '(어드민) 이벤트를 새로 등록할때\n',
        ],
        returns: {
        arg: 'res',
        type: 'string',
        description: [
            'title: 이벤트제목\n',
            'content: 이벤트내용\n',
            'photo: 이벤트 이미지파일경로\n',
            'visit: 조회수\n',,
            'status: 0: 대기중, 1: 진행중, 2: 완료\n',
            'startAt: 시작날짜\n',
            'endAt: 마감날짜\n',
        ]
        },
        http: {path:'/register-event', verb: 'post'}
    });


    // get events
    Event.getEvent = async(eventId, access_token) => {
        const Accounts = Event.app.models.Accounts;
        const AccessLogs = Event.app.models.AccessLogs;
        try {
            const query = {
                fields: ['title', 'content', 'photo', 'image_main', 'visit', 'status', 'startAt', 'endAt', 'createdAt', 'modifiedAt']
            }
            let event = await Event.findById(eventId);
            if (!event) {
                return Promise.resolve(Common.makeResult(false, 'wrong eventId'));
            }
            if (event.photo) {
                event.photo = Common.FILE_SERVER_PATH + event.photo;
            }
            if (event.image_main) {
                event.image_main = Common.FILE_SERVER_PATH + event.image_main;
            }
            if (access_token) {
              const res_user = await Accounts.getSelfInfo(access_token);
              if (res_user.success) {
                const userObj = res_user.result;
                await AccessLogs.registerLog(userObj, 1, event);
              }
            }
            return Promise.resolve(Common.makeResult(true, 'success', event));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Event.remoteMethod('getEvent', {
        accepts: [
            {arg: 'eventId', type: 'string', required: true, description: '이벤트목록에서 얻은 목록결과에서 id'},
            {arg: 'access_token', type: 'string', required: false, description: '공지를 열람하는 유저의 토큰'}
        ],
        description: [
            '(전체) 목록에서 선택한 이벤트내용을 표시\n'
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'title: 이벤트제목\n',
                'content: 이벤트내용\n',
                'photo: 이벤트 이미지파일경로\n',
                'image_main: 메인이미지파일경로\n',
                'visit: 조회수\n',
                'status: 0: 대기중, 1: 진행중, 2: 완료\n',
                'startAt: 시작날짜\n',
                'endAt: 마감날짜\n',
            ]
        },
        http: {path:'/get-event', verb: 'get'}
    });

    // update event
    Event.updateEvent = async(eventId, title, content, photo, image_main, status, startAt, endAt) => {
        try {
            const Container = Event.app.models.Container;
            const eventObj = await Event.findById(eventId);
            if (eventObj.photo != photo) {
                const newPath = await Container.ayncMoveFile(photo, 'event/' + eventId);
                if (newPath) {
                    photo = newPath;
                } else {
                    return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                }
            }
            if (event.image_main != image_main) {
                const newPath = await Container.ayncMoveFile(image_main, 'event/' + eventId);
                if (newPath) {
                    image_main = newPath;
                } else {
                    return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                }
            }
            const data = {
                title: title,
                content: content,
                photo: photo,
                image_main: image_main,
                status: status,
                startAt: startAt,
                endAt: endAt,
                modifiedAt: Date(),
            }
            const res = await eventObj.updateAttributes(data);
            return Promise.resolve(Common.makeResult(true, 'success', res));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Event.remoteMethod('updateEvent', {
        accepts: [
            {arg: 'eventId', type: 'string', required: true, description: '이벤트목록에서 얻은 목록결과에서 id'},
            {arg: 'title', type: 'string', required: true, description: '이벤트제목'},
            {arg: 'content', type: 'string', required: true, description: '이벤트내용'},
            {arg: 'photo', type: 'string', required: false, description: '이미지파일경로'},
            {arg: 'image_main', type: 'string', required: false, description: '메인이미지파일경로'},
            {arg: 'status', type: 'number', required: false, description: '0: 대기중, 1: 진행중, 2: 완료'},
            {arg: 'startAt', type: 'string', required: false, description: '시작날짜'},
            {arg: 'endAt', type: 'string', required: false, description: '마감날짜'},
        ],
        description: [
            '(어드민) 수정된 이벤트내용을 보관\n'
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '수정된 이벤트결과를 출력'
        },
        http: {path:'/update-event', verb: 'post'}
    });

    
    // delete event
    Event.deleteEvent = async(eventId) => {
        try {
            const res = await Event.deleteById(eventId);
            return Promise.resolve(Common.makeResult(true, 'success', res));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Event.remoteMethod('deleteEvent', {
        accepts: [
            {arg: 'eventId', type: 'string', required: true, description: '이벤트 ID'},
        ],
        description: [
            '(어드민) 이벤트를 삭제\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: ''
        },
        http: {path:'/delete-event', verb: 'post'}
    });
};
