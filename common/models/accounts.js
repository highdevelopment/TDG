'use strict';

var Common = require('./common.js');
var request = require('async-request');

module.exports = function(Accounts) {
  Accounts.disableRemoteMethodByName("upsert");                               // disables PATCH /MyUsers
  Accounts.disableRemoteMethodByName("find");                                 // disables GET /MyUsers
  Accounts.disableRemoteMethodByName("replaceOrCreate");                      // disables PUT /MyUsers
  Accounts.disableRemoteMethodByName("create");                               // disables POST /MyUsers

  Accounts.disableRemoteMethodByName("prototype.updateAttributes");           // disables PATCH /MyUsers/{id}
  // Accounts.disableRemoteMethodByName("findById");                             // disables GET /MyUsers/{id}
  Accounts.disableRemoteMethodByName("exists");                               // disables HEAD /MyUsers/{id}
  Accounts.disableRemoteMethodByName("replaceById");                          // disables PUT /MyUsers/{id}
  Accounts.disableRemoteMethodByName("deleteById");                           // disables DELETE /MyUsers/{id}

  Accounts.disableRemoteMethodByName('prototype.__get__accessTokens');        // disable GET /MyUsers/{id}/accessTokens
  Accounts.disableRemoteMethodByName('prototype.__create__accessTokens');     // disable POST /MyUsers/{id}/accessTokens
  Accounts.disableRemoteMethodByName('prototype.__delete__accessTokens');     // disable DELETE /MyUsers/{id}/accessTokens

  Accounts.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /MyUsers/{id}/accessTokens/{fk}
  Accounts.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /MyUsers/{id}/accessTokens/{fk}
  Accounts.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /MyUsers/{id}/accessTokens/{fk}

  Accounts.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /MyUsers/{id}/accessTokens/count

  Accounts.disableRemoteMethodByName("prototype.verify");                     // disable POST /MyUsers/{id}/verify
  Accounts.disableRemoteMethodByName("changePassword");                       // disable POST /MyUsers/change-password
  Accounts.disableRemoteMethodByName("createChangeStream");                   // disable GET and POST /MyUsers/change-stream

  Accounts.disableRemoteMethodByName("confirm");                              // disables GET /MyUsers/confirm
  Accounts.disableRemoteMethodByName("count");                                // disables GET /MyUsers/count
  Accounts.disableRemoteMethodByName("findOne");                              // disables GET /MyUsers/findOne

  Accounts.disableRemoteMethodByName("login");                                // disables POST /MyUsers/login
  Accounts.disableRemoteMethodByName("logout");                               // disables POST /MyUsers/logout

  Accounts.disableRemoteMethodByName("resetPassword");                        // disables POST /MyUsers/reset
  Accounts.disableRemoteMethodByName("setPassword");                          // disables POST /MyUsers/reset-password
  Accounts.disableRemoteMethodByName("update");                               // disables POST /MyUsers/update
  Accounts.disableRemoteMethodByName("upsertWithWhere");                      // disables POST /MyUsers/upsertWithWhere

  // Accounts.disableRemoteMethodByName('create');		// Removes (POST) /products
  // Accounts.disableRemoteMethodByName('upsert');		// Removes (PUT) /products
  // Accounts.disableRemoteMethodByName('deleteById');	// Removes (DELETE) /products/:id
  // Accounts.disableRemoteMethodByName("updateAll");		// Removes (POST) /products/update
  // Accounts.disableRemoteMethodByName("prototype.updateAttributes"); // Removes (PUT) /products/:id
  // Accounts.disableRemoteMethodByName("prototype.patchAttributes");  // Removes (PATCH) /products/:id
  // Accounts.disableRemoteMethodByName('createChangeStream'); // Removes (GET|POST) /products/change-stream

  Accounts.disableRemoteMethodByName('prototype.__get__game_log');
  Accounts.disableRemoteMethodByName('prototype.__create__game_log');
  Accounts.disableRemoteMethodByName('prototype.__delete__game_log');
  Accounts.disableRemoteMethodByName('prototype.__findById__game_log');
  Accounts.disableRemoteMethodByName('prototype.__updateById__game_log');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__game_log');
  Accounts.disableRemoteMethodByName('prototype.__count__game_log');

  Accounts.disableRemoteMethodByName('prototype.__get__store');
  Accounts.disableRemoteMethodByName('prototype.__create__store');
  Accounts.disableRemoteMethodByName('prototype.__delete__store');
  Accounts.disableRemoteMethodByName('prototype.__destroy__store');
  Accounts.disableRemoteMethodByName('prototype.__findById__store');
  Accounts.disableRemoteMethodByName('prototype.__update__store');
  Accounts.disableRemoteMethodByName('prototype.__updateById__store');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__store');
  Accounts.disableRemoteMethodByName('prototype.__count__store');

  Accounts.disableRemoteMethodByName('prototype.__get__user_log');
  Accounts.disableRemoteMethodByName('prototype.__create__user_log');
  Accounts.disableRemoteMethodByName('prototype.__delete__user_log');
  Accounts.disableRemoteMethodByName('prototype.__findById__user_log');
  Accounts.disableRemoteMethodByName('prototype.__updateById__user_log');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__user_log');
  Accounts.disableRemoteMethodByName('prototype.__count__user_log');

  Accounts.disableRemoteMethodByName('prototype.__get__questions');
  Accounts.disableRemoteMethodByName('prototype.__create__questions');
  Accounts.disableRemoteMethodByName('prototype.__delete__questions');
  Accounts.disableRemoteMethodByName('prototype.__findById__questions');
  Accounts.disableRemoteMethodByName('prototype.__updateById__questions');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__questions');
  Accounts.disableRemoteMethodByName('prototype.__count__questions');

  Accounts.disableRemoteMethodByName('prototype.__get__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__create__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__delete__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__findById__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__updateById__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__AccessLogs');
  Accounts.disableRemoteMethodByName('prototype.__count__AccessLogs');

  Accounts.disableRemoteMethodByName('prototype.__get__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__create__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__delete__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__findById__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__updateById__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__destroyById__app_notify');
  Accounts.disableRemoteMethodByName('prototype.__count__app_notify');

  Accounts.loggedIn = function(userObj, room) {
    var Userlog = Accounts.app.models.UserLog;
    if (room) {
      Userlog.addLog(userObj, room, 'game');
    } else {
      Userlog.addLog(userObj, 'web-login', 'user');
    }
  }


  // logout
  Accounts.logOutUser = async(access_token) => {
    try {
      await Accounts.logout(access_token);
      return Promise.resolve(Common.makeResult(true, 'success'));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Accounts.remoteMethod('logOutUser', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
    ],
    description: [
      '(유저) 로그아웃'
    ],
    returns: {arg: 'res', type: 'object'},
    http: {path:'/logOutUser', verb: 'post'}
  });

  // get Store
  Accounts.inStoreInfoById = function(user_id, cb) {
    Accounts.findById(user_id, (err, userObj) => {
      if (err) {
        cb(err, 'error');
      } else {
        if (!userObj) {
          cb(null, Common.makeResult(false, 'user not found'));
        } else {
          if (userObj.role != 'manager') {
            cb(null, Common.makeResult(false, 'the user is not a manager'));
          } else {
            userObj.store((err, store) => {
              if (err) {
                cb(err, 'error');
              } else {
                cb(null, Common.makeResult(true, 'success', {user: userObj, store: store}));
                // if (!store) {
                //   cb(null, Common.makeResult(false, 'the user has no store, register store please.'));
                // } else {
                //   cb(null, Common.makeResult(true, {user: userObj, store: store}));
                // }
              }
            })
          }
        }
      }
    })
  };

  // get Store
  Accounts.getStoreInfo = async(username, cb) => {
    const query = {
      where: {
        username: username
      }
    };
    try {
      const userObj = await Accounts.findOne(query);
      if (!userObj) {
        return Promise.resolve(Common.makeResult(false, 'user not found'));
      } else {
        if (userObj.role != 'manager') {
          return Promise.resolve(Common.makeResult(false, 'the user is not a manager'));
        } else {
          const store = await userObj.store();
          return Promise.resolve(Common.makeResult(true, 'success', {user: userObj, store: store}));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  // get Store
  Accounts.inStoreInfo = function(username, cb) {
    const query = {
      where: {
        username: username
      }
    };

    Accounts.findOne(query, (err, userObj) => {
      if (err) {
        cb(err, 'error');
      } else {
        if (!userObj) {
          cb(null, Common.makeResult(false, 'user not found'));
        } else {
          if (userObj.role != 'manager') {
            cb(null, Common.makeResult(false, 'the user is not a manager'));
          } else {
            userObj.store((err, store) => {
              if (err) {
                cb(err, 'error');
              } else {
                cb(null, Common.makeResult(true, 'success', {user: userObj, store: store}));
                // if (!store) {
                //   cb(null, Common.makeResult(false, 'the user has no store, register store please.'));
                // } else {
                //   cb(null, Common.makeResult(true, {user: userObj, store: store}));
                // }
              }
            })
          }
        }
      }
    })
  };

  // get Store
  // Accounts.storeInfo = function(access_token, username, cb) {
  //   const query = {
  //     where: {
  //       username: username
  //     }
  //   };
  //   Accounts.getUserFromToken(access_token, (err, res) => {
  //     if (err) {
  //       cb(err, user);
  //     } else {
  //       if (!res.success) {
  //         cb(null, Common.makeResult(false, res.content));
  //       } else {
  //         Accounts.find(query, (err, users) => {
  //           if (err) {
  //             cb(err, 'error');
  //           } else {
  //             if (users.length == 0) {
  //               cb(null, Common.makeResult(false, 'owner is not exited'));
  //             } else {
  //               const userObj = users[0];
  //               if (userObj.role != 'manager') {
  //                 cb(null, Common.makeResult(false, 'the user is not a manager'));
  //               } else {
  //                 userObj.store((err, store) => {
  //                   if (err) {
  //                     cb(err, 'error');
  //                   } else {
  //                     cb(null, Common.makeResult(true, 'success', {user: userObj, store: store}));
  //                   }
  //                 })
  //               }
  //             }
  //           }
  //         })
  //       }
  //     }
  //   })
  // };
  Accounts.createRole = async(userId, roleName, cb) => {
    var Role = Accounts.app.models.Role;
    var RoleMapping = Accounts.app.models.RoleMapping;
    try {
      //create the admin role
      const role = await Role.upsertWithWhere({ name: roleName }, { name: roleName });
      const query = {
        where: {
          principalId: userId
        }
      }
      const data = {
        principalType: RoleMapping.USER,
        principalId: userId,
        roleId: role.id
      }
      let principal = await RoleMapping.findOne(query);
      if (principal) {
        principal = principal.updateAttribute('roleId', role.id);
        return Promise.resolve(Common.makeResult(true, 'update Principal', principal));
      } else {
        principal = await role.principals.create({
          principalType: RoleMapping.USER,
          principalId: userId
        });
        return Promise.resolve(Common.makeResult(true, 'create Principal', principal));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  // login
  Accounts.loginUser = async(username, password, room, cb) => {
    try {
      const credentials = {
        email: username + '@tdg.com',
        password: password
      }
      const token = await Accounts.login(credentials);
      const userinfo = await Accounts.findById(token.userId);
      userinfo.photo = (userinfo.photo ? userinfo.photo : "user-picture/user_default.png");
      userinfo.access_token = token.id;
      let storeObj;
      if (userinfo.role == 'manager') {
        storeObj = await userinfo.store.get();
      }
      Accounts.loggedIn(userinfo, room);
      return Promise.resolve(Common.makeResult(true, 'success', {
        user: userinfo,
        token: token,
        store: storeObj
      }));
    } catch(e) {
      if (e.code == "LOGIN_FAILED") {
        return Promise.resolve(Common.makeResult(false, 'login failed'));
      }
      return Promise.reject(e);
    }
  };
  Accounts.remoteMethod('loginUser', {
    accepts: [
      {arg: 'username', type: 'string', required: true, description: '유저아이디'},
      {arg: 'password', type: 'string', required: true, description: '암호'},
      {arg: 'room', type: 'string', description: '게임에서 피시를 구분하는데 쓰인다, 웹, 앱에서 생략'},
    ],
    description: [
      '(전체) 유저 로그인',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '유저정보와 토큰정보를 되돌린다.\n',
        'user: 로그인한 유저\n',
        'user.nickname: 닉네임\n',
        'user.user_averscore: 평균타수(스코어)\n',
        'user.user_bestscore: 최고스코어\n',
        'user.user_averPuttingNum: 평균퍼팅수\n',
        'user.user_bestPuttingDist: 최대퍼팅거리\n',
        'user.user_bestCarry: 최대비거리\n',
        'user.user_averCarry: 평균비거리\n',
        'user.user_greenHitRate: 그린적중률\n',
        'user.user_fairwayHitRate: 패어웨이안착률\n',
        'token.id: 토큰아이디(access_token)\n',
        'store.manager_name: 점주이름\n',
        'store.cash: 캐쉬\n',
      ]
    },
    http: {path:'/loginUser', verb: 'post'}
  });

  // login
  Accounts.loginUserMobile = async(username, password) => {
    var Store = Accounts.app.models.Store;
    try {
      const MotionVideo = Accounts.app.models.MotionVideo;
      const res = await Accounts.loginUser(username, password);
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      } else {
        const query = {
          fields: ['id', 'storeName', 'storePhone', 'photo', 'storeGeoLocation', 'storeAddress'],
          limit: 2
        }
        const res_Stores = await Store.find(query);
        // const res_video = await MotionVideo.getVideoList(res.result.token.id, 2, 0);
        // let videos;
        // if (res_video.success) {
        //   videos = res_video.result.slice(0, 2);
        // }
        res_Stores.map(storeObj => {
          storeObj.photo = Common.FILE_SERVER_PATH + storeObj.photo
        })

        if (res.result.user.photo) {
          res.result.user.photo = res.result.user.photo;
        }
        
        const user = res.result.user;
        user.mail = user.mail ? user.mail : null;
        
        const recent = {
          recent_averscore: user.user_averscore ? user.user_averscore: 0,
          recent_averCarry: user.user_averCarry ? user.user_averCarry : 0,
          recent_averPuttingNum: user.user_averPuttingNum ? user.user_averPuttingNum: 0,
        }

        const chart = {
          user_averscore: Common.makeRateValue(user.user_averscore, 140, 60, 0, 1),
          user_greenHitRate: Common.makeRateValue(user.user_greenHitRate, 0, 100, 0, 1),
          user_fairwayHitRate: Common.makeRateValue(user.user_fairwayHitRate, 0, 100, 0, 1),
          user_averPuttingNum: Common.makeRateValue(user.user_averPuttingNum, 4, 1, 0, 1),
          user_averCarry: Common.makeRateValue(user.user_averCarry, 100, 350, 0, 1),
        }

        return Promise.resolve(Common.makeResult(true, 'success', {
          user: user,
          token: res.result.token,
          chart: chart,
          // videos: videos,
          recent: recent,
          stores: res_Stores
        }));
      }
    } catch(e) {
      if (e.code == "LOGIN_FAILED") {
        return Promise.resolve(Common.makeResult(false, 'login failed'));
      }
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('loginUserMobile', {
    accepts: [
      {arg: 'username', type: 'string', required: true, description: '유저아이디'},
      {arg: 'password', type: 'string', required: true, description: '암호'}
    ],
    description: [
      '(유저앱) 유저 로그인\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '유저정보와 토큰정보를 되돌린다.\n',
        'user: 로그인한 유저\n',
        'user.nickname: 닉네임\n',
        'user.user_averscore: 평균타수(스코어)\n',
        'user.user_bestscore: 최고스코어\n',
        'user.user_averPuttingNum: 평균퍼팅수\n',
        'user.user_bestPuttingDist: 최대퍼팅거리\n',
        'user.user_bestCarry: 최대비거리\n',
        'user.user_averCarry: 평균비거리\n',
        'user.user_greenHitRate: 그린적중률\n',
        'user.user_fairwayHitRate: 패어웨이안착률\n',
        'token.id: 토큰아이디(access_token)\n',
        'video: 모션 비디오자료'
      ]
    },
    http: {path:'/loginUserMobile', verb: 'post'}
  });

  Accounts.registerAdmin = async(username, password, nickname, phone_number, realname, sex, mail, cb) => {
    try {
      if (!sex) sex = 'male';
      const data = {
        username: username,
        nickname: nickname,
        password: password,
        sex: sex,
        age_less14: false,
        email: username + '@tdg.com',
        verified: false,
        createdAt: Date(),
        modifiedAt: Date(),
        phone_number: phone_number,
        mail: mail,
        agree_marketting_email: true,
        agree_marketting_sns: true,
        realname: realname,
        role: 'admin'
      }
      const account = await Accounts.create(data);
      const res = await Accounts.createRole(account.id, 'admin');

      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      } else {
        const res = await Accounts.loginUser(username, password, null);
        if (!res.success) {
          return Promise.resolve(Common.makeResult(false, res.content));
        } else {
          return Promise.resolve(Common.makeResult(true, 'success', res.result));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('registerAdmin', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'password', type: 'string', required: true},
      {arg: 'nickname', type: 'string', required: true},
      {arg: 'phone_number', type: 'string', required: true},
      {arg: 'realname', type: 'string', required: true},
      {arg: 'sex', type: 'string', required: false},
      {arg: 'mail', type: 'string', required: false},
    ],
    description: [
      'register admin',
    ],
    returns: {arg: 'res', type: 'string'},
    http: {path:'/register-admin', verb: 'post'}
  });

  Accounts.registerUser = async(username, nickname, sex, password, age_less14, phone_number, mail, 
    agree_marketting_email, agree_marketting_sns, realname, photo, birthday, address, register_type) => {
    if (!age_less14) age_less14 = false;
    if (!agree_marketting_sns) agree_marketting_sns = false;
    if (!agree_marketting_email) agree_marketting_email = false;
    if (realname && realname.length > 12) {
      return Common.makeResult(false, 'realname length > 12');
    }

    try {
      const query = {
        where: {
          username: username
        }
      };
      let user = await Accounts.findOne(query);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'user id is exited already', "중복된 유저아이디입니다."));
      }
      const query2 = {
        where: {
          nickname: nickname
        }
      };
      user = await Accounts.findOne(query2);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'nickname is exited already', "중복된 닉네임입니다."));
      }
      const query3 = {
        where: {
          phone_number: phone_number
        }
      };
      user = await Accounts.findOne(query3);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'phone number is exited already', "중복된 전화번호입니다."));
      }

      const data = {
        username: username,
        nickname: nickname,
        password: password,
        sex: sex,
        age_less14: age_less14,
        email: username + '@tdg.com',
        verified: false,
        birthday: birthday,
        createdAt: Date(),
        modifiedAt: Date(),
        phone_number: phone_number,
        mail: mail,
        agree_marketting_email: agree_marketting_email,
        agree_marketting_sns: agree_marketting_sns,
        realname: realname,
        photo: photo ? photo : undefined,
        address: address,
        register_type: register_type
      }
      let clubDistances;
      if (sex == 'male') {
        clubDistances = Common.ClubDistanceForMale;
      } else {
        clubDistances = Common.ClubDistanceForFemale;
      }
      data.user_clubdist_driver = clubDistances[0];
      data.user_clubdist_w3 = clubDistances[1];
      data.user_clubdist_u3 = clubDistances[2];
      data.user_clubdist_u5 = clubDistances[3];
      data.user_clubdist_i3 = clubDistances[4];
      data.user_clubdist_i4 = clubDistances[5];
      data.user_clubdist_i5 = clubDistances[6];
      data.user_clubdist_i6 = clubDistances[7];
      data.user_clubdist_i7 = clubDistances[8];
      data.user_clubdist_i8 = clubDistances[9];
      data.user_clubdist_i9 = clubDistances[10];
      data.user_clubdist_pw = clubDistances[11];
      data.user_clubdist_aw = clubDistances[12];
      data.user_clubdist_sw = clubDistances[13];

      const account = await Accounts.create(data);
      const res = await Accounts.createRole(account.id, 'user');

      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      } else {
        const res = await Accounts.loginUser(username, password, null);
        if (!res.success) {
          return Promise.resolve(Common.makeResult(false, res.content));
        } else {
          res.result.videos = [];
          return Promise.resolve(Common.makeResult(true, 'success', res.result));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Accounts.remoteMethod('registerUser', {
    accepts: [
      {arg: 'userId', type: 'string', required: true, description: '유저아이디'},
      {arg: 'nickname', type: 'string', required: true, description: '닉네임'},
      {arg: 'sex', type: 'string', required: true, description: '성별 male/female'},
      {arg: 'password', type: 'string', required: true, description: '암호'},
      {arg: 'age_less14', type: 'boolean', description: '14살미만 (true) / 14살이상 (false)'},
      {arg: 'phone_number', type: 'string', required: true},
      {arg: 'mail', type: 'string', required: false},
      {arg: 'agree_marketting_email', type: 'boolean', required: true, description: '메일알람허용(true) / 안함(false)'},
      {arg: 'agree_marketting_sns', type: 'boolean', required: true, description: 'sms 메시지동의 함 (true) / 안함(false)'},
      {arg: 'realname', type: 'string', required: true, description: '이름'},
      {arg: 'photo', type: 'string', required: false, description: '유저프로필이미지'},
      {arg: 'birthday', type: 'date', required: false, description: '유저프로필이미지'},
      {arg: 'address', type: 'object', required: false, description: '주소'},
      {arg: 'register_type', type: 'string', required: false, description: 'site: 웹싸이트, android: 앱, kat: 카톡'},
    ],
    description: [
      '(전체) 유저등록\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '등록이 성공하면 등록된 정보를 가지고 로그인을 진행하고 로그인결과를 리턴한다.'
    },
    http: {path:'/register', verb: 'post'}
  });

  
  Accounts.registerUserMobile = async(username, nickname, sex, password, age_less14, phone_number, mail, agree_marketting_email, agree_marketting_sns, realname, photo, register_type, cb) => {
    const MotionVideo = Accounts.app.models.MotionVideo;
    try {
      const res = await Accounts.registerUser(username, nickname, sex, password, age_less14, phone_number, mail, agree_marketting_email, agree_marketting_sns, realname, photo, register_type, cb);

      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      } else {
        const res_video = await MotionVideo.getVideoList(res.result.token.id, 2, 0);
        let videos;
        if (res_video.success) {
          videos = res_video.result.slice(0, 2);
        }

        if (res.result.user.photo) {
          res.result.user.photo = Common.FILE_SERVER_PATH + res.result.user.photo;
        }
        
        const user = res.result.user;
        const chart = {
          user_averscore: user.user_averscore / 80 * 100,
          user_greenHitRate: user.user_greenHitRate,
          user_fairwayHitRate: user.user_fairwayHitRate,
          user_averPuttingNum: user.user_averPuttingNum / 2 * 100,
          user_averCarry: user.user_averCarry / 250 * 100,
        }

        return Promise.resolve(Common.makeResult(true, 'success', {
          user: user,
          token: res.result.token,
          // chart: chart,
          videos: []
        }));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Accounts.remoteMethod('registerUserMobile', {
    accepts: [
      {arg: 'userId', type: 'string', required: true, description: '유저아이디'},
      {arg: 'nickname', type: 'string', required: true, description: '닉네임'},
      {arg: 'sex', type: 'string', required: true, description: '성별 male/female'},
      {arg: 'password', type: 'string', required: true, description: '암호'},
      {arg: 'age_less14', type: 'boolean', description: '14살미만 (true) / 14살이상 (false)'},
      {arg: 'phone_number', type: 'string', required: true},
      {arg: 'mail', type: 'string', required: false},
      {arg: 'agree_marketting_email', type: 'boolean', required: true, description: '메일알람허용(true) / 안함(false)'},
      {arg: 'agree_marketting_sns', type: 'boolean', required: true, description: 'sms 메시지동의 함 (true) / 안함(false)'},
      {arg: 'realname', type: 'string', required: true, description: '이름'},
      {arg: 'photo', type: 'string', required: false, description: '유저프로필이미지'},
      {arg: 'register_type', type: 'string', required: false, description: 'site: 웹싸이트, android: 앱, kat: 카톡'},
    ],
    description: [
      '(모바일앱) 유저모바일등록\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '등록이 성공하면 등록된 정보를 가지고 로그인을 진행하고 로그인결과를 리턴한다.'
    },
    http: {path:'/register-mobile', verb: 'post'}
  });


  Accounts.updateRole = async(username, role) => {
    const Store = Accounts.app.models.Store;
    try {
      if (role != 'user' && role != 'manager') {
        return Promise.resolve(Common.makeResult(false, 'wrong role name'));
      }
      const query = {
        where: {
          username: username
        }
      };
      const user = await Accounts.findOne(query);
      if (user.role == role) {
        return Promise.resolve(Common.makeResult(false, 'this user has already '+ role));
      }
      if (user) {
        const res = await Accounts.createRole(user.id, role);
        if (!res.success) {
          return Promise.resolve(Common.makeResult(false, 'createRole failed'));
        } else {
          const userObj = await user.updateAttribute('role', role);
          if (role == 'manager') {
            const date2018 = new Date(2018, 0, 0, 0, 0, 0, 0);
            const now = new Date();
            const storeName = "새 매장" + (now.getTime() - date2018.getTime());
            const res_store = await Store.saveStoreInfo(userObj.id, undefined, undefined, undefined, undefined,
              userObj.realname, undefined, undefined, undefined, undefined, userObj.mail, storeName);
            if (!res_store.success) {
              return Promise.resolve(Common.makeResult(false, 'create store failed' + res_store.content));
            }
          }
          return Promise.resolve(Common.makeResult(true, 'success', userObj));
        }
      } else {
        return Promise.resolve(Common.makeResult(false, 'the user is not exited'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('updateRole', {
    accepts: [
      {arg: 'username', type: 'string', required: true, description: '유저아이디'},
      {arg: 'role', type: 'string', required: true, description: 'user: 유저, manager: 매니저'},
    ],
    description: [
      '(어드민) 유저의 등급을 변경한다.',
    ],
    returns: {arg: 'res', type: 'string', description: '갱신된 유저정보를 리턴한다.'},
    http: {path:'/update-role', verb: 'post'}
  });


  Accounts.getUserFromToken = function(access_token, cb) {
    if (!access_token || access_token.length == 0) {
      cb(null, Common.makeResult(false, 'token is empty'));
      return;
    }
    Accounts.accessToken.findById(access_token, (err, token)=> {
      if (err) {
        cb(err, 'error');
      } else {
        if (!token) {
          cb(null, Common.makeResult(false, 'Unauthorized (token error)'));
        } else {
          Accounts.findById(token.userId, (err, user) => {
            if (err) {
              cb(err, 'error');
            } else {
              if (user) {
                cb(null, Common.makeResult(true, 'success', user));
              } else {
                cb(null, Common.makeResult(false, 'Unauthorized (token user error)'));
              }
            }
          })
        }
      }
    })
  }

  Accounts.updatePhoto = async(access_token, photo) => {
    var userInfo = {
      photo: photo,
    };

    try {
      const res = await Accounts.getSelfInfo(access_token);
      if (res.success) {
        const user = await res.result.updateAttributes(userInfo);
        if (user) {
          return Promise.resolve(Common.makeResult(true, 'success', user));
        } else {
          return Promise.resolve(Common.makeResult(false, 'user is Null'));
        }
      } else {
        return Promise.resolve(Common.makeResult(false, res.cotent));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('updatePhoto', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
      {arg: 'photo', type: 'string', description: '업로드된 프로필사진'},
    ],
    description: [
      '(유저웹) My TDG / 프로필관리에서 기본이미지 단추 클릭시 호출',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '업데이트된 유저정보를 리턴한다.'
    },
    http: {path:'/update-photo', verb: 'post'}
  });

  Accounts.updateProfile = async(access_token, photo, birthday, sex, nickname, phone_number, mail, 
    agree_marketting_email, agree_marketting_sns, agree_thirdparty, notify_email, notify_phone, realname) => {
    var userInfo = {
      birthday: birthday,
      sex: sex,
      nickname: nickname,
      phone_number: phone_number,
      mail: mail,
      agree_marketting_email: agree_marketting_email,
      agree_marketting_sns: agree_marketting_sns,
      agree_thirdparty: agree_thirdparty,
      notify_email: notify_email,
      notify_phone: notify_phone,
      realname: realname
    };

    try {
      const res = await Accounts.getSelfInfo(access_token);
      if (res.success) {
        const user = await res.result.updateAttributes(userInfo);
        if (user) {
          return Promise.resolve(Common.makeResult(true, 'success', user));
        } else {
          return Promise.resolve(Common.makeResult(false, 'user is Null'));
        }
      } else {
        return Promise.resolve(Common.makeResult(false, res.cotent));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('updateProfile', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
      {arg: 'photo', type: 'string', description: '업로드된 프로필사진'},
      {arg: 'birthday', type: 'date', required: false, description: '생일'},
      {arg: 'sex', type: 'string', required: true, description: '성별(male, female)'},
      {arg: 'nickname', type: 'string', required: true, description: '닉네임'},
      {arg: 'phone_number', type: 'string', required: true, description: '폰번호'},
      {arg: 'mail', type: 'string', description: '이메일'},
      {arg: 'agree_marketting_email', type: 'boolean', required: true, description: '마케팅 수신 동의 (이메일)'},
      {arg: 'agree_marketting_sns', type: 'boolean', required: true, description: '마케팅 수신 동의 (SNS)'},
      {arg: 'agree_thirdparty', type: 'boolean', required: false, description: '개인정보 제3자 제공 동의'},
      {arg: 'notify_email', type: 'boolean', required: false, description: 'TDG 소식받기 (이메일 알람)'},
      {arg: 'notify_phone', type: 'boolean', required: false, description: 'TDG 소식받기 (휴대폰 알림)'},
      {arg: 'realname', type: 'string', required: false, description: '실지 이름'},
    ],
    description: [
      'My TDG / 프로필관리에서 저장시 호출',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '업데이트된 유저정보를 리턴한다.'
    },
    http: {path:'/update-profile', verb: 'post'}
  });

  Accounts.updateGameSetting = async(access_token, difficulty, tasekPos, teePos, teeHeight,
    driver, w3, u3, u5, i3, i4, i5, i6, i7, i8, i9, pw, aw, sw, cb) => {
    var userInfo = {
      user_clubdist_driver: driver,
      user_clubdist_w3: w3,
      user_clubdist_u3: u3,
      user_clubdist_u5: u5,
      user_clubdist_i3: i3,
      user_clubdist_i4: i4,
      user_clubdist_i5: i5,
      user_clubdist_i6: i6,
      user_clubdist_i7: i7,
      user_clubdist_i8: i8,
      user_clubdist_i9: i9,
      user_clubdist_pw: pw,
      user_clubdist_aw: aw,
      user_clubdist_sw: sw,
    };
    if (teePos >= 0 && teePos < 5) {
      userInfo.user_setTeePos = teePos;
    } else {
      return Promise.resolve(Common.makeResult(false, 'teePos must be 0-4'));
    }
    if (teeHeight >= 0 && teeHeight <= 6) {
      userInfo.user_setTeeHeight = teeHeight;
    } else {
      return Promise.resolve(Common.makeResult(false, 'teeHeight must be 0-6'));
    }
    if (difficulty >= 0 && difficulty < 3) {
      userInfo.user_setDifficulty = difficulty;
    } else {
      return Promise.resolve(Common.makeResult(false, 'difficulty must be 0-4'));
    }
    if (tasekPos >= 0 && tasekPos < 2) {
      userInfo.user_setTasekPos = tasekPos;
    } else {
      return Promise.resolve(Common.makeResult(false, 'tasekPos must be 0-1'));
    }

    try {
      const res = await Accounts.getSelfInfo(access_token);
      if (res.success) {
        const user = await res.result.updateAttributes(userInfo);
        if (user) {
          return Promise.resolve(Common.makeResult(true, 'success', user));
        } else {
          return Promise.resolve(Common.makeResult(false, 'user is Null'));
        }
      } else {
        return Promise.resolve(Common.makeResult(false, res.cotent));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('updateGameSetting', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
      {arg: 'difficulty', type: 'number', required: true, description: '난이도 (0: 일반, 1: 세미투어, 2: 투어)'},
      {arg: 'tasekPos', type: 'number', required: true, description: '타석위치 (0: 오른손, 1: 왼손)'},
      {arg: 'teePos', type: 'number', required: true, description: '티위치 (0: Black, 1: Blue, 2: White, 3: Yellow, 4: Red)'},
      {arg: 'teeHeight', type: 'number', required: true, description: '티높이 (0: 35mm, 1: 40mm, ... 6: 65mm'},
      {arg: 'driver', type: 'number', required: true, description: '드라이버 (m단위)'},
      {arg: 'w3', type: 'number', required: true, description: '우드'},
      {arg: 'u3', type: 'number', required: true, description: '유틸리티(u3)'},
      {arg: 'u5', type: 'number', required: true, description: '유틸리티(u5)'},
      {arg: 'i3', type: 'number', required: true, description: '아이언(i3)'},
      {arg: 'i4', type: 'number', required: true, description: '아이언(i4)'},
      {arg: 'i5', type: 'number', required: true, description: '아이언(i5)'},
      {arg: 'i6', type: 'number', required: true, description: '아이언(i6)'},
      {arg: 'i7', type: 'number', required: true, description: '아이언(i7)'},
      {arg: 'i8', type: 'number', required: true, description: '아이언(i8)'},
      {arg: 'i9', type: 'number', required: true, description: '아이언(i9)'},
      {arg: 'pw', type: 'number', required: true, description: '웨지(pw)'},
      {arg: 'aw', type: 'number', required: true, description: '웨지(aw)'},
      {arg: 'sw', type: 'number', required: true, description: '웨지(sw)'},
    ],
    description: [
      '(유저) My TDG / 게임설정창에서 보관시 호출',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '업데이트된 유저정보를 리턴한다.'
    },
    http: {path:'/update-gamesetting', verb: 'post'}
  });


  Accounts.searchUser = async(name, role, pageNum, pageIndex) => {
    if (!name) name = '';
    if (pageNum == undefined) {
      pageNum = 100;
    }
    if (pageIndex == undefined) {
      pageIndex = 0;
    }
    const query = {
      where: {
        or: [
          { username: { like: name, options: 'i' } },
          { nickname: { like: name, options: 'i' } }
        ],
      },
      limit: pageNum,
      skip: pageNum * pageIndex
    };
    if (role) {
      if (role == 'all') {
        query.where.role = { neq: 'admin' };
      } else {
        query.where.role = role;
      }
    }
    try {
      const users = await Accounts.find(query);
      if (users.length > 0) {
        return Promise.resolve(Common.makeResult(true, 'success', users));
      } else {
        return Promise.resolve(Common.makeResult(false, 'There is no result'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Accounts.remoteMethod('searchUser', {
    accepts: [
      {arg: 'name', type: 'string', description: '빈문자렬이면 전체검색, 아이디와 닉네임이 검색문자렬을 포함하는 모든 유저를 표시'},
      {arg: 'role', type: 'string', description: '빈문자렬이면 전체검색, user / manager / admin, manager이면 role이 매장관리자인 유저만 검색'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(어드민) 검색결과를 목록으로 리턴한다.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '유저정보의 배렬'
    },
    http: {path:'/search-user', verb: 'get'}
  });






  // Accounts.remoteMethod('storeInfo', {
  //   accepts: [
  //     {arg: 'access_token', type: 'string'},
  //     {arg: 'username', type: 'string'},
  //   ],
  //   description: [
  //     'Store Info',
  //     'return: store object',
  //   ],
  //   returns: {arg: 'res', type: 'object'},
  //   http: {path:'/storeInfo', verb: 'get'}
  // });



  // get user
  Accounts.getSelfInfo = async(access_token) => {
    try {
      const token = await Accounts.accessToken.findById(access_token);
      if (!token) {
        return Promise.resolve(Common.makeResult(false, 'Unauthorized (token error)'));
      } else {
        const user = await Accounts.findById(token.userId);
        if (user) {
          return Promise.resolve(Common.makeResult(true, 'success', user));
        } else {
          return Promise.resolve(Common.makeResult(false, 'Unauthorized (token user error)2'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };


  Accounts.remoteMethod('getSelfInfo', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
    ],
    description: [
      '(유저) 토큰을 가지고 자기 유저정보를 얻는다.',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'username: 유저아이디\n',
        'user_averscore: 평균타수\n',
        'user_bestscore: 최고스코어\n',
        'user_averCarry: 평균비거리\n',
        'user_bestCarry: 최대비거리\n',
        'user_bestPuttingDist: 최대퍼팅거리',

        'user_averPuttingNum: 평균퍼팅수\n',
        'user_fairwayHitRate: 패어웨이 안착률\n',
        'user_greenHitRate: 그린적중률\n',

        'user_setDifficulty: 난이도 (0: 일반, 1: 세미투어, 2: 투어)\n',
        'user_setTasekPos: 타석위치 (0: 오른손, 1: 왼손)\n',
        'user_setTeePos: 티위치 (0: Black, 1: Blue, 2: White, 3: Yellow, 4: Red)\n',
        'user_setTeeHeight: 티높이\n',

        'user_clubdist_driver: 드라이버\n',
        'user_clubdist_w3: 우드\n',
        'user_clubdist_u3: 유틸리티(u3)\n',
        'user_clubdist_u5: 유틸리티(u5)\n',
        'user_clubdist_i3: 아이언(i3)\n',
        'user_clubdist_i4: 아이언(i4)\n',
        'user_clubdist_i5: 아이언(i5)\n',
        'user_clubdist_i6: 아이언(i6)\n',
        'user_clubdist_i7: 아이언(i7)\n',
        'user_clubdist_i8: 아이언(i8)\n',
        'user_clubdist_i9: 아이언(i9)\n',
        'user_clubdist_pw: 웨지(pw)\n',
        'user_clubdist_aw: 웨지(aw)\n',
        'user_clubdist_sw: 웨지(sw)\n',
      ]
    },
    http: {path:'/getselfinfo', verb: 'get'}
  });

  // (유저웹) 나의 단골매장
  Accounts.getRegularStore = async(userObj, limit) => {
    var Store = Accounts.app.models.Store;
    try {
      const results = [];
      const query = {
        where: {
          or: [
            {
              game_num: {gte: 8}
            },
            // {game_holenum: 18, holeIndex: 18},
          ]
          // holeIndex: 18
        },
        order: 'modifiedAt DESC',
        limit: 100,
      }
      const gameLogs = await userObj.game_log.find(query);
      const groupLogs = [];
      gameLogs.map(log => {
        if (groupLogs[log.storeId]) {
          groupLogs[log.storeId].visit++;
        } else {
          groupLogs[log.storeId] = {
            visit: 1
          }
        }
      });
      groupLogs.sort((a, b) => {
        return a.visit - b.visit;
      });
      const stores = [];
      await Promise.all(Object.keys(groupLogs).map(async storeId => {
        stores.push(await Store.findById(storeId));
      }))
      return Promise.resolve(Common.makeResult(true, 'success', stores.slice(0, limit)));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  // get user logs
  Accounts.getUserLogs_v2 = async(access_token, pageNum, pageIndex) => {
    if (pageNum == undefined) {
      pageNum = 5;
    }
    var Store = Accounts.app.models.Store;
    var Course = Accounts.app.models.Course;
    var GameLogs = Accounts.app.models.GameLogs;
    var Room = Accounts.app.models.Room;
    try {
      const token = await Accounts.accessToken.findById(access_token);
      if (!token) {
        return Promise.resolve(Common.makeResult(false, 'Unauthorized (token error)'));
      } else {
        const user = await Accounts.findById(token.userId);
        if (user) {
          const results = [];
          const query = {
            where: {
              neq: {
                gamesId: undefined
              },
              neq: {
                storeId: undefined
              },
              or: [
                {
                  game_num: {gte: 8}
                },
                // {game_holenum: 18, holeIndex: 18},
              ]
              // holeIndex: 18
            },
            order: 'modifiedAt DESC',
            limit: pageNum,
            skip: pageIndex * pageNum
          }
          const length = await user.game_log.count(query.where);
          const gameLogs = await user.game_log.find(query);
          await Promise.all(gameLogs.map(async gameLog => {
            const game = await gameLog.game.getAsync();
            if (game) {
              const store = await Store.findById(gameLog.storeId);
              let handicap = 0;
              if (gameLog.game_num >= 9 && gameLog.game_num < 18) {
                handicap = gameLog.score - 36;
              } else if (gameLog.game_num == 18) {
                handicap = gameLog.score - 72;
              } else {
                handicap = 0;
              }
              let score_details;
              if (store) {
                score_details = await GameLogs.getScoresOnly(gameLog, game);
              } else {
                console.log('store error:' + gameLog.storeId);
              }
              results.push({
                gameLogId: gameLog.id,
                course_name: await Course.getCourseName(game.course_name),
                game_mode: game.game_mode,
                store: store ? store.storeName : '삭제됨',
                storeAddress: store ? store.storeAddress : '삭제됨',
                time: gameLog.modifiedAt,
                time_yymmdd: gameLog.modifiedAt.yyyymmdd(),
                game_holenum: gameLog.game_holenum,
                score: gameLog.score ? gameLog.score : 0,
                handicap: gameLog.score ? handicap : 0,
                title: game.title ? game.title : Common.getGameModeKr(game.game_mode),
                score_details: score_details
              });
            } else {
              console.log('ppp');
            }
          }))
          results.sort(function(a, b){return b.time.getTime() - a.time.getTime()});
          return Promise.resolve(Common.makeResult(true, 'success', {
            length: length,
            logs: results
          }));
        } else {
          return Promise.resolve(Common.makeResult(false, 'Unauthorized (token user error)2'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  // get user logs
  Accounts.getUserLogs = async(access_token, pageNum, pageIndex) => {
    if (pageNum == undefined) {
      pageNum = 5;
    }
    var Store = Accounts.app.models.Store;
    var Course = Accounts.app.models.Course;
    var GameLogs = Accounts.app.models.GameLogs;
    var Room = Accounts.app.models.Room;
    try {
      const token = await Accounts.accessToken.findById(access_token);
      if (!token) {
        return Promise.resolve(Common.makeResult(false, 'Unauthorized (token error)'));
      } else {
        const user = await Accounts.findById(token.userId);
        if (user) {
          const results = [];
          const query = {
            where: {
              or: [
                {
                  game_num: {gte: 8}
                },
                // {game_holenum: 18, holeIndex: 18},
              ]
              // holeIndex: 18
            },
            order: 'modifiedAt DESC',
            limit: pageNum,
            skip: pageIndex
          }
          const gameLogs = await user.game_log.find(query);
          await Promise.all(gameLogs.map(async gameLog => {
            const game = await gameLog.game.getAsync();
            if (game) {
              const room = await game.room.getAsync();
              if (room) {
                const store = await Store.findById(room.storeId);
                let handicap = 0;
                if (gameLog.game_num >= 9 && gameLog.game_num < 18) {
                  handicap = gameLog.score - 36;
                } else if (gameLog.game_num == 18) {
                  handicap = gameLog.score - 72;
                } else {
                  handicap = 0;
                }
                if (store) {
                  const score_details = await GameLogs.getScoresOnly(gameLog, game);
                  if (score_details) {
                    results.push({
                      gameLogId: gameLog.id,
                      course_name: await Course.getCourseName(game.course_name),
                      game_mode: game.game_mode,
                      store: store.storeName,
                      storeAddress: store.storeAddress,
                      time: gameLog.modifiedAt,
                      time_yymmdd: gameLog.modifiedAt.yyyymmdd(),
                      game_holenum: gameLog.game_holenum,
                      score: gameLog.score ? gameLog.score : 0,
                      handicap: gameLog.score ? handicap : 0,
                      title: game.title ? game.title : Common.getGameModeKr(game.game_mode),
                      score_details: score_details
                    });
                  }
                }
              }
            }
          }))
          results.sort(function(a, b){return b.time.getTime() - a.time.getTime()});
          return Promise.resolve(Common.makeResult(true, 'success', results));
        } else {
          return Promise.resolve(Common.makeResult(false, 'Unauthorized (token user error)2'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };


  Accounts.remoteMethod('getUserLogs', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '토큰을 가지고 유저의 경기기록목록을 얻는다.',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'gameLogId: 게임로그아이디\n',
        'date: 끝난 시간\n',
        'course_name: 코스이름\n',
        'title: 구분\n',
        'store: 장소\n',
        'current_hole: 홀개수\n',
        'score: 타수\n',
      ]
    },
    http: {path:'/getUserLogs', verb: 'post'}
  });


  // call when verified
  Accounts.askVerification = async(phone_number, isNoCheckDuplication) => {
    const Verification = Accounts.app.models.Verification;
    try {
      if (!isNoCheckDuplication) {
        const query = {
          where: {
            phone_number: phone_number,
          }
        };
        const user = await Accounts.findOne(query);
        if (user) {
          return Promise.resolve(Common.makeResult(false, 'already registered phone_number', '이미 가입된 전화번호입니다.'));
        }
      }
      const params = {
        cpId: 'KIUS1001',
        urlCode: '001002',
        phoneNo: phone_number,
      }
      var response = await request('http://doorsgolf.com:5000/kmc/2.asp', {
        method: 'POST',
        data: params
      })
      console.log(response.body);
      let result = JSON.parse(response.body);
      if (!result) {
        return Promise.resolve(Common.makeResult(false, 'failed', '인증요청이 실패하였습니다.'));
      }
      result.createdAt = Date();
      result = await Verification.create(result);
      if (result.result == 'Y' && result.resultCode == 'SMSAUTHT00') {
        return Promise.resolve(Common.makeResult(true, 'success', '성공'));
      } else {
        let strErr;
        if (result.resultCode == 'SMSAUTHT0905' || result.resultCode == 'SMSAUTHT0906' || result.resultCode == 'SMSAUTHT0907') {
          strErr = "잘못된 전화번호입니다. 다시 입력해주세요.";
        } else {
          strErr = "인증요청이 실패하였습니다."
        }
        return Promise.resolve(Common.makeResult(false, 'errorCode: ' + result.resultCode, strErr));
      }
    } catch(e) {
      console.log(e);
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('askVerification', {
    accepts: [
      {arg: 'phone_number', type: 'string', required: true, description: '전화번호'},
      {arg: 'isNoCheckDuplication', type: 'boolean', required: false, description: '전화번호 중복체크 안함 true / false'},
    ],
    description: [
      '(전체) 유저 등록시 회원정보입력에서 전화번호를 등록하고 인증요청을 누를때 호출\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '성공하면 true, 실패하면 false'
      ]
    },
    http: {path:'/ask-verify', verb: 'post'}
  });

  // check verification
  Accounts.checkVerification = async(phone_number, verify_key) => {
    const Verification = Accounts.app.models.Verification;
    const query = {
      where: {
        phone_number: phone_number,
      }
    };
    try {
      const user = await Accounts.findOne(query);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'already registered phone_number', '이미 가입된 전화번호입니다.'));
      }
      const result = await Verification.checkAuth(phone_number, verify_key, 300 * 1000);
      if (result.success) {
        return Promise.resolve(Common.makeResult(true, 'success', 'success'));
      } else {
        return Promise.resolve(Common.makeResult(false, result.content, '인증이 실패하였습니다.'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('checkVerification', {
    accepts: [
      {arg: 'phone_number', type: 'string', required: true, description: '전화번호'},
      {arg: 'verify_key', type: 'string', required: true, description: '인증번호'},
    ],
    description: [
      '(전체) 유저 등록시 회원정보입력에서 인증번호를 입력하고 확인단추를 누를때 호출\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '성공하면 true, 실패하면 false'
      ]
    },
    http: {path:'/check-verify', verb: 'post'}
  });


  // check nickname
  Accounts.checkDoubleUsername = async(username, cb) => {
    const query = {
      where: {
        username: username,
      }
    };
    try {
      const user = await Accounts.findOne(query);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'already registered username'));
      }
      return Promise.resolve(Common.makeResult(true, 'success'));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('checkDoubleUsername', {
    accepts: [
      {arg: 'username', type: 'string', required: true, description: '아이디'},
    ],
    description: [
      '유저 등록시 닉네임중복검사\n',
      'role: everyone\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '성공하면 true, 실패하면 false'
      ]
    },
    http: {path:'/check-username', verb: 'post'}
  });


  // check nickname
  Accounts.checkDoubleNickname = async(nickname, cb) => {
    const query = {
      where: {
        nickname: nickname,
      }
    };
    try {
      const user = await Accounts.findOne(query);
      if (user) {
        return Promise.resolve(Common.makeResult(false, 'already registered nickname'));
      }
      return Promise.resolve(Common.makeResult(true, 'success'));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('checkDoubleNickname', {
    accepts: [
      {arg: 'nickname', type: 'string', required: true, description: '닉네임'},
    ],
    description: [
      '유저 등록시 닉네임중복검사\n',
      'role: everyone\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        '성공하면 true, 실패하면 false'
      ]
    },
    http: {path:'/check-nickname', verb: 'post'}
  });
  
  
  Accounts.getRanking = async(access_token, pageNum, pageIndex) => {
    if (pageNum == undefined) {
      pageNum = 100;
    }
    if (pageIndex == undefined) {
      pageIndex = 0;
    }
    try {
      const res = await Accounts.getSelfInfo(access_token);
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
      }
      const user = res.result;
      const query = {
        fields: ['status', 'user_averscore'],
        where: {
          status: 'normal',
          and: [
            {
              user_averscore: {
                lt: user.user_averscore
              },
            },
            {
              user_averscore: {
                gt: 0
              }
            }
          ]
        }
      };
      const rank = await Accounts.find(query);
      const query2 = {
        fields: ['status', 'user_averscore', 'username', 'user_bestscore'],
        where: {
          status: 'normal',
          user_averscore: {
            gt: 0
          },
        },
        order: 'user_averscore ASC',
        limit: pageNum,
        skip: pageNum * pageIndex
      }
      const rankLists = await Accounts.find(query2);
      const result = {
        user_averscore: user.user_averscore,
        rank_all: rank.length + 1,
        rank_city: 0,
        rankLists: rankLists
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('getRanking', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(유저) 내기록분석\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'user_averscore: 평균타수\n',
        'rank_all: 전국랭킹\n',
        'rank_city: 도시별랭킹\n',
        'rankLists: 유저목록\n',
        'rankLists.username: 아이디\n',
        'rankLists.user_averscore: 평균\n',
        'rankLists.user_bestscore: 베스트\n',
        'rankLists.user_handicap: 핸디\n',
        // 'rankLists.username: 아이디\n',
      ]
    },
    http: {path:'/get-ranking', verb: 'get'}
  });

  
  // retrive userId
  Accounts.retrieveUserID = async(phone_number, verify_key) => {
    const Verification = Accounts.app.models.Verification;
    const query = {
      where: {
        phone_number: phone_number,
      }
    };
    try {
      const user = await Accounts.findOne(query);
      if (!user) {
        return Promise.resolve(Common.makeResult(false, 'this number is not registered', '이 전화번호는 등록되지 않은 전화번호입니다.'));
      }
      const result = await Verification.checkAuth(phone_number, verify_key, 60 * 1000);
      if (result.success) {
        return Promise.resolve(Common.makeResult(true, 'success', {
          userId: user.username
        }));
      } else {
        return Promise.resolve(Common.makeResult(false, 'verification is failed', '인증이 실패하였습니다. 올바른 인증번호를 입력해주세요.'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('retrieveUserID', {
    accepts: [
      {arg: 'phone_number', type: 'string', required: true, description: '전화번호'},
      {arg: 'verify_key', type: 'string', required: true, description: '인증번호'},
    ],
    description: [
      '(전체) 아이디 찾기\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'userId: 이 전화번호로 등록된 유저아이디를 리턴한다.\n',
      ]
    },
    http: {path:'/retrive-id', verb: 'post'}
  });


  // retrive password
  Accounts.retrievePassword = async(username, phone_number, verify_key) => {
    const Verification = Accounts.app.models.Verification;
    try {
      const result = await Verification.checkAuth(phone_number, verify_key, 60 * 1000);
      if (result.success) {
        const query = {
          where: {
            phone_number: phone_number,
          }
        };
        const user = await Accounts.findOne(query);
        if (user) {
          if (user.username != username) {
            return Promise.resolve(Common.makeResult(false, 'this number is not registered by username', '잘못된 유저아이디입니다.'));
          } else {
            const newPasswd = Common.makeRandomString(8);
            const userObj = await user.updateAttribute('password', Accounts.hashPassword(newPasswd));
            if (!userObj) {
              return Promise.resolve(Common.makeResult(false, 'update Password', '비밀번호찾기가 실패하였습니다.'));
            }
            return Promise.resolve(Common.makeResult(true, 'success', { newPasswd: newPasswd }));
          }
        }
        return Promise.resolve(Common.makeResult(false, 'this number is not registered', '이 전화번호는 등록되지 않은 전화번호입니다.'));
      } else {
        return Promise.resolve(Common.makeResult(false, 'verification is failed', '전화인증이 실패하였습니다.'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('retrievePassword', {
    accepts: [
      {arg: 'username', type: 'string', required: true, description: '유저아이디'},
      {arg: 'phone_number', type: 'string', required: true, description: '전화번호'},
      {arg: 'verify_key', type: 'string', required: true, description: '인증번호'},
    ],
    description: [
      '(전체) 비밀번호 찾기\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'newPasswd: 이 전화번호로 등록된 유저아이디를 리턴한다.\n',
      ]
    },
    http: {path:'/retrive-password', verb: 'post'}
  });


  
  // update password
  Accounts.updatePassword = async(access_token, current_pass, new_pass) => {
    try {
      const res = await Accounts.getSelfInfo(access_token);
      let userObj = res.result;
      if (!res.success || !userObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
      } else {
        const isMatch = await userObj.hasPassword(current_pass);
        if (!isMatch) {
          return Promise.resolve(Common.makeResult(false, 'wrong current_pass'));
        } else {
          userObj = await userObj.updateAttribute('password', Accounts.hashPassword(new_pass));
          if (!userObj) {
            return Promise.resolve(Common.makeResult(false, 'update Password failed'));
          }
          return Promise.resolve(Common.makeResult(true, 'success'));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('updatePassword', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
      {arg: 'current_pass', type: 'string', required: true, description: '현재 비밀번호'},
      {arg: 'new_pass', type: 'string', required: true, description: '새 비밀번호'},
    ],
    description: [
      '(유저) 비밀번호 바꾸기\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        '성공이면 true, 실패이면 false'
      ]
    },
    http: {path:'/update-password', verb: 'post'}
  });

  // Accounts.afterRemote('loginUser', function(ctx){
  //   ctx.res.cookie('access_token', ctx.result.id, { signed: true, maxAge: ctx.result.ttl * 1000 });
  //   return Promise.resolve();
  // });

  // Accounts.afterRemote('logout', function(ctx){
  //   ctx.res.clearCookie('access_token');
  //   return Promise.resolve();
  // });

  
  Accounts.getRegisterType = async(mail) => {
    try {
      const query = {
        fields: ['mail', 'register_type'],
        where: {
          mail: mail
        }
      }
      const userObj = await Accounts.findOne(query);
      if (userObj) {
        return Promise.resolve(Common.makeResult(true, 'success', userObj.register_type));
      } else {
        return Promise.resolve(Common.makeResult(false, 'there is no registered mail'));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('getRegisterType', {
    accepts: [
      {arg: 'mail', type: 'string', required: true, description: '유저메일'},
    ],
    description: [
      '(전체) 메일을 가지고 등록타입을 돌려준다.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'site: 웹싸이트, android: 앱, kat: 카톡'
      ]
    },
    http: {path:'/get-registertype', verb: 'get'}
  });
  
  Accounts.getAppNotify = async(access_token) => {
    const AccessLogs = Accounts.app.models.AccessLogs;
    try {
      const res = await Accounts.getSelfInfo(access_token);
      let userObj = res.result;
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
      const result = await AccessLogs.unreadDocuments(userObj);
      const query = {
        fields: ['id', 'title', 'modifiedAt'],
        where: {
          status: 'checked',
          read: { neq: true },
        }
      }
      result.questions = await userObj.questions.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('getAppNotify', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
    ],
    description: [
      '(유저) 읽지 않은 문서들을 알림\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'notices: 공지\n',
        'notices.title: 공지제목\n',
        'notices.createdAt: 날자\n',
        'events: 이벤트\n',
        'events.title: 이벤트제목\n',
        'events.createdAt: 날자\n',
        'questions: 질문\n',
        'questions.title: 질문제목\n',
        'questions.modifiedAt: 날자\n',
      ]
    },
    http: {path:'/get-app-notify', verb: 'get'}
  });

  Accounts.updateClubInfo = async(access_token, club_info) => {
    const AccessLogs = Accounts.app.models.AccessLogs;
    try {
      const res = await Accounts.getSelfInfo(access_token);
      let userObj = res.result;
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
      await userObj.updateAttribute('club_data', club_info);
      return Promise.resolve(Common.makeResult(true, 'success'));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Accounts.remoteMethod('updateClubInfo', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
      {arg: 'club_info', type: 'object', required: true, description: '유저토큰'},
    ],
    description: [
      '(프로그램) 클럽정보를 갱신한다.\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
      ]
    },
    http: {path:'/update-clubinfo', verb: 'post'}
  });

  Accounts.resetAverageScore = async(userObj, lastGameLog) => {
    try {
      const results = [];
      const query = {
        where: {
          or: [
            {
              game_num: {gte: 17}
            },
            // {game_holenum: 18, holeIndex: 18},
          ]
          // holeIndex: 18
        },
        order: 'modifiedAt DESC',
        limit: 10
      }
      const gameLogs = await userObj.game_log.find(query);
      let score_count = 0;
      //let best_score = 9999;
      let context_count = 0;
      let totalScore = 0;
      let totalCarry = 0, totalPuttingNum = 0, totalPuttingDist = 0, totalFairwayHitRate = 0, totalGreenHitRate = 0;
      let totalClub_flyDist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let totalClub_sideDist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let totalClub_runDist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let totalClub_launchAngle = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let totalClub_velocity = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let club_data_count = 0;
      await Promise.all(gameLogs.map(async gameLog => {
        if (!gameLog.game_num) {
          let gameScore = 0;
          let nHoleCnt = 0;
          for (let score of gameLog.scores) {
            if (score != 99) {
              gameScore += score;
              nHoleCnt++;
            }
          }
          gameLog.game_num = nHoleCnt;
        }
        if (gameLog.game_num >= 18) {
          const score = (gameLog.score / gameLog.game_num) * 18;
          //best_score = best_score < score ? best_score : score;
          if (score > 0) {
            totalScore += score;
            score_count++;
          }
        }
        if (gameLog.game_context) {
          totalCarry += gameLog.game_context.averDriverDist;
          totalPuttingNum += gameLog.game_context.averPuttingNum;
          totalPuttingDist += gameLog.game_context.averPuttingDist;
          totalFairwayHitRate += gameLog.game_context.fairwayHitRate;
          totalGreenHitRate += gameLog.game_context.greenHitRate;
          context_count++;
          if (gameLog.game_context.club_data) {
            for (let i = 0; i < 15; i++) {
              if (gameLog.game_context.club_data.flyDist) totalClub_flyDist[i] += gameLog.game_context.club_data.flyDist[i];
              if (gameLog.game_context.club_data.sideDist) totalClub_sideDist[i] += gameLog.game_context.club_data.sideDist[i];
              if (gameLog.game_context.club_data.runDist) totalClub_runDist[i] += gameLog.game_context.club_data.runDist[i];
              if (gameLog.game_context.club_data.launchAngle) totalClub_launchAngle[i] += gameLog.game_context.club_data.launchAngle[i];
              if (gameLog.game_context.club_data.velocity) totalClub_velocity[i] += gameLog.game_context.club_data.velocity[i];
            }
            club_data_count++;
          }
        }
      }))
      const data = {};
      if (lastGameLog) {
        if (lastGameLog.score) {
          if (userObj.user_bestscore == 0 || userObj.user_bestscore > lastGameLog.score) {
            data.user_bestscore = lastGameLog.score;
          }
        }
        if (lastGameLog.bestDist && userObj.user_bestCarry < lastGameLog.bestDist) {
          data.user_bestCarry = lastGameLog.bestDist;
          data.user_bestCarryDate = Date();
        }
        if (lastGameLog.bestPuttngDist && userObj.user_bestPuttingDist < lastGameLog.bestPuttngDist) {
          data.user_bestPuttingDist = lastGameLog.bestPuttngDist;
        }
      }
      if (score_count > 0) {
        data.user_averscore = totalScore / score_count;
        //data.user_bestscore = best_score;
      }
      if (context_count > 0) {
        data.user_averCarry = totalCarry / context_count;
        data.user_averPuttingNum = totalPuttingNum / context_count;
        data.user_averPuttingDist = totalPuttingDist / context_count;
        data.user_fairwayHitRate = totalFairwayHitRate / context_count;
        data.user_greenHitRate = totalGreenHitRate / context_count;
        data.club_data = {
          flyDist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          sideDist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          runDist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          launchAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          velocity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
        for (let i = 0; i < 15; i++) {
          data.club_data.flyDist[i] = totalClub_flyDist[i] / club_data_count;
          data.club_data.sideDist[i] = totalClub_sideDist[i] / club_data_count;
          data.club_data.runDist[i] = totalClub_runDist[i] / club_data_count;
          data.club_data.launchAngle[i] = totalClub_launchAngle[i] / club_data_count;
          data.club_data.velocity[i] = totalClub_velocity[i] / club_data_count;
        }
      }
      const result = await userObj.updateAttributes(data);
      return Promise.resolve(result);
    } catch(e) {
      return Promise.reject(e);
    }
  }

  
Accounts.resetAverageScoreAllUser = async(time) => {
  try {
    var Store = Accounts.app.models.Store;
    var Room = Accounts.app.models.Room;

    const query = {
      fields: ['sensorId', 'pcId', 'playStatus', 'status'],
      where: {
        sensorId: {neq: 'failed sensor'}
      }
    }
    const rooms = await Room.find(query);
    return Promise.resolve(Common.makeResult(true, 'success', {
      length: rooms.length,
      rooms: rooms,
    }));

 /*   const userObj = await Accounts.findOne({where: {username: 'thegolf'}});
    const storeObj = await userObj.store.get();
    const query = {
      where: {
        playStatus: 3
      }
    }
    const rooms = await storeObj.room.find(query);
    const query2 = {
      where: {
        playStatus: 2
      }
    }
    const rooms_lobby = await storeObj.room.find(query2);

    if (!time) time = 5;

    // let now = new Date();
    // while(true) {
    //   let diff = (new Date()).getTime() - now.getTime();
    //   if (diff > 1000 * 60 * time) {
    //     break;
    //   }
    // }
    // const res_users = await Accounts.find(qurey);
    // for (let userObj of res_users) {
    //   await Accounts.resetAverageScore(userObj);
    // }
    return Promise.resolve(Common.makeResult(true, 'success', {
      rooms: rooms,
      lobby: rooms_lobby
    }));*/
  } catch(e) {
    return Promise.reject(e);
  }
};

Accounts.remoteMethod('resetAverageScoreAllUser', {
  accepts: [
    {arg: 'time', type: 'number', required: false},
  ],
  description: [
    '',
  ],
  returns: {
    arg: 'res',
    type: 'string',
    description: [
    ]
  },
  http: {path:'/resetAverageScore', verb: 'post'}
});


};

