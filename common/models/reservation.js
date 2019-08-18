'use strict';

var Common = require('./common.js');

module.exports = function(Reservation) {
    Reservation.disableRemoteMethodByName("upsert");
    Reservation.disableRemoteMethodByName("find");
    Reservation.disableRemoteMethodByName("replaceOrCreate");
    Reservation.disableRemoteMethodByName("create");
  
    Reservation.disableRemoteMethodByName("prototype.updateAttributes");
    Reservation.disableRemoteMethodByName("findById");
    Reservation.disableRemoteMethodByName("exists");
    Reservation.disableRemoteMethodByName("replaceById");
    Reservation.disableRemoteMethodByName("deleteById");
  
    Reservation.disableRemoteMethodByName("createChangeStream");
  
    Reservation.disableRemoteMethodByName("count");
    Reservation.disableRemoteMethodByName("findOne");
  
    Reservation.disableRemoteMethodByName("update");
    Reservation.disableRemoteMethodByName("upsertWithWhere");

    // register
    Reservation.registerReservation = async(access_token, time1, time2, roomIndex, name, contact, memo) => {
        const Store = Reservation.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            if (!time2) {
                time2 = new Date();
                time2.setTime(time1.getTime() + 30 * 60 * 1000);
            }
            const isOverlapped = await Reservation.checkOverlapTime(storeObj, time1, time2, roomIndex);
            if (isOverlapped) {
                return Promise.resolve(Common.makeResult(false, 'overlapped', '해당 시간에는 이미 예약이 완료되여있습니다. 다른 시간대를 이용해 주세요.'));
            }
            const data = {
                time1: time1,
                time2: time2,
                status: false,
                roomIndex: roomIndex,
                name: name,
                contact: contact,
                memo: memo,
                createdAt: Date(),
                modifiedAt: Date()
            }
            const reservationObj = await storeObj.reservation.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', reservationObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Reservation.remoteMethod('registerReservation', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'time1', type: 'string', required: true, description: '시간1'},
            {arg: 'time2', type: 'string', required: false, description: '시간2'},
            {arg: 'roomIndex', type: 'number', required: true, description: '방번호'},
            {arg: 'name', type: 'string', required: true, description: '예약자이름'},
            {arg: 'contact', type: 'string', required: false, description: '연락처'},
            {arg: 'memo', type: 'string', required: false, description: '비고'},
        ],
        description: [
            '(매니저웹) 예약등록\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'time1: 시간1 부터\n',
                'time2: 시간2 까지\n',
                'name: 예약자이름\n',
                'contact: 연락처\n',
                'memo: 시간 부터\n',
            ]
        },
        http: {path:'/register', verb: 'post'}
    });

    // register
    Reservation.cancelReservation = async(access_token, reservationId) => {
        const Store = Reservation.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const reservationObj = await storeObj.reservation.destroy(reservationId);
            return Promise.resolve(Common.makeResult(true, 'success', reservationObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Reservation.remoteMethod('cancelReservation', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'reservationId', type: 'string', required: true, description: '예약아이디'},
        ],
        description: [
            '(매니저웹) 예약취소\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
            ]
        },
        http: {path:'/cancel', verb: 'post'}
    });

    Reservation.checkOverlapObj = async(storeObj, time1, time2, reservationObj) => {
        try {
            const query = {
                where: {
                    roomIndex: reservationObj.roomIndex,
                    or: [
                        {
                            time1: {
                                between: [time1, time2]
                            },
                        },
                        {
                            time2: {
                                between: [time1, time2]
                            },
                        }
                    ]
                }
            }
            const overlappedReservations = await storeObj.reservation.find(query);
            let isOverlapped = false;
            for (let i in overlappedReservations) {
                if (reservationObj.id.toString() != overlappedReservations[i].id.toString()) {
                    isOverlapped = true;
                    break;
                }
            }
            if (isOverlapped) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }

    Reservation.checkOverlapTime = async(storeObj, time1, time2, roomIndex) => {
        try {
            const query = {
                where: {
                    roomIndex: roomIndex,
                    or: [
                        {
                            time1: {
                                between: [time1, time2]
                            },
                        },
                        {
                            time2: {
                                between: [time1, time2]
                            },
                        }
                    ]
                }
            }
            const overlappedReservation = await storeObj.reservation.findOne(query);
            if (overlappedReservation) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }

    // register
    Reservation.updateReservation = async(access_token, reservationId, time1, time2, name, contact, memo) => {
        const Store = Reservation.app.models.Store;
        try {
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const reservationObj = await storeObj.reservation.findById(reservationId);
            if (!reservationObj) {
                return Promise.resolve(Common.makeResult(false, res_user.content, '예약아이디가 잘못되었습니다.'));
            }
            const isOverlapped = await Reservation.checkOverlapObj(storeObj, time1, time2, reservationObj);
            if (isOverlapped) {
                return Promise.resolve(Common.makeResult(false, 'overlapped', '해당 시간에는 이미 예약이 완료되여있습니다. 다른 시간대를 이용해 주세요.'));
            }
            const data = {
                time1: time1,
                time2: time2,
                status: false,
                name: name,
                contact: contact,
                memo: memo,
                modifiedAt: Date()
            }
            //const reservationObj = await storeObj.reservation.updateById(reservationId, data);
            await reservationObj.updateAttributes(data);
            return Promise.resolve(Common.makeResult(true, 'success', reservationObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Reservation.remoteMethod('updateReservation', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'reservationId', type: 'string', required: true, description: '예약아이디'},
            {arg: 'time1', type: 'string', required: true, description: '시간1'},
            {arg: 'time2', type: 'string', required: false, description: '시간2'},
            {arg: 'name', type: 'string', required: true, description: '예약자이름'},
            {arg: 'contact', type: 'string', required: false, description: '연락처'},
            {arg: 'memo', type: 'string', required: false, description: '비고'},
        ],
        description: [
            '(매니저웹) 예약변경\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
            ]
        },
        http: {path:'/update-reservation', verb: 'post'}
    });
    
    Reservation.getReservations = async(access_token, date) => {
        const Store = Reservation.app.models.Store;
        try {
            date.setHours(0, 0, 0);
            const date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0);
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const query_room = {
                fields: ['Index', 'name'],
                where: {
                    or: [
                        { status: 'waitting' },
                        { status: 'working' },
                    ],
                }
            }
            const rooms = await storeObj.room.find(query_room);
            const query_reserv = {
                fields: ['id', 'roomIndex', 'time1', 'time2', 'name', 'contact', 'memo', 'modifiedAt'],
                where: {
                    time1: {
                        between: [date, date2]
                    }
                }
            }
            const reservations = await storeObj.reservation.find(query_reserv);
            return Promise.resolve(Common.makeResult(true, 'success', {
                rooms_length: rooms.length,
                rooms: rooms,
                reservations: reservations
            }));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Reservation.remoteMethod('getReservations', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
            {arg: 'date', type: 'date', required: true, description: "조회날짜"},
        ],
        description: [
            '(매니저웹) 예약현황관리\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'time1: 시간1 부터\n',
                'time2: 시간2 까지\n',
                'name: 예약자이름\n',
                'contact: 연락처\n',
                'memo: 시간 부터\n',
            ]
        },
        http: {path:'/get-reservations', verb: 'get'}
    });
};
