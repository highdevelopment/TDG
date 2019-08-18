'use strict';

var Common = require('./common.js');

module.exports = function(Userlog, cb) {
  Userlog.disableRemoteMethodByName("upsert");                               // disables PATCH /MyUsers
  Userlog.disableRemoteMethodByName("find");                                 // disables GET /MyUsers
  Userlog.disableRemoteMethodByName("replaceOrCreate");                      // disables PUT /MyUsers
  Userlog.disableRemoteMethodByName("create");                               // disables POST /MyUsers

  Userlog.disableRemoteMethodByName("prototype.updateAttributes");           // disables PATCH /MyUsers/{id}
  Userlog.disableRemoteMethodByName("findById");                             // disables GET /MyUsers/{id}
  Userlog.disableRemoteMethodByName("exists");                               // disables HEAD /MyUsers/{id}
  Userlog.disableRemoteMethodByName("replaceById");                          // disables PUT /MyUsers/{id}
  Userlog.disableRemoteMethodByName("deleteById");                           // disables DELETE /MyUsers/{id}

  Userlog.disableRemoteMethodByName("createChangeStream");                   // disable GET and POST /MyUsers/change-stream

  Userlog.disableRemoteMethodByName("count");                                // disables GET /MyUsers/count
  Userlog.disableRemoteMethodByName("findOne");                              // disables GET /MyUsers/findOne

  Userlog.disableRemoteMethodByName("update");                               // disables POST /MyUsers/update
  Userlog.disableRemoteMethodByName("upsertWithWhere");                      // disables POST /MyUsers/upsertWithWhere

  Userlog.addLog = function(userObj, room_id, loginType, cb) {
    const data = {
      username: userObj.username,
      room_id: room_id + '_',
      loginType: loginType,
      date: Date()
    }
    userObj.user_log.create(data, (err, model) => {
      if (err) {
        if (cb) cb(err, 'error');
      } else {
        if (cb) cb(null, 'success');
      }
    })
  }
  Userlog.addLogAsync = async(userObj, room_id, loginType, access_token) => {
    const data = {
      username: userObj.username,
      access_token: access_token,
      room_id: room_id + '_',
      loginType: loginType,
      date: Date()
    }
    try {
      const model = await userObj.user_log.create(data);
      if (model) {
        return Promise.resolve(Common.makeResult(true, 'success', userObj));
      } else {
        return Promise.resolve(Common.makeResult(false, 'create failed'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  // QR Login
  Userlog.loginQR = async(access_token, room_id, cb) => {
    if (!room_id || room_id.length == 0) {
      return Promise.resolve(Common.makeResult(false, 'room_id is empty'));
    }
    var Accounts = Userlog.app.models.Accounts;
    try {
      const res = await Accounts.getSelfInfo(access_token);
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      } else {
        const userObj = res.result;
        const res_log = await Userlog.addLogAsync(userObj, room_id, 'qrcode', access_token);
        if (res_log.success) {
          return Promise.resolve(Common.makeResult(true, 'success'));
        } else {
          return Promise.resolve(Common.makeResult(false, 'add Log failed'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Userlog.remoteMethod('loginQR', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: '로그인할때 얻은 토큰아이디'},
      {arg: 'room_id', type: 'string', required: true, description: 'QR이미지로부터 얻은 문자열'},
    ],
    description: [
      '(유저앱) QR를 찍고 확인단추를 누를때 호출, 프로그램에 현재 모바일에 가입된 유저가 로그인 되도록 하여준다.',
    ],
    returns: {
      arg: 'user',
      type: 'object',
      description: '현재 모바일에 로그인한 유저의 정보를 되돌린다.'
    },
    http: {path:'/loginQR', verb: 'post'}
  });

  // NFC Card Login
  Userlog.loginNFC = async(cardId, roomId) => {
    var Card = Userlog.app.models.Card;
    var Accounts = Userlog.app.models.Accounts;
    try {
      const cardObj = await Card.findById(cardId);
      if (!cardObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong cardId'));
      } else {
        const userObj = await Accounts.findById(cardObj.userId);
        if (!userObj) {
          return Promise.resolve(Common.makeResult(false, 'wrong userId'));
        }
        const access_tokenObj = await Accounts.accessToken.create({
          ttl: -1,
          scopes: ['read:profile']
        });
        const res_log = await Userlog.addLogAsync(userObj, roomId, 'NFC', access_tokenObj.id);
        if (res_log.success) {
          const result = {
            id: userObj.id,
            username: userObj.username,
            nickname: userObj.nickname,
            user_setDifficulty: userObj.user_setDifficulty,
            user_setTeeHeight: userObj.user_setTeeHeight,
            user_setTeePos: userObj.user_setTeePos,
            access_token: access_tokenObj.id,
            sex: userObj.sex,
            photo: userObj.photo,
            user_averCarry: userObj.user_averCarry,
            user_bestCarry: userObj.user_bestCarry,
            
            user_clubdist_driver: userObj.user_clubdist_driver,
            user_clubdist_w3: userObj.user_clubdist_w3,
            user_clubdist_u3: userObj.user_clubdist_u3,
            user_clubdist_u5: userObj.user_clubdist_u5,
            user_clubdist_i3: userObj.user_clubdist_i3,
            user_clubdist_i4: userObj.user_clubdist_i4,
            user_clubdist_i5: userObj.user_clubdist_i5,
            user_clubdist_i6: userObj.user_clubdist_i6,
            user_clubdist_i7: userObj.user_clubdist_i7,
            user_clubdist_i8: userObj.user_clubdist_i8,
            user_clubdist_i9: userObj.user_clubdist_i9,
            user_clubdist_pw: userObj.user_clubdist_pw,
            user_clubdist_aw: userObj.user_clubdist_aw,
            user_clubdist_sw: userObj.user_clubdist_sw,
          }
          return Promise.resolve(Common.makeResult(true, 'success', result));
        } else {
          return Promise.resolve(Common.makeResult(false, 'add Log failed'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Userlog.remoteMethod('loginNFC', {
    accepts: [
      {arg: 'cardId', type: 'string', required: true, description: '카드로부터 얻은 유저 아이디'},
      {arg: 'roomId', type: 'string', required: true, description: '룸아이디'},
    ],
    description: [
      '(프로그램) NFC 카드를 인식했을때 카드에 등록된 유저아이디로 로그인.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '현재 모바일에 로그인한 유저의 정보를 되돌린다.'
    },
    http: {path:'/loginNFC', verb: 'post'}
  });


  // QR Login
  Userlog.checkingQRLoggedIn = async(room_id) => {
    var Accounts = Userlog.app.models.Accounts;
    try {
      const query = {
        where: {
          loginType: 'qrcode',
          room_id: room_id + '_',
          date: {
            gt: Date.now() - 10 * 1000
          }
        }
      };
      const logObj = await Userlog.findOne(query);
      if (!logObj) {
        return Promise.resolve(Common.makeResult(false, 'There is no loggin'));
      }
      const user = await logObj.accounts.get();
      if (!user) {
        return Promise.resolve(Common.makeResult(false, 'this log has no user'));
      }
      const result = {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        user_setDifficulty: user.user_setDifficulty,
        user_setTeeHeight: user.user_setTeeHeight,
        user_setTeePos: user.user_setTeePos,
        access_token: logObj.access_token,
        sex: user.sex,
        photo: user.photo,
        user_averCarry: user.user_averCarry,
        user_bestCarry: user.user_bestCarry,
        
        user_clubdist_driver: user.user_clubdist_driver,
        user_clubdist_w3: user.user_clubdist_w3,
        user_clubdist_u3: user.user_clubdist_u3,
        user_clubdist_u5: user.user_clubdist_u5,
        user_clubdist_i3: user.user_clubdist_i3,
        user_clubdist_i4: user.user_clubdist_i4,
        user_clubdist_i5: user.user_clubdist_i5,
        user_clubdist_i6: user.user_clubdist_i6,
        user_clubdist_i7: user.user_clubdist_i7,
        user_clubdist_i8: user.user_clubdist_i8,
        user_clubdist_i9: user.user_clubdist_i9,
        user_clubdist_pw: user.user_clubdist_pw,
        user_clubdist_aw: user.user_clubdist_aw,
        user_clubdist_sw: user.user_clubdist_sw,
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Userlog.remoteMethod('checkingQRLoggedIn', {
    accepts: [
      {arg: 'room_id', type: 'string', required: true, description: '룸아이디'},
    ],
    description: [
      '(프로그램) 1분전에 QR코드를 가지고 로그인한 유저를 조사',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '이 룸에 로그인한 유저를 리턴한다.'
    },
    http: {path:'/check-qrlogin', verb: 'post'}
  });
};
