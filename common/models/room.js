'use strict';

var Common = require('./common.js');

module.exports = function(Room) {
  Room.disableRemoteMethodByName("upsert");
  Room.disableRemoteMethodByName("find");
  Room.disableRemoteMethodByName("replaceOrCreate");
  Room.disableRemoteMethodByName("create");

  Room.disableRemoteMethodByName("prototype.updateAttributes");
  Room.disableRemoteMethodByName("findById");
  Room.disableRemoteMethodByName("exists");
  Room.disableRemoteMethodByName("replaceById");
  Room.disableRemoteMethodByName("deleteById");

  Room.disableRemoteMethodByName("createChangeStream");

  Room.disableRemoteMethodByName("count");
  Room.disableRemoteMethodByName("findOne");

  Room.disableRemoteMethodByName("update");
  Room.disableRemoteMethodByName("upsertWithWhere");

  Room.disableRemoteMethodByName('prototype.__get__game');
  Room.disableRemoteMethodByName('prototype.__create__game');
  Room.disableRemoteMethodByName('prototype.__delete__game');
  Room.disableRemoteMethodByName('prototype.__findById__game');
  Room.disableRemoteMethodByName('prototype.__updateById__game');
  Room.disableRemoteMethodByName('prototype.__destroyById__game');
  Room.disableRemoteMethodByName('prototype.__count__game');

  // Check PC
  // Room.checkingPC = async(roomId, cb) => {
  //   const query = {
  //     where: {
  //       sensorId: sensorId,
  //       pcId: pcId,
  //       or: [
  //         { status: 'waitting' },
  //         { status: 'working' }
  //       ]
  //     }
  //   };
  //   try {
  //     let roomObj = await Room.findById(roomId);
  //     if (roomObj) {
  //       if (roomObj.status == 'waitting') {
  //         roomObj = await Room.updateAttribute('status', 'working');
  //       }
  //       const game = await roomObj.game();
  //       const result = {
  //         Index: roomObj.Index,
  //         name: roomObj.name,
  //         status: roomObj.status,
  //         courseName: game.course_name,
  //         gameMode: game.game_mode,
  //         startedAt: startedAt,
  //         // endedAt: endedAt

  //       }
  //       return Promise.resolve(Common.makeResult(true, 'success', result));
  //     } else {
  //       return Promise.resolve(Common.makeResult(false, 'wrong id'));
  //     }
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // }

  // Room.remoteMethod('checkingPC', {
  //   accepts: [
  //     {arg: 'roomId', type: 'string', required: true, description: 'room id'},
  //   ],
  //   description: [
  //     '(프로그램) 현재 피시의 상태를 기록.\n',
  //     'Role: everyone',
  //   ],
  //   returns: {arg: 'res', type: 'object'},
  //   http: {path:'/checking-pc', verb: 'post'}
  // });

  // Check PC
  Room.startPC = async(sensorId, pcId, handType, req, res) => {
    var Store = Room.app.models.Store;
    try {
      const query = {
        where: {
          sensorId: sensorId,
          pcId: pcId,
          or: [
            { status: 'new' },
            { status: 'waitting' },
            { status: 'deleted' },
            { status: 'working' },
            { status: 'stopped' },
          ]
        }
      };
      const roomObj = await Room.findOne(query);
      if (roomObj) {
        const store = await Store.findOne({where: {id: roomObj.storeId}});
        if (!store) {
          return Promise.resolve(Common.makeResult(false, 'the store is not registered'));
        } else {
          if (roomObj.status == 'stopped') {
            return Promise.resolve(Common.makeResult(false, 'this pc is stopped.'));
          } else if (roomObj.status == 'deleted') {
            return Promise.resolve(Common.makeResult(false, 'this pc is deleted.'));
          } else if (roomObj.status == 'working' || roomObj.status == 'waitting') {
            const res = await Store.managerInfo(store);
            if (!res.success) {
              return Promise.resolve(Common.makeResult(false, res.content));
            } else {
              if (roomObj.handType != handType) await roomObj.updateAttribute('handType', handType);

              const data2 = {
                playStatus: Common.PLAY_STATUS.kPlayStatus_Stopped,
                playStartTime: Date(),
                playEndTime: Date(),
              };
              await roomObj.updateAttributes(data2); // 프로그램 시작시 초기화
              const manager = res.result;
              return Promise.resolve(Common.makeResult(true, 'success', {
                roomId: roomObj.id,
                managerName: manager.username,
                storeName: store.storeName,
                roomIndex: roomObj.Index,
                roomName: roomObj.name,
                machineType: roomObj.machineType ? roomObj.machineType : 0
              }));
            }
          } else if (roomObj.status == 'new') {
            return Promise.resolve(Common.makeResult(false, 'this pc is not verified.'));
          } else {
            return Promise.resolve(Common.makeResult(false, 'status error'));
          }
        }
      } else {
        return Promise.resolve(Common.makeResult(false, 'this pc is not registered'));
      }
    } catch(e) {
      return Promise.resolve(Common.makeResult(false, e.message));
    }
  }

  Room.remoteMethod('startPC', {
    accepts: [
      {arg: 'sensorId', type: 'string', required: true, description: 'sensor id'},
      {arg: 'pcId', type: 'string', required: true, description: 'pc id'},
      {arg: 'handType', type: 'number', required: false, description: '센서없음 0, 우타 1, 양타 2, 좌타 3'},
      { arg: 'req', type: 'object', http: { source:'req' } },
      { arg: 'res', type: 'object', http: { source:'res' } },
    ],
    description: [
      '(프로그램) 현재 피시가 등록되여 있는지를 체크.\n',
      'Role: everyone',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/start-pc', verb: 'post'}
  });



  // register PC
  Room.registerPC = async(managerId, password, roomNumber, sensorId, pcId, name, machineType) => {
    var Accounts = Room.app.models.Accounts;
    const query = {
      where: {
        sensorId: sensorId,
        pcId: pcId
      }
    };
    try {
      const pcs = await Room.find(query);
      if (!machineType) machineType = 0;
      if (pcs.length > 0) {
        return Promise.resolve(Common.makeResult(false, 'This PC is already registered.'));
      }
      const manager = await Accounts.findOne({where: {username: managerId}});
      if (!manager)
        return Promise.resolve(Common.makeResult(false, 'Wrong Manager ID.'));
      if (manager.role != 'manager') {
        return Promise.resolve(Common.makeResult(false, 'This User is not a Manager.'));
      }
      const store = await manager.store.get();
      if (!store) {
        return Promise.resolve(Common.makeResult(false, 'This Manager has no Store.'));
      }

      const credentials = {
        email: manager.email,
        password: password
      }
      const account = await Accounts.login(credentials);
      if (!account) {
        return Promise.resolve(Common.makeResult(false, 'Wrong Password.'));
      }
      const query2 = {
        where: {
          Index: roomNumber
        }
      };
      const room = await store.room.findOne(query2);
      if (room) {
        return Promise.resolve(Common.makeResult(false, 'Room number is already registered.'));
      }

      const room_data = {
        Index: roomNumber,
        sensorId: sensorId,
        pcId: pcId,
        name: name,
        machineType: machineType,
        createdAt: Date(),
        modifiedAt: Date(),
      }
      const model = await store.room.create(room_data);
      return Promise.resolve(Common.makeResult(true, 'success', model));
    }
    catch(e) {
      if (e.code == 'LOGIN_FAILED') {
        return Promise.resolve(Common.makeResult(false, 'Wrong Password.'));
      }
      return Promise.reject(e);
    }
  }


  Room.remoteMethod('registerPC', {
    accepts: [
      {arg: 'managerId', type: 'string', required: true, description: '관리자 아이디'},
      {arg: 'password', type: 'string', required: true, description: '암호'},
      {arg: 'roomNumber', type: 'number', required: true, description: '룸번호'},
      {arg: 'sensorId', type: 'string', required: true, description: '센서아이디'},
      {arg: 'pcId', type: 'string', required: true, description: '피씨아이디'},
      {arg: 'name', type: 'string', required: true, description: '방에 대한 코멘트'},
      {arg: 'machineType', type: 'number', required: false, description: '장비형태'},
    ],
    description: [
      '(프로그램) 룸에 설치된 피시를 새로 등록한다.\n',
      'Role: everyone',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/register-pc', verb: 'post'}
  });



  // delete
  Room.deleteRoomById = async(roomId) => {
    try {
      let roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong Id'));
      } else {
        roomObj = await roomObj.updateAttribute('status', 'deleted');
        return Promise.resolve(Common.makeResult(true, 'success', roomObj));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Room.remoteMethod('deleteRoomById', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: '룸목록을 얻는 getstore()에서 result.rooms.id'},
    ],
    description: [
      '(어드민) 점주등록창에서 룸을 삭제하는 단추를 클릭하였을때'
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/delete-room', verb: 'post'}
  });

  // stop
  Room.stopRoomById = async(roomId, isStop) => {
    try {
      let roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong Id'));
      } else {
        if (isStop) {
          roomObj = await roomObj.updateAttribute('status', 'stopped');
        } else {
          roomObj = await roomObj.updateAttribute('status', 'waitting');
        }
        return Promise.resolve(Common.makeResult(true, 'success', roomObj));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Room.remoteMethod('stopRoomById', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: '룸목록에서 result.rooms.id'},
      {arg: 'isStop', type: 'boolean', required: true, description: '장비를 스톱시킬때 true, 다시 해제할때 false'},
    ],
    description: [
      '시설제어창에서 장비를 스톱시킬때\n',
      'Role: admin only',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/stop-room', verb: 'post'}
  });

  // quit game
  Room.quitGameAtRoom = async(roomId) => {
    const RoomLogs = Room.app.models.RoomLogs;
    try {
      let roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong Id'));
      } else {
        if (roomObj.machineType == 0) {
          const data = {
            playStatus: Common.PLAY_STATUS.kPlayStatus_Stopped,
            playStartTime: Date(),
            playEndTime: Date(),
          }
          await RoomLogs.endGame(roomObj);
          roomObj = await roomObj.updateAttributes(data);
        }
        
        return Promise.resolve(Common.makeResult(true, 'success', roomObj));
      }
    } catch(e) {
      return Promise.resolve(Common.makeResult(false, e.message));
    }
  };
  Room.remoteMethod('quitGameAtRoom', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: 'rooms.id'},
    ],
    description: [
      '(프로그램) 게임프로그램을 끌때\n',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/quit-room', verb: 'post'}
  });

  Room.getNewRoom = async function(cb) {
    var Store = Room.app.models.Store;
    const query = {
      where: {
        status: 'new'
      }
    }
    try {
      const rooms = await Room.find(query);
      let result = [];
      const grouped = Common.groupBy(rooms, room => room.storeId.toString());
      const storeIds = Array.from(grouped.keys());
      await Promise.all(storeIds.map(async storeId => {
        const data = {};
        const newRooms = grouped.get(storeId);
        data.new_room_num = newRooms.length;
        data.rooms = [];
        for (let room of newRooms) {
          data.rooms.push(room.id);
        }
        const storeObj = await Store.findById(storeId);
        const query2 = {
          where: {
            or: [
              { status: 'waitting' },
              { status: 'working' }
            ]
          }
        }
        const rooms = await storeObj.room.find(query2);
        data.room_num = rooms.length;
        data.store_info = storeObj;
        //const storeObj = await Store.findById(storeId);
        data.storeId = storeId;
        result.push(data);
      }))
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(err){
      console.error(e);
      return Promise.reject(e);
    }
  }

  Room.remoteMethod('getNewRoom', {
    accepts: [
    ],
    description: [
      '(어드민) 시스템관리페이지에서 새로 등록된 피시의 룸과 스토어를 표시\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '새로 등록된 피시가 속한 매장들의 자료의 배렬\n',
        'room_num: 매장의 현재 사용중인 피시개수\n',
        'new_room_num: 매장에 새로 등록신청된 피시개수\n',
        'rooms: 새로 등록신청된 룸배렬\n',
        'store_info: 매장정보\n',
        '\tmanager_name: 점주명\n',
        '\tstoreName: 점포명\n',
        '\tstoreAddress: 설치주소\n',
        '\tcustomer_branch: 영업지사\n',
        '\tcustomer_name: 영업담당자 이름\n',
        '\tcontractDate: 계약일\n',
        'storeId: 매장디비아이디\n',
      ]
    },
    http: {path:'/new-rooms', verb: 'get'}
  });


  Room.verifyRooms = async function(storeId, rooms, cb) {
    if (Common.isValidParamString(storeId, 'store id', cb)) return;
    if (Common.isValidParamString(rooms, 'room array', cb)) return;
    var Store = Room.app.models.Store;
    try {
      let results = [];
      const roomIds = JSON.parse(rooms);
      await Promise.all(roomIds.map(async roomId => {
        let room = await Room.findById(roomId);
        if (room && room.status == 'new') {
          results.push(room);
          await room.updateAttribute('status', 'waitting');
        }
      }))
      if (results.length == 0) {
        return Promise.resolve(Common.makeResult(false, 'there is no registerd room'));
      }
      const res = {
        'registered': results.length
      }
      return Promise.resolve(Common.makeResult(true, 'success', res));
    } catch(e){
      //cb(err, 'error');
      console.error(e);
      return Promise.reject(e);
    }
  }
  Room.remoteMethod('verifyRooms', {
    accepts: [
      {arg: 'storeId', type: 'string', required: true, description: 'getNewRoom의 결과에서 storeId값'},
      {arg: 'rooms', type: 'string', required: true, description: 'getNewRoom의 결과에서 rooms값 배렬 실례: ["23ds...", "32jk..."]'},
    ],
    description: [
      '(어드민) 시스템관리에서 새로 추가된 피시에 대해 승인단추를 눌렀을떄\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: 'num: 승인한 룸 개수'
    },
    http: {path:'/verify-room', verb: 'get'}
  });


  Room.setTasekPlayTime = async(roomObj, isAllow) => {
    
  }
  
  // allow playing
  // Room.allowPlayingByManager = async(access_token, roomId, isAllow, time) => {
  //   const Store = Room.app.models.Store;
  //   try {
  //     const res_user = await Store.getStoreFromToken(access_token);
  //     let storeObj;
  //     if (!res_user.success) {
  //       return Promise.resolve(Common.makeResult(false, res_user.content, '토큰오유'));
  //     } else {
  //       storeObj = res_user.result;
  //     }
      
  //     let roomObj = await storeObj.room.findById(roomId);
  //     if (!roomObj) {
  //       return Promise.resolve(Common.makeResult(false, 'wrong Id', '잘못된 룸아이디입니다.'));
  //     } else {
  //       let data = {};
  //       if (isAllow) {
  //         let playEndTime = new Date();
  //         playEndTime.setMinutes(playEndTime.getMinutes() + time);
  //         data = {
  //           playStatus: Common.PLAY_STATUS.kPlayStatus_PlayWaitting,
  //           playStartTime: Date(),
  //           playEndTime: playEndTime
  //         }
  //       } else {
  //         data = {
  //           playStatus: Common.PLAY_STATUS.kPlayStatus_Stopped,
  //           playStartTime: Date(),
  //           playEndTime: Date()
  //         }
  //       }
  //       roomObj = await roomObj.updateAttributes(data);
  //       if (roomObj) {
  //         return Promise.resolve(Common.makeResult(true, 'success', roomObj));
  //       }
  //       return Promise.resolve(Common.makeResult(false, 'error', '실패하였습니다.'));
  //     }
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // };
  // Room.remoteMethod('allowPlayingByManager', {
  //   accepts: [
  //     {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
  //     {arg: 'roomId', type: 'string', required: true, description: '룸 아이디'},
  //     {arg: 'isAllow', type: 'boolean', required: true, description: '플레이 시작 true, 스톱 false'},
  //     {arg: 'time', type: 'number', required: false, description: '플레이 시간, 단위(m)'},
  //   ],
  //   description: [
  //     '(매니저) 룸 플레이 승인 / 해제\n',
  //   ],
  //   returns: {arg: 'res', type: 'object'},
  //   http: {path:'/allow-play', verb: 'post'}
  // });

  
  // allow playing
  Room.allowPlayingByApp = async(roomId, playStatus, time) => {
    const RoomLogs = Room.app.models.RoomLogs;
    try {      
      let roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong Id', '잘못된 룸아이디입니다.'));
      } else {
        const data = {
          playStatus: playStatus,
        }
        let playEndTime;
        //if (time > 0) {
          const now = new Date();
          if (roomObj.playEndTime > now && (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Lobby || roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Playing)) {
              playEndTime = new Date(roomObj.playEndTime.getTime());
              playEndTime.setMinutes(playEndTime.getMinutes() + time);
              if (playEndTime < now) {
                playEndTime = now;
              }
              data.playEndTime = playEndTime;
          } else {
            const playStartTime = new Date();
            playEndTime = new Date();
            playEndTime.setMinutes(playEndTime.getMinutes() + time);
            if (playEndTime < now) {
              playEndTime = now;
            }
            data.playStartTime = playStartTime;
            data.playEndTime = playEndTime;
          }
        //}
        if (playStatus == Common.PLAY_STATUS.kPlayStatus_Playing || playStatus == Common.PLAY_STATUS.kPlayStatus_Lobby) {
          await RoomLogs.createRoomLog(roomObj, new Date(), playEndTime);
        } else {
          if (playStatus != Common.PLAY_STATUS.kPlayStatus_Playing && playStatus != Common.PLAY_STATUS.kPlayStatus_Lobby) {
            await RoomLogs.endGame(roomObj);
          }
        }
        roomObj = await roomObj.updateAttributes(data);
        if (roomObj) {
          return Promise.resolve(Common.makeResult(true, 'success', roomObj));
        }
        return Promise.resolve(Common.makeResult(false, 'error', '실패하였습니다.'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Room.remoteMethod('allowPlayingByApp', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: '룸 아이디'},
      {arg: 'playStatus', type: 'number', required: true, description: '플레이 상태값'},
      {arg: 'time', type: 'number', required: false, description: '플레이 시간, 단위(m)'},
    ],
    description: [
      '(프로그램) 룸 플레이 승인 / 해제\n',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/allow-playbyapp', verb: 'post'}
  });
  
  // get Room
  Room.getPlayStatus = async(roomId) => {
    try {
      const query = {
        // fields: ['id', 'Index', 'name', 'machineType', 'playStatus', 'playStartTime', 'playEndTime', 'status']
      }
      let roomObj = await Room.findById(roomId, query);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong Id', '잘못된 룸아이디입니다.'));
      } else {
        // if (roomObj.machineType != 1) { // 타석형이 아니면
        // } else {
          const now = Date.now();
          if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Lobby || roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Playing) {
            if (roomObj.playStartTime.getTime() < now && now < roomObj.playEndTime.getTime()) {
            } else { // 시간이 종료되였을때
              roomObj.playStatus = Common.PLAY_STATUS.kPlayStatus_TimeOut;
              const data = {
                playStatus: Common.PLAY_STATUS.kPlayStatus_TimeOut,
              }
              await roomObj.updateAttributes(data);
            }
          }
          // if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Stopped) { // 매니저가 승인대기중에서 취소한 경우
            // const playStartTime = new Date();
            // const playEndTime = new Date();
            // const data = {
            //   playStartTime: playStartTime,
            //   playEndTime: playEndTime
            // }
            // await roomObj.updateAttributes(data);
            // return Promise.resolve(Common.makeResult(false, 'notAllow', '매니저의 승인이 필요합니다.'));
          // }
          // if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_PlayWaitting) { // 매니저가 승인후 프로그램을 처음 켰을때
          //   const playTime = roomObj.playEndTime.getTime() - roomObj.playStartTime.getTime();
          //   const playStartTime = new Date();
          //   const playEndTime = new Date();
          //   playEndTime.setTime(roomObj.playStartTime.getTime() + playTime);
          //   const data = {
          //     playStatus: Common.PLAY_STATUS.kPlayStatus_Lobby,
          //     playStartTime: playStartTime,
          //     playEndTime: playEndTime
          //   }
          //   await roomObj.updateAttributes(data);
          // }
        //   if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_ExtendWaitting) { // 매니저가 승인후 프로그램을 처음 켰을때
        //     const playTime = roomObj.playEndTime.getTime() - roomObj.playStartTime.getTime();
        //     const playStartTime = new Date();
        //     const playEndTime = new Date();
        //     playEndTime.setTime(roomObj.playStartTime.getTime() + playTime);
        //     const data = {
        //       playStatus: Common.PLAY_STATUS.kPlayStatus_Playing,
        //       playStartTime: playStartTime,
        //       playEndTime: playEndTime
        //     }
        //     await roomObj.updateAttributes(data);
        //   }
        // }
        //roomObj.playEndTime_tick = playEndTime.getTime();
        const result = {
          playStatus: roomObj.playStatus,
          playStartTime: roomObj.playStartTime,
          playEndTime: roomObj.playEndTime,
        }
        return Promise.resolve(Common.makeResult(true, 'success', result));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Room.remoteMethod('getPlayStatus', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: '룸 아이디'},
    ],
    description: [
      '(프로그램) 타석형장비에서 룸정보 얻기\n',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/get-playstatus', verb: 'post'}
  });


  // get Room
  Room.updateSetting = async(access_token, roomId, data) => {
    try {
      // const res_user = await Store.getStoreFromToken(access_token);
      // let storeObj;
      // if (!res_user.success) {
      //   return Promise.resolve(Common.makeResult(false, res_user.content, '토큰오유'));
      // } else {
      //   storeObj = res_user.result;
      // }
      // const roomObj = await storeObj.room.findById(roomId);
      const roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'find not room id', '보관실패'));
      }
      const result = await roomObj.updateAttributes(data);
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Room.remoteMethod('updateSetting', {
    accepts: [
      {arg: 'access_token', type: 'string', required: false, description: "매장관리자토큰"},
      {arg: 'roomId', type: 'string', required: true, description: '룸 아이디'},
      {arg: 'data', type: 'object', required: true, description: '룸 아이디'},
    ],
    description: [
      '(프로그램) 장비에서 룸정보 업데이트\n',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/update-roomsetting', verb: 'post'}
  });

  
  // get Room
  Room.getRoomAndGame = async(roomId) => {
    try {
      const roomObj = await Room.findById(roomId);
      if (!roomObj) {
        return Promise.resolve(Common.makeResult(false, 'find not room id', '잘못된 룸아이디입니다.'));
      }
      if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Playing || roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_TimeOut) {        
        const query_game = {
          fields: ['id', 'option', 'roomId'],
          where: {
            game_staus: 0,
            //endedAt: {gt: Date.now() - 1000 * 60 * 30}
          },
          order: 'endedAt DESC'
        }
        const gameObj = await roomObj.game.findOne(query_game);
        if (gameObj) {
          const result = {
            roomIndex: roomObj.Index,
            handType: Common.makeStringHandType(roomObj.handType),
            gameId: gameObj.id,
            game_setting: gameObj.option
          }
          return Promise.resolve(Common.makeResult(true, 'success', result));
        } else {
          return Promise.resolve(Common.makeResult(false, 'no game', '게임정보가 없습니다.'));
        }
      } else {
        return Promise.resolve(Common.makeResult(false, 'no game', '게임은 이미 종료되였습니다.'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Room.remoteMethod('getRoomAndGame', {
    accepts: [
      {arg: 'roomId', type: 'string', required: true, description: '룸 아이디'},
    ],
    description: [
      '(프로그램) 장비에서 룸정보 업데이트\n',
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/get-room-game', verb: 'get'}
  });
};
