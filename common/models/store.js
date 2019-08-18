'use strict';

var Common = require('./common.js');
var loopback = require('loopback');

module.exports = function(Store) {
  Store.disableRemoteMethodByName("upsert");                               // disables PATCH /MyUsers
  Store.disableRemoteMethodByName("find");                                 // disables GET /MyUsers
  Store.disableRemoteMethodByName("replaceOrCreate");                      // disables PUT /MyUsers
  Store.disableRemoteMethodByName("create");                               // disables POST /MyUsers

  Store.disableRemoteMethodByName("prototype.updateAttributes");           // disables PATCH /MyUsers/{id}
  // Store.disableRemoteMethodByName("findById");                             // disables GET /MyUsers/{id}
  Store.disableRemoteMethodByName("exists");                               // disables HEAD /MyUsers/{id}
  Store.disableRemoteMethodByName("replaceById");                          // disables PUT /MyUsers/{id}
  Store.disableRemoteMethodByName("deleteById");                           // disables DELETE /MyUsers/{id}

  Store.disableRemoteMethodByName("createChangeStream");                   // disable GET and POST /MyUsers/change-stream

  Store.disableRemoteMethodByName("count");                                // disables GET /MyUsers/count
  Store.disableRemoteMethodByName("findOne");                              // disables GET /MyUsers/findOne

  Store.disableRemoteMethodByName("update");                               // disables POST /MyUsers/update
  Store.disableRemoteMethodByName("upsertWithWhere");                      // disables POST /MyUsers/upsertWithWhere

  Store.disableRemoteMethodByName('prototype.__get__manager');
  Store.disableRemoteMethodByName('prototype.__create__manager');
  Store.disableRemoteMethodByName('prototype.__delete__manager');
  Store.disableRemoteMethodByName('prototype.__findById__manager');
  Store.disableRemoteMethodByName('prototype.__updateById__manager');
  Store.disableRemoteMethodByName('prototype.__destroyById__manager');
  Store.disableRemoteMethodByName('prototype.__count__manager');

  Store.disableRemoteMethodByName('prototype.__get__room');
  Store.disableRemoteMethodByName('prototype.__create__room');
  Store.disableRemoteMethodByName('prototype.__delete__room');
  Store.disableRemoteMethodByName('prototype.__findById__room');
  Store.disableRemoteMethodByName('prototype.__updateById__room');
  Store.disableRemoteMethodByName('prototype.__destroyById__room');
  Store.disableRemoteMethodByName('prototype.__count__room');

  Store.disableRemoteMethodByName('prototype.__get__cashLog');
  Store.disableRemoteMethodByName('prototype.__create__cashLog');
  Store.disableRemoteMethodByName('prototype.__delete__cashLog');
  Store.disableRemoteMethodByName('prototype.__findById__cashLog');
  Store.disableRemoteMethodByName('prototype.__updateById__cashLog');
  Store.disableRemoteMethodByName('prototype.__destroyById__cashLog');
  Store.disableRemoteMethodByName('prototype.__count__cashLog');

  Store.disableRemoteMethodByName('prototype.__get__CustomerService');
  Store.disableRemoteMethodByName('prototype.__create__CustomerService');
  Store.disableRemoteMethodByName('prototype.__delete__CustomerService');
  Store.disableRemoteMethodByName('prototype.__findById__CustomerService');
  Store.disableRemoteMethodByName('prototype.__updateById__CustomerService');
  Store.disableRemoteMethodByName('prototype.__destroyById__CustomerService');
  Store.disableRemoteMethodByName('prototype.__count__CustomerService');

  Store.disableRemoteMethodByName('prototype.__get__reservation');
  Store.disableRemoteMethodByName('prototype.__create__reservation');
  Store.disableRemoteMethodByName('prototype.__delete__reservation');
  Store.disableRemoteMethodByName('prototype.__findById__reservation');
  Store.disableRemoteMethodByName('prototype.__updateById__reservation');
  Store.disableRemoteMethodByName('prototype.__destroyById__reservation');
  Store.disableRemoteMethodByName('prototype.__count__reservation');

  // register and update
  Store.saveStoreInfo = async(manager_id,
    customer_branch, customer_name, customer_phone, contractDate,
    manager_name, manager_phone, manager_residentNumber, manager_businessNumber, manager_address, manager_mail,
    storeName, storeAddress, storePhone, installedDate,
    payment_mode, contract_pay_date, contract_amount, interpayment_date, interpayment_amount, balance_date, balance_amount,
    distance_limit, round_price, others, system_info, payment_date, 
    photo, storeGeoLocation, province, system_name, system_lefthand, working_time, swingplate, parking_status) => {
    var Accounts = Store.app.models.Accounts;
    const Container = Store.app.models.Container;
    try {
      const userObj = await Accounts.findById(manager_id);
      if (!userObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong manager_id'));
      } else {
        if (userObj.role != 'manager') {
          return Promise.resolve(Common.makeResult(false, 'this is not a manager'));
        }
        if (photo) {
            const newPath = await Container.ayncMoveFile(photo, 'store-picture/' + manager_id);
            if (newPath) {
              photo = newPath;
            } else {
                return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
            }
        }
        const data = {
          customer_branch: customer_branch,
          customer_name: customer_name,
          customer_phone: customer_phone,
          contractDate: contractDate ? contractDate : Date(),

          manager_name: manager_name,
          manager_phone: manager_phone,
          manager_residentNumber: manager_residentNumber,
          manager_businessNumber: manager_businessNumber,
          // manager_name: userObj.username,
          manager_address: manager_address,
          manager_mail: manager_mail,

          storeName: storeName,
          storeAddress: storeAddress,
          storePhone: storePhone,
          installedDate: installedDate ? installedDate : Date(),

          payment_mode: payment_mode,
          contract_pay_date: contract_pay_date,
          contract_amount: contract_amount,
          interpayment_date: interpayment_date,
          interpayment_amount: interpayment_amount,
          balance_date: balance_date,
          balance_amount: balance_amount,

          distance_limit: distance_limit,
          round_price: round_price,
          others: others,

          system_info: system_info,
          payment_date: payment_date,

          photo: photo,
          storeGeoLocation: storeGeoLocation,
          province,
          system_name,
          system_lefthand,
          working_time,
          swingplate,parking_status,

          modifiedAt: Date(),
        }
        const user_store = await userObj.store.get();
        if (user_store) {
          if (storeName && user_store.storeName != storeName) {
            const store = await Store.findOne({where: {storeName: storeName}});
            if (store) {
              return Promise.resolve(Common.makeResult(false, 'already registered storename'))
            }
          }
          const storeObj = await userObj.store.update(data);
          if (storeObj) {
            return Promise.resolve(Common.makeResult(true, 'updated', storeObj));
          } else {
            return Promise.resolve(Common.makeResult(false, 'update failed'));
          }
        } else {
          const store = await Store.findOne({where: {storeName: storeName}});
          if (store) {
            return Promise.resolve(Common.makeResult(false, 'already registered storename'))
          }
          data.createdAt = Date();
          const newStore = await userObj.store.create(data);
          if (!newStore) {
            return Promise.resolve(Common.makeResult(false, 'failed creating store'));
          }
          return Promise.resolve(Common.makeResult(true, 'created', newStore));
        }
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('saveStoreInfo', {
    accepts: [
      {arg: 'manager_id', type: 'string', required: true, description: '매니저아이디'},

      {arg: 'customer_branch', type: 'string', description: '영업지사'},
      {arg: 'customer_name', type: 'string', description: '영업담당자이름'},
      {arg: 'customer_phone', type: 'string', description: '영업담당자 전화번호'},
      {arg: 'contractDate', type: 'date', description: '계약일'},

      {arg: 'manager_name', type: 'string', required: true, description: '점주성명'},
      {arg: 'manager_phone', type: 'string', description: '점주 전화번호'},
      {arg: 'manager_residentNumber', type: 'string', description: '점주 주민등록번호'},
      {arg: 'manager_businessNumber', type: 'string', description: '사업자등록번호'},
      {arg: 'manager_address', type: 'string', description: '점주 주소'},
      {arg: 'manager_mail', type: 'string', description: '점주 메일주소'},

      {arg: 'storeName', type: 'string', required: true, description: '점포명'},
      {arg: 'storeAddress', type: 'string', description: '설치장소 주소'},
      {arg: 'storePhone', type: 'string', description: '매장전화번호'},
      {arg: 'installedDate', type: 'date', description: '설치일'},

      {arg: 'payment_mode', type: 'string', description: '결제방식'},
      {arg: 'contract_pay_date', type: 'date', description: '계약금 납입일'},
      {arg: 'contract_amount', type: 'number', description: '계약금액'},
      {arg: 'interpayment_date', type: 'date', description: '중도금 납입일'},
      {arg: 'interpayment_amount', type: 'number', description: '중도금액'},
      {arg: 'balance_date', type: 'date', description: '잔금 납입일'},
      {arg: 'balance_amount', type: 'number', description: '잔금액'},

      {arg: 'distance_limit', type: 'number', description: '거리제한'},
      {arg: 'round_price', type: 'number', description: '라운드 이용요금'},
      {arg: 'others', type: 'string', description: '기타 사항'},
      {arg: 'system_info', type: 'string', description: ''},
      {arg: 'payment_date', type: 'date', description: '요금납부일'},

      {arg: 'photo', type: 'string', description: '매장이미지파일경로'},
      {arg: 'storeGeoLocation', type: 'geopoint', required: false, description: '매장 맵위치: 실례 "23.23432, 34.234324"'},
      {arg: 'province', type: 'number', description: '매장지역 0: 수도권, 1: 강원도, 2: 충청도, 3: 전라도, 4: 경상도, 5: 제주도, 6: 해외'},
      {arg: 'system_name', type: 'string', description: '시스템명'},
      {arg: 'system_lefthand', type: 'string', description: '타석위치'},
      {arg: 'working_time', type: 'string', description: '운영시간'},
      {arg: 'swingplate', type: 'string', description: '스윙플레이트'},
      {arg: 'parking_status', type: 'string', description: '주차'},
    ],
    description: [
      '(어드민) 매장 등록 및 보관, 매니저에 매장이 등록되있으면 보관, 없으면 새로 등록',
    ],
    returns: {arg: 'result', type: 'string', description: '등록 및 보관된 매장정보를 리턴한다.'},
    http: {path:'/save-store', verb: 'post'}
  });


  // Store.listNotices = function(access_token, cb) {
  //   var Accounts = Store.app.models.Accounts;
  //   Accounts.getUserFromToken(access_token, (err, res) => {
  //     if (err) {
  //       cb(err, user);
  //     } else {
  //       if (!res.success) {
  //         cb(null, Common.makeResult(false, res.content));
  //       } else {
  //         const userObj = res.result;
  //         Accounts.inStoreInfo(userObj.username, (err, res) => {
  //           if (err) {
  //             cb(err, 'error');
  //           } else {
  //             if (!res.success) {
  //               cb(null, Common.makeResult(false, res.content));
  //             } else {
  //               const userObj = res.result.user;
  //               const store = res.result.store;
  //               store.notices((err, notices) => {
  //                 if (err) {
  //                   cb(null, 'err');
  //                 } else {
  //                   cb(null, Common.makeResult(true, 'success', notices));
  //                 }
  //               })
  //             }
  //           }
  //         })
  //       }
  //     }
  //   })
  // }

  // Store.remoteMethod('listNotices', {
  //   accepts: [
  //     {arg: 'access_token', type: 'string'},
  //   ],
  //   description: [
  //     'notice list of store',
  //   ],
  //   returns: {arg: 'result', type: 'string'},
  //   http: {path:'/listnotices', verb: 'get'}
  // });



  // get Store
  Store.managerInfo = async(storeObj) => {
    var Accounts = Store.app.models.Accounts;
    if (!storeObj.accountsId) {
      return Promise.resolve(Common.makeResult(false, 'this store has no manager'));
    } else {
      try {
        const query = {
          where: {
            id: storeObj.accountsId
          }
        };
        const manager = await Accounts.findOne(query);
        if (manager.role != 'manager') {
          return Promise.resolve(Common.makeResult(false, 'the user is not a manager'));
        } else {
          return Promise.resolve(Common.makeResult(true, 'success', manager));
        }
      } catch(e) {
        return Promise.reject(e);
      }
    }
  };

  Store.searchStore = async(name, conditionDate, date1, date2, pageNum, pageIndex) => {
    var Accounts = Store.app.models.Accounts;
    if (!name) name = '';
    if (pageNum == undefined) pageNum = 100;
    if (pageIndex == undefined) pageIndex = 0;
    if (!conditionDate) conditionDate = 0;
    if (conditionDate >= 0 && conditionDate < 2) {
    } else {
      return Promise.resolve(Common.makeResult(false, 'conditionDate must be 0-1'));
    }
    if (date1 == undefined) date1 = new Date('01/01/2018');
    if (date2 == undefined) date2 = new Date();

    var queryDate;
    if (conditionDate == 0) {
      queryDate = {
        contractDate: {
          between: [date1, date2]
        }
      }
    } else if (conditionDate == 1) {
      queryDate = {
        installedDate: {
          between: [date1, date2]
        }
      }
    }
    const query = {
      fields: ['id', 'accountsId', 'manager_name', 'storeName', 'storeAddress', 'contractDate', 'installedDate'],
      where: {
        and: [
          {
            or: [
              {manager_name: {like: name, options: 'i'}},
              {storeName: {like: name, options: 'i'}}
            ],
          },
          queryDate
        ],
      },
      limit: pageNum,
      skip: pageNum * pageIndex
    };

    try {
      const results = [];
      const stores = await Store.find(query);
      for (let key in stores) {
        let storeObj = stores[key];
        const userObj = await Accounts.findById(storeObj.accountsId);
        if (userObj) {
          if (userObj.role == 'manager') {
            storeObj.username = userObj.username;
            results.push(storeObj);
          }
        } else {
          console.error(storeObj);
        }
      }
      return Promise.resolve(Common.makeResult(true, 'success', results));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('searchStore', {
    accepts: [
      {arg: 'name', type: 'string', description: '검색어'},
      {arg: 'conditionDate', type: 'number', description: '검색조건(0: 계약일, 1: 설치일) default: 0'},
      {arg: 'date1', type: 'date', description: '날짜1 default: 2018/01/01'},
      {arg: 'date2', type: 'date', description: '날짜2 default: current date()'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(전체) 매장목록을 얻는다. 앱에서는 검색조건을 생략한다.'
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'id: 매장아이디',
        'storeName: 매장이름\n',
        'storeAddress: 매장주소\n',
      ]
    },
    http: {path:'/search-store', verb: 'get'}
  });



  Store.getSearchStore = async(name, province) => {
    var Accounts = Store.app.models.Accounts;
    if (!name) name = '';

    const query = {
      where: {
        and: [
          {
            or: [
              {storeName: {like: name, options: 'i'}},
              {manager_name: {like: name, options: 'i'}},
              {address_kr: {like: name, options: 'i'}}
            ],
          },
          {province: province}
        ],
      }
    };
    try {
      const stores = await Store.find(query);
      for (let key in stores) {
        let storeObj = stores[key];
        const userObj = await Accounts.findById(storeObj.accountsId);
        if (userObj) {
          storeObj.username = userObj.username;
        } else {
          console.log("store error");
        }
      }
      return Promise.resolve(Common.makeResult(true, 'success', stores));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('getSearchStore', {
    accepts: [
      {arg: 'name', type: 'string', description: '검색어'},
      {arg: 'province', type: 'number', description: '지역이름, 0: 수도권, 1: 강원도, 2: 충청도, 3: 전라도, 4: 경상도, 5: 제주도, 6: 해외'},
      {arg: 'conditionDate', type: 'number', description: '검색조건(0: 계약일, 1: 설치일) default: 0'},
      {arg: 'date1', type: 'date', description: '날짜1 default: 2018/01/01'},
      {arg: 'date2', type: 'date', description: '날짜2 default: current date()'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(전체) 매장목록을 얻는다. 앱에서는 검색조건을 생략한다.'
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'id: 매장아이디',
        'storeName: 매장이름\n',
        'storeAddress: 매장주소\n',
      ]
    },
    http: {path:'/get-search-store', verb: 'get'}
  });




  Store.searchStoreWidthLocation = async(lat, lng, limit) => {
    const here = new loopback.GeoPoint({lat: lat, lng: lng});
    const query = {
      where: {
        storeGeoLocation: {
          near: here
        }
      },
      limit: limit
    };

    try {
      const stores = await Store.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', stores));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('searchStoreWidthLocation', {
    accepts: [
      {arg: 'lat', type: 'number', required: true, description: '위도'},
      {arg: 'lng', type: 'number', required: true, description: '경도'},
      {arg: 'limit', type: 'number', required: true, description: '표시하려는 매장개수'},
    ],
    description: [
      '(전체) 현재 위치로부터 가장 가까운 매장목록을 얻는다.\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'id: 매장아이디',
        'storeName: 매장이름\n',
        'storeAddress: 매장주소\n',
        'storePhone: 매장전화번호\n',
        'working_time: 운영시간',
        'swingplate: 스윙플레이트',
        'parking_status: 주차'
      ]
    },
    http: {path:'/search-store-location', verb: 'post'}
  });

  Store.getStoreById = async(storeId) => {
    try {
      const storeObj = await Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      const query1 = {
        where: {
          status: 'waitting'
        }
      };
      const rooms1 = await storeObj.room.find(query1);
      const query2 = {
        where: {
          status: 'working'
        }
      };
      const rooms2 = await storeObj.room.find(query2);
      const query3 = {
        where: {
          status: 'stopped'
        }
      };
      const rooms3 = await storeObj.room.find(query3);
      const result = {
        store: storeObj,
        room_count: rooms1.length + rooms2.length,
        room_waitting_count: rooms1.length,
        room_working_count: rooms2.length,
        rooms: rooms1.concat(rooms2).concat(rooms3)
      };
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('getStoreById', {
    accepts: [
      {arg: 'storeId', type: 'string'},
    ],
    description: [
      '매장과 매장에 속한 장비정보를 리턴한다.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'storeObj.id: 매장아이디',
        'storeObj.storeName: 매장이름\n',
        'storeObj.storeAddress: 매장주소\n',
        'storeObj.storePhone: 매장전화번호\n',
        'storeObj.working_time: 운영시간\n',
        'storeObj.swingplate: 스윙플레이트\n',
        'storeObj.parking_status: 주차\n',
        'storeObj.storeGeoLocation: 매장 맵위치\n',
        'room_count: 장비대수\n',
        'rooms: 장비목록\n',
        'rooms.Index: 룸번호\n',
        'rooms.name: 룸이름\n',
        'rooms.status: 장비상태 (new: 새로 설치하고 등록전 상태, waitting: 등록후 멈춘 상태, working: 등록후 작동중, stopped: 정지상태, deleted: 삭제)\n',
      ]
    },
    http: {path:'/get-storebyid', verb: 'post'}
  });


  Store.getStoreAndRoom = async(manager_id) => {
    var Accounts = Store.app.models.Accounts;
    try {
      const userObj = await Accounts.findById(manager_id);
      if (!userObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong manager_id'));
      }
      const storeObj = await userObj.store.get();
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'this user has no store'));
      }
      const query = {
        where: {
          or: [
            { status: 'waitting' },
            { status: 'working' },
            { status: 'stopped' }
          ]
        }
      }
      const rooms = await storeObj.room.find(query);
      const result = {
        store: storeObj,
        rooms: rooms
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Store.remoteMethod('getStoreAndRoom', {
    accepts: [
      {arg: 'manager_id', type: 'string', required: true, description: '매장관리자 아이디(DB)'},
    ],
    description: [
      '매장정보와 매장에 속한 룸목록을 얻는다.'
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'store: 매장정보\n',
        'rooms: 룸목록\n',
      ]
    },
    http: {path:'/get-store', verb: 'get'}
  });


  Store.getRoomsOfStore = async(storeId) => {
    try {
      const storeObj = await Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      const query = {
        fields: {
          id: true,
          Index: true,
          name: true,
          status: true,
        },
        where: {
          or: [
            { status: 'waitting' },
            { status: 'working' },
            { status: 'stopped' }
          ]
        }
      }
      const rooms = await storeObj.room.find(query);
      const result = {
        store: storeObj,
        rooms: rooms
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Store.remoteMethod('getRoomsOfStore', {
    accepts: [
      {arg: 'storeId', type: 'string', required: true, description: '매장아이디(DB)'},
    ],
    description: [
      '(어드민) 매장아이디를 가지고 매장과 매장에 속한 룸목록얻기\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'store: 매장정보\n',
        'rooms: 룸목록\n',
      ]
    },
    http: {path:'/get-rooms', verb: 'get'}
  });

  Store.getPaymentAmount = async(storeObj) => {
    try {
      const now = new Date();
      const paymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      let lastPaidDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      if (storeObj.installedDate.getTime() > lastPaidDate.getTime()) {
        lastPaidDate = new Date(storeObj.installedDate.getTime());
      }
      const timeDiff = Math.abs(paymentDate.getTime() - lastPaidDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const query = {
        fields: [ 'id', 'Index', 'name', 'status', 'payment' ],
        where: {
          or: [
            { status: 'waitting' },
            { status: 'working' },
            { status: 'stopped' }
          ]
        }
      }
      const rooms = await storeObj.room.find(query);
      let payment_month = 0;
      rooms.map(roomObj => {
        payment_month += roomObj.payment * diffDays;
      })
      return Promise.resolve({
        lastPaidDate: lastPaidDate,
        paymentDate: paymentDate,
        payment_month: payment_month,
        rooms: rooms
      })
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Store.getManagerPayement = async(access_token) => {
    try {
        const res_user = await Store.getStoreFromToken(access_token);
        let storeObj;
        if (!res_user.success) {
          return Promise.resolve(Common.makeResult(false, res_user.content));
        } else {
          storeObj = res_user.result;
        }

        const res_payment = await Store.getPaymentAmount(storeObj);
        // const cashLogs = await storeObj.cashLog.find({});
        let total_payment = res_payment.payment_month; // 이벤트나 한일을 제외한 실제 납부한 금액, 현재는 기본요금과 같음
        // cashLogs.map(cashLog => {
        //   total_payment += cashLog.amount;
        // })
        const result = {
          lastPaidDate: res_payment.lastPaidDate,
          paymentDate: res_payment.paymentDate,
          rooms: res_payment.rooms,
          payment_month: res_payment.payment_month,
          unpaid_fee: storeObj.cash < 0 ? -1 * storeObj.cash : 0,
          tax: total_payment * 0.1,
          total_payment: total_payment,
          cash: storeObj.cash > 0 ? storeObj.cash : 0,
          estimate_diff: storeObj.cash - total_payment
        }
        return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
        return Promise.reject(e);
    }
  }
  Store.remoteMethod('getManagerPayement', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: '매니저 토큰'},
    ],
    description: [
      '(매니저웹) 매장의 요금 조회\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'lastPaidDate: 결제일 부터\n',
        'paymentDate: 결제일 까지\n',
        'rooms: 룸목록\n',
        'rooms.Index: 룸번호\n',
        'rooms.name: 룸이름\n',
        'rooms.payment: 기본요금(룸월가격)\n',
        'payment_month: 월과금\n',
        'unpaid_fee: 미납요금\n',
        'tax: 부가세\n',
        'total_payment: 총결제금액\n',
        'cash: 보유캐시\n',
        'estimate_diff: 예상차액\n',
      ]
    },
    http: {path:'/get-manager-payment', verb: 'get'}
  });


  Store.getAllSystemInfo = function(cb) {
    var Room = Store.app.models.Room;
    const query = {
      where: {
        status: 'normal'
      }
    }
    var result = {}
    Store.find(query, (err, stores) => {
      if (err) {
        return cb(err, "error");
      } else {
        result.stores = stores.length;
        const queryRoom = {
          where: {
            or: [
              { status: 'waitting' },
              { status: 'working' },
            ]
          }
        }
        Room.find(queryRoom, (err, rooms) => {
          if (err) {
            return cb(err, "error");
          } else {
            result.rooms = rooms.length;
            return cb(null, Common.makeResult(true, 'success', result));
          }
        })
      }
    })
  }
  Store.remoteMethod('getAllSystemInfo', {
    accepts: [
    ],
    description: [
      '(어드민) 시스템관리 페이지에서 매장총수와 룸총개수를 표시\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'stores: 매장수\n',
        'rooms: 룸개수\n',
      ]
    },
    http: {path:'/systeminfo', verb: 'get'}
  });



  // Store.getStoreInfobyId = async(storeId) => {
  //   try {
  //     const storeObj = await Store.findById(storeId);
  //     const room_num = await storeObj.room.find();
  //     const result = {
  //       storeAddress: storeAddress,
  //       storePhone: storePhone,
  //       room_num: room_num,
  //     };
  //     return Promise.resolve(Common.makeResult(true, 'success', result));
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // }

  // Store.remoteMethod('getStoreInfobyId', {
  //   accepts: [
  //   ],
  //   description: [
  //     '매장아이디를 가지고 매장정보얻기\n',
  //     'role: every only'
  //   ],
  //   returns: {
  //     arg: 'res',
  //     type: 'object',
  //     description: [
  //       'storeAddress: 매장주소\n',
  //       'storePhone: 매장전화번호\n',
  //       'room_num: 설비대수\n',
  //     ]
  //   },
  //   http: {path:'/systeminfo', verb: 'get'}
  // });

  Store.getGameCount = async(storeId) => {
    const Room = Store.app.models.Room;
    try {
      const storeObj = await Store.findById(storeId);
      const rooms = await storeObj.room.find({});
      let queryDay = {
        where: {
          game_holenum: 18,
          startedAt: { gt: Date.now() - 1000 * 3600 * 24 }
        }
      };
      let queryWeek = {
        where: {
          game_holenum: 18,
          startedAt: { gt: Date.now() - 1000 * 3600 * 24 * 7 }
        }
      };
      let queryMonth = {
        where: {
          game_holenum: 18,
          startedAt: { gt: Date.now() - 1000 * 3600 * 24 * 30 }
        }
      };
      let count_day_9 = 0, count_day_18 = 0, count_week_9 = 0, count_week_18 = 0, count_month_9 = 0, count_month_18 = 0;
      for (let roomObj of rooms) {
        queryDay.where.game_holenum = 9;
        const games_9 = await roomObj.game.find(queryDay);
        count_day_9 += (await roomObj.game.find(queryDay)).length;
        queryDay.where.game_holenum = 18;
        count_day_18 += (await roomObj.game.find(queryDay)).length;
        
        queryWeek.where.game_holenum = 9;
        count_week_9 += (await roomObj.game.find(queryWeek)).length;
        queryWeek.where.game_holenum = 18;
        count_week_18 += (await roomObj.game.find(queryWeek)).length;

        queryMonth.where.game_holenum = 9;
        count_month_9 += (await roomObj.game.find(queryMonth)).length;
        queryMonth.where.game_holenum = 18;
        count_month_18 += (await roomObj.game.find(queryMonth)).length;
      }
      return Promise.resolve(Common.makeResult(true, 'success', {
        count_day_9: count_day_9,
        count_day_18: count_day_18,
        count_week_9: count_week_9,
        count_week_18: count_week_18,
        count_month_9: count_month_9,
        count_month_18: count_month_18,
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  

  
  Store.getStoreInfoByToken = async(access_token) => {
    const Accounts = Store.app.models.Accounts;
    try {
      const res_token = await Accounts.getSelfInfo(access_token);
      if (!res_token.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
      }
      const userObj = res_token.result;
      if (userObj.role != 'manager') {
        return Promise.resolve(Common.makeResult(false, 'this user is not a manager'));
      }
      const storeObj = await userObj.store.get();
      const res = await Store.getStoreById(storeObj.id);
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      } else {
        const data = res.result;
        const result = {
          store_name: storeObj.storeName,
          cash: storeObj.cash,
          room_count: data.room_count,
          room_working_count: data.room_working_count,
          room_waitting_count: data.room_waitting_count,
          game_last_time: Date(),
        }
        const res_gameCounts = await Store.getGameCount(storeObj.id);
        if (res_gameCounts.success) {
          result.gameCounts = res_gameCounts.result;
        }
        return Promise.resolve(Common.makeResult(true, 'success', result));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Store.remoteMethod('getStoreInfoByToken', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true}
    ],
    description: [
      '토큰을 가지고 관리자의 매장정보를 얻는다.\n',
      'role: manager\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'store_name: 매장이름\n',
        'cash: 캐쉬\n',
        'room_count: 룸개수\n',
        'room_working_count: 사용중인 장비수\n',
        'room_waitting_count: 대기중인 장비수\n',
        'game_last_time: 마지막 라운딩 타임\n',
        'gameCounts.count_day_9: 9홀 일별라운딩수\n',
        'gameCounts.count_day_18: 18홀 일별라운딩수\n',
        'gameCounts.count_week_9: 9홀 주별라운딩수\n',
        'gameCounts.count_week_18: 18홀 주별라운딩수\n',
        'gameCounts.count_month_9: 9홀 월별라운딩수\n',
        'gameCounts.count_month_18: 18홀 월별라운딩수\n',
      ]
    },
    http: {path:'/getstore-bytoken', verb: 'post'}
  });

  Store.getGameCount_Day = async(storeId) => {
    const Room = Store.app.models.Room;
    try {
      const storeObj = await Store.findById(storeId);
      const rooms = await storeObj.room.find({});
      let results = [];
      let total_9 = 0, total_18 = 0;
      for (let i = 0; i < 30; i++) {
        let date1 = new Date();
        date1.setDate(date1.getDate() - i);
        let date2 = new Date();
        date2.setDate(date2.getDate() - i + 1);
        const query1 = {
          where: {
            game_holenum: 9,
            game_staus: 1,
            endedAt: { between: [date1, date2] }
          }
        }
        const query2 = {
          where: {
            game_holenum: 18,
            game_staus: 1,
            endedAt: { between: [date1, date2] }
          }
        }
        let game_count_9 = 0, game_count_18 = 0;
        for (let roomObj of rooms) {
          game_count_9 += (await roomObj.game.find(query1)).length;
          game_count_18 += (await roomObj.game.find(query2)).length;
        }
        total_9 += game_count_9;
        total_18 += game_count_18;
        results.push({
          date: date1,
          count: game_count_9,
          count: game_count_18
        });
      }
      return Promise.resolve(Common.makeResult(true, 'success', {
        total_9: total_9, 
        total_18: total_18, 
        array: results
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Store.getStoreCountDay = async(access_token) => {
    const Accounts = Store.app.models.Accounts;
    try {
      const res_token = await Accounts.getSelfInfo(access_token);
      if (!res_token.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
      }
      const userObj = res_token.result;
      if (userObj.role != 'manager') {
        return Promise.resolve(Common.makeResult(false, 'this user is not a manager'));
      }
      const storeObj = await userObj.store.get();
      const res = await Store.getGameCount_Day(storeObj.id);
      if (!res.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      } else {
        return Promise.resolve(Common.makeResult(true, 'success', res.result));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Store.remoteMethod('getStoreCountDay', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true}
    ],
    description: [
      '토큰을 가지고 관리자의 일자별게임현황정보를 얻는다.\n',
      'role: manager\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'store_name: 매장이름\n',
        'cash: 캐쉬\n',
        'room_count: 룸개수\n',
        'room_working_count: 사용중인 장비수\n',
        'room_waitting_count: 대기중인 장비수\n',
        'game_last_time: 마지막 라운딩 타임\n',
        'gameCounts.count_day_9: 9홀 일별라운딩수\n',
        'gameCounts.count_day_18: 18홀 일별라운딩수\n',
        'gameCounts.count_week_9: 9홀 주별라운딩수\n',
        'gameCounts.count_week_18: 18홀 주별라운딩수\n',
        'gameCounts.count_month_9: 9홀 월별라운딩수\n',
        'gameCounts.count_month_18: 18홀 월별라운딩수\n',
      ]
    },
    http: {path:'/get-games-day', verb: 'post'}
  });



  // Store.searchGameLog = async(storeObj, date1, date2, searchType, serachKey) => {
  //   const Room = Store.app.models.Room;
  //   try {
  //     const rooms = await storeObj.room.find({});
  //     const qurey_log = {
  //       where: {
  //         createdAt: { between: [date1, date2] }
  //       }
  //     }
  //     let qurey_user= {
  //       where: {
  //         status: 'normal'
  //       }
  //     }
  //     if (searchType == 'nickname') {
  //       qurey_user.where.nickname = { like: serachKey };
  //     }
  //     for (let roomObj of rooms) {
  //       const games = await roomObj.game.find({});
  //       for (let gameObj of games) {
  //         const gameLogs = await gameObj.game_log.find(qurey_log);
  //         for (let logObj of gameLogs) {
  //           const userObj = await logObj.accounts.find(qurey_user);
  //         }
  //       }
  //     }
  //   } catch(e) {
  //     return reject(e);
  //   }
  // }
  
  // Store.searchGameLog = async(access_token, date1, date2, searchType, serachKey) => {
  //   const Accounts = Store.app.models.Accounts;
  //   try {
  //     const res_token = await Accounts.getSelfInfo(access_token);
  //     if (!res_token.success) {
  //       return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
  //     }
  //     const userObj = res_token.result;
  //     if (userObj.role != 'manager') {
  //       return Promise.resolve(Common.makeResult(false, 'this user is not a manager'));
  //     }
  //     const storeObj = await userObj.store.get();
  //     const res = await Store.searchGameLog(storeObj);
  //     if (!res.success) {
  //       return Promise.resolve(Common.makeResult(false, 'getAllGameLog is failed'));
  //     }
  //     const result = res.result;
  //     return Promise.resolve(Common.makeResult(true, 'success', result));
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // };

  // Store.remoteMethod('searchGameLog', {
  //   accepts: [
  //     {arg: 'access_token', type: 'string', required: true}
  //   ],
  //   description: [
  //     '토큰을 가지고 관리자의 일자별게임현황정보를 얻는다.\n',
  //     'role: manager\n',
  //   ],
  //   returns: {
  //     arg: 'res',
  //     type: 'object',
  //     description: [
  //       'store_name: 매장이름\n',
  //       'cash: 캐쉬\n',
  //       'room_count: 룸개수\n',
  //       'room_working_count: 사용중인 장비수\n',
  //       'room_waitting_count: 대기중인 장비수\n',
  //       'game_last_time: 마지막 라운딩 타임\n',
  //       'gameCounts.count_day_9: 9홀 일별라운딩수\n',
  //       'gameCounts.count_day_18: 18홀 일별라운딩수\n',
  //       'gameCounts.count_week_9: 9홀 주별라운딩수\n',
  //       'gameCounts.count_week_18: 18홀 주별라운딩수\n',
  //       'gameCounts.count_month_9: 9홀 월별라운딩수\n',
  //       'gameCounts.count_month_18: 18홀 월별라운딩수\n',
  //     ]
  //   },
  //   http: {path:'/get-games-day', verb: 'post'}
  // });

  

  
  Store.getUnpaidStores = async(pageNum, pageIndex) => {
    if (pageNum == undefined) pageNum = 100;
    if (pageIndex == undefined) pageIndex = 0;

    const query = {
      where: {
        cash: { lt: 0 }
      },
      limit: pageNum,
      skip: pageNum * pageIndex
    };

    try {
      let result = [];
      const stores = await Store.find(query);
      for (let key in stores) {
        const storeObj = stores[key];
        // let unpaid_date;
        // const qurey_log = {
        //   where: {

        //   }
        // }
        // const cashLog = await storeObj.cashLog.find(qurey_log);
        // if (!cashLog || cashLog.length == 0) {
        //   unpaid_date = storeObj.payment_date;
        // } else {
        //   // unpaid_date = 
        // }
        result.push({
          id: storeObj.id,
          storeName: storeObj.storeName,
          manager_name: storeObj.manager_name,
          customer_name: storeObj.customer_name,
          cash: storeObj.cash
        })
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('getUnpaidStores', {
    accepts: [
      {arg: 'pageNum', type: 'number', required: false},
      {arg: 'pageIndex', type: 'number', required: false}
    ],
    description: [
      '(어드민) 요금미납 점주목록.'
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'storeName: 점포명\n',
        'manager_name: 점주명\n',
        'unpaid_cash: 미납요금\n',
        'customer_name: 영업담당자이름\n',
      ]
    },
    http: {path:'/get-unpaid', verb: 'get'}
  });

  // 
  Store.getPaidStores = async(date1, date2) => {
    if (!date1) {
      date1 = new Date(2018, 1, 1);
    }
    if (!date2) {
      date2 = new Date();
      date2.setDate(date2.getDate() + 1);
    }
    const CashLog = Store.app.models.CashLog;
    try {
      const qurey = {
        where: {
          releasedAt: {
            between: [date1, date2]
          },
          type: 'charge'
        }
      }
      const cash_logs = await CashLog.find(qurey);
      let grouped = {};
      // var grouped = _.mapValues(_.groupBy(cash_logs, 'storeId'), clist => clist.map(car => _.omit(cash_logs, 'storeId')));
      cash_logs.map(cashLogObj => {
        const storeId = cashLogObj.storeId;
        if (grouped[storeId]) {
          grouped[storeId].amount += cashLogObj.amount;
        } else {
          grouped[storeId] = {};
          grouped[storeId].amount = cashLogObj.amount;
        }
      })
      let results = [];
      for (let storeId in grouped) {
        const storeObj = await Store.findById(storeId);
        if (storeObj) {
          results.push({
            id: storeId,
            manager_name: storeObj.manager_name,
            storeName: storeObj.storeName,
            customer_name: storeObj.customer_name,
            amount: grouped[storeId].amount
          })
        }
      }
      results.sort(function (a, b) {
        if (a.amount > b.amount) {
          return 1;
        }
        if (a.amount < b.amount) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      return Promise.resolve(Common.makeResult(true, 'success', results));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  
  // 
  Store.getPaidStoresAtWeek = async() => {
    try {
      let today = new Date();
      var first = today.getDate() - today.getDay();
      var last = first + 6;
      var date1 = new Date(today.setDate(first)).toUTCString()
      var date2 = new Date(today.setDate(last)).toUTCString();
      const res = await Store.getPaidStores(date1, date2);
      if (res.success) {
        return Promise.resolve(Common.makeResult(true, 'success', res.result));
      } else {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  // 
  Store.getPaidStoresAtMonth = async() => {
    try {
      let today = new Date();
      let date1 = new Date(today.getFullYear(), today.getMonth(), 1);
      let date2 = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const res = await Store.getPaidStores(date1, date2);
      if (res.success) {
        return Promise.resolve(Common.makeResult(true, 'success', res.result));
      } else {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  // 
  Store.getPaidStoresAtYear = async() => {
    try {
      let today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      let date2 = new Date();
      date2.setDate(today.getDate() + 1);
      let date1 = new Date(today.getFullYear() - 1, 1, 1);
      const res = await Store.getPaidStores(date1, date2);
      if (res.success) {
        return Promise.resolve(Common.makeResult(true, 'success', res.result));
      } else {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  // 
  Store.getPaidStoresAtToday = async(pageNum, pageIndex) => {
    if (pageNum == undefined) pageNum = 100;
    if (pageIndex == undefined) pageIndex = 0;
    try {
      let date1 = new Date();
      date1.setHours(0);
      date1.setMinutes(0);
      date1.setSeconds(0);
      let date2 = new Date();
      date2.setDate(date1.getDate() + 1);
      const res = await Store.getPaidStores(date1, date2);
      if (res.success) {
        return Promise.resolve(Common.makeResult(true, 'success', res.result));
      } else {
        return Promise.resolve(Common.makeResult(false, res.content));
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('getPaidStoresAtToday', {
    accepts: [
      {arg: 'pageNum', type: 'number', required: false},
      {arg: 'pageIndex', type: 'number', required: false}
    ],
    description: [
      '(어드민) 금일요금납부 점주목록.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'storeName: 점포명\n',
        'manager_name: 점주명\n',
        'customer_name: 영업담당자이름\n',
      ]
    },
    http: {path:'/get-paidtoday', verb: 'get'}
  });

  
  // 
  Store.getAdminPaidStores = async(storeId, pay_date, pay_amount) => {
    const CashLog = Store.app.models.CashLog;
    try {
      const storeObj = Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      const data = {
        cash: pay_amount,
        amount: pay_amount,
        type: 'pay',
        releasedAt: pay_date
      }
      storeObj.cashLog.create();
      let results = [];
      let date1 = new Date();
      date1.setDate(date1.getDate());
      let date2 = new Date();
      date2.setDate(date2.getDate() + 1);
      const qurey = {
        where: {
          createdAt: {
            between: [date1, date2]
          }
        },
        limit: pageNum,
        skip: pageNum * pageIndex
      }
      const cash_logs = await CashLog.find(qurey);
      for (let key in cash_logs) {
        const cashLogObj = cash_logs[key];
        cashLogObj.store();
        results.push({
          id: storeObj.id,
          storeName: storeObj.storeName,
          customer_name: storeObj.customer_name,
          unpaid_date: unpaid_date
        })
      }
      return Promise.resolve(Common.makeResult(true, 'success', results));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('getAdminPaidStores', {
    accepts: [
      {arg: 'pageNum', type: 'number', required: false},
      {arg: 'pageIndex', type: 'number', required: false}
    ],
    description: [
      '금일요금납부 점주목록.\n',
      'role: admin\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'storeName: 점포명\n',
        'manager_name: 점주명\n',
        'customer_name: 영업담당자이름\n',
      ]
    },
    http: {path:'/get-admin-paidstores', verb: 'get'}
  });


  // 
  Store.verifyChargeStore = async(storeId, releasedAt, amount) => {
    const CashLog = Store.app.models.CashLog;
    try {
      let storeObj = await Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      const data = {
        cash: storeObj.cash + amount,
        amount: amount,
        type: 'charge',
        releasedAt: releasedAt,
        createdAt: Date()
      }
      storeObj = await storeObj.updateAttribute('cash', data.cash);
      const cashLogObj = await storeObj.cashLog.create(data);
      const result = {
        storeName: storeObj.storeName,
        manager_name: storeObj.manager_name,
        customer_name: storeObj.customer_name,
        cash: storeObj.cash,
        cashLogId: cashLogObj.id,
        releasedAt: releasedAt,
        amount: amount
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Store.remoteMethod('verifyChargeStore', {
    accepts: [
      {arg: 'storeId', type: 'string', required: true, description: '충전신청한 매장아이디'},
      {arg: 'releasedAt', type: 'date', required: true, description: '충전한 날짜'},
      {arg: 'amount', type: 'number', required: true, description: '충전금액'}
    ],
    description: [
      '점주로부터 접수된 충전신청을 확인한다.\n',
      'role: admin\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'storeName: 점포명\n',
        'manager_name: 점주명\n',
        'customer_name: 영업담당자이름\n',
      ]
    },
    http: {path:'/verify-charge', verb: 'post'}
  });
  
  
  // 
  Store.saveRoomsOfStore = async(storeId, rooms) => {
    const CashLog = Store.app.models.CashLog;
    try {
      let storeObj = await Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      for (let room of rooms) {
        if (room.id) {
          let roomObj = await storeObj.room.updateById(room.id, room);
        } else {
          return Promise.resolve(Common.makeResult(false, 'wrong room data'));
        }
      }
      return Promise.resolve(Common.makeResult(true, 'success', rooms));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Store.remoteMethod('saveRoomsOfStore', {
    accepts: [
      {arg: 'storeId', type: 'string', required: true, description: '보관하려는 매장아이디'},
      {arg: 'rooms', type: 'array', required: true, description: 'room 배렬 [{id: xxx, status: "stopped"}, ...] On일때 waitting, Off일때 stopped'},
    ],
    description: [
      '(어드민) 시설제어창에서 제어된 시설을 보관한다.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
      ]
    },
    http: {path:'/save-rooms', verb: 'post'}
  });
  
  Store.getStoreStatistics = async(search, date1, date2) => {
    if (!search) search = '';
    if (!date1) {
      date1 = new Date();
      // date1.setHours(0);
      // date1.setMinutes(0);
      // date1.setSeconds(0);
      date1.setDate(date1.getDate() - 30);
    }
    if (!date2) {
      date2 = new Date();
    }
    const Accounts = Store.app.models.Accounts;
    const Games = Store.app.models.Games;
    try {
      // for (let i = 0; i < 30; i++) {
      //   const delta = (date2.getTime() - date1.getTime()) / 30;
      //   const t1 = new Date();
      //   t1.setTime(date1.getTime() + delta * i);
      //   const t2 =  new Date(t1.getTime() + delta * (i + 1));
      //   let query_game = {
      //     where: {
      //       game_holenum: 18,
      //       endedAt: {
      //         between: [t1, t2]
      //       }
      //     }
      //   }
      const store_results = [];
      const query = {
        where: {
          status: 'normal',
          storeName: { like: search, options: 'i' }
        }
      }
      const stores = await Store.find(query);
      let total_games9 = 0;
      let total_games18 = 0;
      for (let storeObj of stores) {
        const rooms = await storeObj.room.find({});
        let query_game = {
          where: {
            game_holenum: 18,
            endedAt: {
              between: [date1, date2]
            },
            roomId: { inq: [] }
          }
        }
        for (let roomObj of rooms) {
          query_game.where.roomId.inq.push(roomObj.id.toString());
        }
        const games18 = await Games.find(query_game);

        query_game.where.game_holenum = 9;
        const games9 = await Games.find(query_game);
        store_results.push({
          storeId: storeObj.id,
          manager_name: storeObj.manager_name,
          customer_name: storeObj.customer_name,
          storeName: storeObj.storeName,
          games18_num: games18.length,
          games9_num: games9.length,
          total_num: games18.length + games9.length
        })
        total_games9 += games9.length;
        total_games18 += games18.length;
      }
      return Promise.resolve(Common.makeResult(true, 'success', {
        store_results: store_results,
        total_games9: total_games9,
        total_games18: total_games18,
        total_games: total_games18 + total_games9,
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getStoreStatistics', {
    accepts: [
      {arg: 'search', type: 'string', required: false, description: '검색문자렬, 빈문자렬일때 전체검색'},
      {arg: 'date1', type: 'date', required: false, description: '검색구간1, 빈문자렬일때 30일전'},
      {arg: 'date2', type: 'date', required: false, description: '검색구간2, 빈문자렬일때 현재시간'}
    ],
    description: [
      '(어드민) 사업자별매출관리.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'store_results.storeId: 매장아이디\n',
        'store_results.manager_name: 점주명\n',
        'store_results.storeName: 점포명\n',
        'store_results.customer_name: 영업담당자 이름\n',
        'store_results.games18_num: 18홀 라운딩\n',
        'store_results.games9_num: 9홀 라운딩\n',
        'store_results.total_num: 라운딩합계\n',
        'total_games9: 9홀 라운딩합계\n',
        'total_games18: 18홀 라운딩합계\n',
        'total_games: 총 라운딩합계\n',
      ]
    },
    http: {path:'/get-statistics', verb: 'get'}
  });


  function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }
  
  // Store.getManagerGameCountsMonthly = async(access_token, startDay, endDay) => {
  //   const Store = CashLog.app.models.Store;
  //   try {
  //     const res_user = await Store.getStoreFromToken(access_token);
  //     let storeObj;
  //     if (!res_user.success) {
  //       return Promise.resolve(Common.makeResult(false, res_user.content));
  //     } else {
  //       storeObj = res_user.result;
  //     }
  //     const res = await Store.getGameCountsMonthly(storeObj.id, startDay, endDay);
  //     if (!res.success) {
  //       return Promise.resolve(Common.makeResult(false, res_user.content));
  //     } else {
  //       return Promise.resolve(res);
  //     }
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // };
  // Store.remoteMethod('getManagerGameCountsMonthly', {
  //   accepts: [
  //     {arg: 'storeId', type: 'string', required: true, description: '매장아이디'},
  //     {arg: 'startDay', type: 'date', required: false, description: "조회시작일, 빈문자이면 매장설치일"},
  //     {arg: 'endDay', type: 'date', required: false, description: "조회마감일, 빈문자이면 현재시간까지"}
  //   ],
  //   description: [
  //     '(매니저) 라운드통계.\n',
  //   ],
  //   returns: {
  //     arg: 'res',
  //     type: 'object',
  //     description: [
  //       'storeId: 매장아이디\n',
  //       'installedDate: 설치일\n',
  //       'total9: 합 9홀 라운드수\n',
  //       'total18: 합 18홀 라운드수\n',
  //       'total: 합계\n',
  //       'aryCounts: 월별 라운드목록\n',
  //       'aryCounts.date1: 평가기간 시작\n',
  //       'aryCounts.date2: 평가기간 끝\n',
  //       'aryCounts.count_total9: 9홀 라운드수\n',
  //       'aryCounts.count_total18: 18홀 라운드수\n',
  //       'aryCounts.count_total: 합계\n',
  //     ]
  //   },
  //   http: {path:'/get-manager-gamecount-monthly', verb: 'get'}
  // });

  Store.getGameCountsMonthly = async(storeId, startDay, endDay) => {
    const Games = Store.app.models.Games;
    try {
      const storeObj = await Store.findById(storeId);
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong storeId'));
      }
      const rooms = await storeObj.room.find({});
      
      if (!startDay) {
        startDay = storeObj.installedDate;
      }
      const date1 = new Date(startDay.getFullYear(), startDay.getMonth(), 1);
      if (!endDay) {
        endDay = new Date();
      }
      const nMonthDiff = monthDiff(date1, endDay);
      let total9 = 0, total18 = 0;
      let aryCounts = [];
      for (let nMonth = 0; nMonth <= nMonthDiff + 1; nMonth++) {
        const t1 = new Date(endDay.getFullYear(), date1.getMonth() + nMonth, 1);
        const t2 = new Date(endDay.getFullYear(), date1.getMonth() + nMonth + 1, 1);
        const res9 = await Games.getGamesCount(9, t1, t2, rooms);
        const res18 = await Games.getGamesCount(18, t1, t2, rooms);
        total9 += res9.game_player;
        total18 += res18.game_player;
        aryCounts.push({
          date1: t1,
          date2: t2,
          count_total9: res9.game_player,
          count_total18: res18.game_player,
          count_total: res9.game_player * 0.5 + res18.game_player
        })
      }
      return Promise.resolve(Common.makeResult(true, 'success', {
        storeId: storeObj.id,
        manager_name: storeObj.manager_name,
        storeName: storeObj.storeName,
        installedDate: storeObj.installedDate,
        total9: total9,
        total18: total18,
        total: total9 * 0.5 + total18,
        aryCounts: aryCounts
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getGameCountsMonthly', {
    accepts: [
      {arg: 'storeId', type: 'string', required: true, description: '매장아이디'},
      {arg: 'startDay', type: 'date', required: false, description: "조회시작일, 빈문자이면 매장설치일"},
      {arg: 'endDay', type: 'date', required: false, description: "조회마감일, 빈문자이면 현재시간까지"}
    ],
    description: [
      '(어드민) 사업자별 월별 매출관리.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'storeId: 매장아이디\n',
        'installedDate: 설치일(최초 장비등록일)\n',
        'manager_name: 점주명\n',
        'storeName: 점포명\n',
        'total9: 합 9홀 라운드수\n',
        'total18: 합 18홀 라운드수\n',
        'total: 합계\n',
        'aryCounts: 월별 라운드목록\n',
        'aryCounts.date1: 평가기간 시작\n',
        'aryCounts.date2: 평가기간 끝\n',
        'aryCounts.count_total9: 9홀 라운드수\n',
        'aryCounts.count_total18: 18홀 라운드수\n',
        'aryCounts.count_total: 합계\n',
      ]
    },
    http: {path:'/get-gamecount-monthly', verb: 'get'}
  });
  
  Store.getPaymentStatistics = async() => {
    try {
      const result = {};
      const res_1 = await Store.getPaidStoresAtToday(1000);
      if (res_1.success) {
        result.paidAtToday_num = res_1.result.length;
        let amount_sum = 0;
        res_1.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.paidAtToday_amount = amount_sum;
      } else {
        result.paidAtToday_num = 0;
        result.paidAtToday_amount = 0;
      }
      
      const res_2 = await Store.getPaidStoresAtWeek();
      if (res_2.success) {
        result.paidAtWeek_num = res_2.result.length;
        let amount_sum = 0;
        res_2.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.paidAtWeek_amount = amount_sum;
      } else {
        result.paidAtWeek_num = 0;
        result.paidAtWeek_amount = 0;
      }

      const res_3 = await Store.getPaidStoresAtMonth();
      if (res_3.success) {
        result.paidAtMonth_num = res_3.result.length;
        let amount_sum = 0;
        res_3.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.paidAtMonth_amount = amount_sum;
      } else {
        result.paidAtMonth_num = 0;
        result.paidAtMonth_amount = 0;
      }

      const res_4 = await Store.getUnpaidStores(1000);
      if (res_4.success) {
        result.unpaidAtToday = res_4.result.length;
        let amount_sum = 0;
        res_4.result.map(obj => {
          amount_sum += obj.cash;
        })
        result.unpaidAtToday_amount = amount_sum;
      } else {
        result.unpaidAtToday = 0;
        result.unpaidAtToday_amount = 0;
      }

      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };

  Store.remoteMethod('getPaymentStatistics', {
    accepts: [
    ],
    description: [
      '(어드민) 요금납부현황.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'paidAtToday_num: 금일 요금 납부한 점주의 총수\n',
        'paidAtToday_amount: 금일 요금 납부한 총액\n',
        'paidAtWeek_num: 금주 요금 납부한 점주의 총수\n',
        'paidAtWeek_amount: 금주 요금 납부한 총액\n',
        'paidAtMonth_num: 금월 요금 납부한 점주의 총수\n',
        'paidAtMonth_amount: 금월 요금 납부한 총액\n',
        'unpaidAtToday: 미납요금 점주의 총수\n',
        'unpaidAtToday_amount: 미납요금 총액\n',
      ]
    },
    http: {path:'/get-pay-statistics', verb: 'get'}
  });


  
  Store.getPaymentStatistics2 = async() => {
    try {
      const result = {};
      const res_1 = await Store.getPaidStoresAtToday(1000);
      if (res_1.success) {
        let amount_sum = 0;
        res_1.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.paidAtToday_amount = amount_sum;
      } else {
        result.paidAtToday_amount = 0;
      }

      const res_2 = await Store.getPaidStoresAtMonth();
      if (res_2.success) {
        let amount_sum = 0;
        res_2.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.aryMonth = res_2.result;
        result.paidAtMonth_amount = amount_sum;
      } else {
        result.aryMonth = [];
        result.paidAtMonth_amount = 0;
      }

      const res_3 = await Store.getPaidStoresAtYear();
      if (res_3.success) {
        let amount_sum = 0;
        res_3.result.map(obj => {
          amount_sum += obj.amount;
        })
        result.aryYear = res_3.result;
        result.paidAtYear_amount = amount_sum;
      } else {
        result.aryYear = [];
        result.paidAtYear_amount = 0;
      }

      const res_4 = await Store.getPaidStores();
      if (res_4.success) {
        result.aryAll = res_4.result;
      } else {
        result.aryAll = [];
      }

      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getPaymentStatistics2', {
    accepts: [
    ],
    description: [
      '(어드민) 기간별납부현황.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'paidAtToday_amount: 금일 요금 납부한 총액\n',
        'paidAtMonth_amount: 금월 요금 납부한 총액\n',
        'paidAtYear_amount: 금월 요금 납부한 총액\n',
        'aryMonth: 금월납부요금 목록\n',
        'aryYear: 금년납부요금 목록\n',
        'aryAll: 전체납부요금 목록\n',
        'obj.manager_name: 점주명\n',
        'obj.customer_name: 영업사원명\n',
        'obj.amount: 요금납부액\n',
      ]
    },
    http: {path:'/get-pay-statistics2', verb: 'get'}
  });



  Store.getStoreFromToken = async(access_token) => {
    const Accounts = Store.app.models.Accounts;
    try {
      const res_token = await Accounts.getSelfInfo(access_token);
      if (!res_token.success) {
        return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
      }
      const userObj = res_token.result;
      if (userObj.role != 'manager') {
        return Promise.resolve(Common.makeResult(false, 'this user is not a manager'));
      }
      const storeObj = await userObj.store.get();
      if (!storeObj) {
        return Promise.resolve(Common.makeResult(false, 'this user has no store'));
      }
      return Promise.resolve(Common.makeResult(true, 'success', storeObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  Store.getStoreSalesByDate = async(storeObj, startDay, endDay) => {
    const Games = Store.app.models.Games;
    try {
      startDay = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 0, 0, 0);
      endDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() + 1, 0, 0, 0);
      const oneDay = 1000 * 60 * 60 * 24;
      const diff_day = Math.round((endDay - startDay) / oneDay);
      let delta_day = Math.round(diff_day / 20);
      if (delta_day < 1) delta_day = 1;

      let rooms;
      if(storeObj) {
        rooms = await storeObj.room.find({});
      }
      let total9 = 0, total18 = 0;
      let total9_login = 0, total9_no_login = 0;
      let total18_login = 0, total18_no_login = 0;
      let aryCounts = [];
      for (let nDay = 0; nDay < diff_day; nDay += delta_day) {
        const t1 = startDay.addDays(nDay);
        const t2 = startDay.addDays(nDay + delta_day);
        const res9 = await Games.getGamesCount(9, t1, t2, rooms);
        const res18 = await Games.getGamesCount(18, t1, t2, rooms);
        total9 += res9.game_player;
        total9_login += res9.game_player_login;
        total9_no_login += (res9.game_player - res9.game_player_login);
        total18 += res18.game_player;
        total18_login += res18.game_player_login;
        total18_no_login += (res18.game_player - res18.game_player_login);
        aryCounts.push({
          startDay: t1,
          endDay: t2,
          count_total9: res9.game_player,
          count_login9: res9.game_player_login,
          count_not_login9: res9.game_player - res9.game_player_login,
          count_total18: res18.game_player,
          count_login18: res18.game_player_login,
          count_not_login18: res18.game_player - res18.game_player_login,
          count_total: res9.game_player * 0.5 + res18.game_player
        })
      }
      return Promise.resolve({
        period: diff_day,
        total9: total9,
        total9_login: total9_login,
        total9_no_login: total9_no_login,
        total18: total18,
        total18_login: total18_login,
        total18_no_login: total18_no_login,
        total: total9 * 0.5 + total18,
        aryCounts: aryCounts
      });
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  Store.getGameStatisticsByManager = async(access_token, startDay, endDay) => {
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      const result = await Store.getStoreSalesByDate(storeObj, startDay, endDay);
      if (!result) {
        return Promise.resolve(Common.makeResult(false, 'failed: getStoreSalesByDate()'));
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getGameStatisticsByManager', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
      {arg: 'startDay', type: 'date', required: true, description: "조회시작일"},
      {arg: 'endDay', type: 'date', required: true, description: "조회마감일"}
    ],
    description: [
      '(매니저싸이트) 일자별라운딩.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'period: 기간 (일)\n',
        'total9: 9홀라운딩 총합\n',
        'total9_login: 9홀라운딩 (로그인)\n',
        'total9_no_login: 9홀라운딩 (비로그인)\n',
        'total18: 18홀라운딩 총합\n',
        'total18_login: 18홀라운딩 (로그인)\n',
        'total18_no_login: 18홀라운딩 (비로그인)\n',
        'total: 합계\n',
        'aryCounts: 일자별 목록\n',
        'aryCounts.startDay: 한개 segment의 시작일\n',
        'aryCounts.endDay: 한개 segment의 마감일\n',
        'aryCounts.count_total9: 9홀게임 라운딩수\n',
        'aryCounts.count_login9: 9홀게임 라운딩수(로그인)\n',
        'aryCounts.count_not_login9: 9홀게임 라운딩수(비로그인)\n',
        'aryCounts.count_total18: 18홀게임 라운딩수\n',
        'aryCounts.count_login18: 18홀게임 라운딩수(로그인)\n',
        'aryCounts.count_not_login18: 18홀게임 라운딩수(비로그인)\n',
        'aryCounts.count_total: 합계\n',
      ]
    },
    http: {path:'/get-statistics-manager', verb: 'get'}
  });

  
  
  Store.getGamesOfAllStore = async(startDay, endDay) => {
    try {
      const result = await Store.getStoreSalesByDate(undefined, startDay, endDay);
      if (!result) {
        return Promise.resolve(Common.makeResult(false, 'failed: getStoreSalesByDate()'));
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getGamesOfAllStore', {
    accepts: [
      {arg: 'startDay', type: 'date', required: true, description: "조회시작일"},
      {arg: 'endDay', type: 'date', required: true, description: "조회마감일"}
    ],
    description: [
      '(매니저싸이트) 일자별라운딩.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'period: 기간 (일)\n',
        'total9: 9홀라운딩 총합\n',
        'total9_login: 9홀라운딩 (로그인)\n',
        'total9_no_login: 9홀라운딩 (비로그인)\n',
        'total18: 18홀라운딩 총합\n',
        'total18_login: 18홀라운딩 (로그인)\n',
        'total18_no_login: 18홀라운딩 (비로그인)\n',
        'total: 합계\n',
        'aryCounts: 일자별 목록\n',
        'aryCounts.startDay: 한개 segment의 시작일\n',
        'aryCounts.endDay: 한개 segment의 마감일\n',
        'aryCounts.count_total9: 9홀게임 라운딩수\n',
        'aryCounts.count_login9: 9홀게임 라운딩수(로그인)\n',
        'aryCounts.count_not_login9: 9홀게임 라운딩수(비로그인)\n',
        'aryCounts.count_total18: 18홀게임 라운딩수\n',
        'aryCounts.count_login18: 18홀게임 라운딩수(로그인)\n',
        'aryCounts.count_not_login18: 18홀게임 라운딩수(비로그인)\n',
        'aryCounts.count_total: 합계\n',
      ]
    },
    http: {path:'/get-games-allstore', verb: 'get'}
  });
  // Store.getGameStatisticsAtStore = async(access_token, startDay, endDay) => {
  //   try {
  //     const res_user = await Store.getStoreFromToken(access_token);
  //     let storeObj;
  //     if (!res_user.success) {
  //       return Promise.resolve(Common.makeResult(false, res_user.content));
  //     } else {
  //       storeObj = res_user.result;
  //     }
  //     const result = await Store.getStoreSalesByDate(storeObj, startDay, endDay);
  //     if (!result) {
  //       return Promise.resolve(Common.makeResult(false, 'failed: getStoreSalesByDate()'));
  //     }
  //     return Promise.resolve(Common.makeResult(true, 'success', result));
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // };
  // Store.remoteMethod('getGameStatisticsAtStore', {
  //   accepts: [
  //     {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
  //     {arg: 'startDay', type: 'date', required: true, description: "조회시작일"},
  //     {arg: 'endDay', type: 'date', required: true, description: "조회마감일"}
  //   ],
  //   description: [
  //     '(매니저싸이트) 라운드통계.\n',
  //   ],
  //   returns: {
  //     arg: 'res',
  //     type: 'object',
  //     description: [
  //       'period: 기간\n',
  //       'total9: 9홀라운딩 총합\n',
  //       'total9_login: 9홀라운딩 (로그인)\n',
  //       'total9_no_login: 9홀라운딩 (비로그인)\n',
  //       'total18: 18홀라운딩 총합\n',
  //       'total18_login: 18홀라운딩 (로그인)\n',
  //       'total18_no_login: 18홀라운딩 (비로그인)\n',
  //       'aryCounts: 일자별 목록\n',
  //       'aryCounts.startDay: 한개 segment의 시작일\n',
  //       'aryCounts.endDay: 한개 segment의 마감일\n',
  //       'aryCounts.count_total9: 9홀게임 라운딩수\n',
  //       'aryCounts.count_login9: 9홀게임 라운딩수(로그인)\n',
  //       'aryCounts.count_not_login9: 9홀게임 라운딩수(비로그인)\n',
  //       'aryCounts.count_total18: 18홀게임 라운딩수\n',
  //       'aryCounts.count_login18: 18홀게임 라운딩수(로그인)\n',
  //       'aryCounts.count_not_login18: 18홀게임 라운딩수(비로그인)\n',
  //     ]
  //   },
  //   http: {path:'/get-statistics-store', verb: 'get'}
  // });

  Store.getUsersAtStore = async(access_token, startDay, endDay) => {
    const Games = Store.app.models.Games;
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      const rooms = await storeObj.room.find({});
      const results = await Games.getUserGameLogs(startDay, endDay, rooms);
      return Promise.resolve(Common.makeResult(true, 'success', results));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getUsersAtStore', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
      {arg: 'startDay', type: 'date', required: true, description: "조회시작일"},
      {arg: 'endDay', type: 'date', required: true, description: "조회마감일"}
    ],
    description: [
      '(매니저웹) 매장회원정보.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'id: 아이디\n',
        'username: 유저아이디\n',
        'nickname: 닉네임\n',
        'phone: 전화번호\n',
        'count: 라운딩횟수\n',
      ]
    },
    http: {path:'/get-users-store', verb: 'get'}
  });

  
  Store.getUserGameLogAtStore = async(access_token, userId) => {
    const GameLogs = Store.app.models.GameLogs;
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      // const rooms = await storeObj.room.find({});
      const results = await GameLogs.getUserGameLogAtStore(userId, storeObj.id);
      if (results && results.length > 1) {
        const startedAt = results[0].modifiedAt;
        const endedAt = results[0].createdAt;
        return Promise.resolve(Common.makeResult(true, 'success', {
          startedAt: startedAt,
          endedAt: endedAt,
          aryLogs: results
        }));
      }
      //error db
      return Promise.resolve(Common.makeResult(false, 'there is no results'));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getUserGameLogAtStore', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
      {arg: 'userId', type: 'string', required: true, description: "유저아이디"},
    ],
    description: [
      '(매니저웹) 매장회원정보.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'startedAt: 최초방문일\n',
        'endedAt: 최종방문일\n',
        'aryLogs: 로그목록\n',
        'aryLogs.score: 타수\n',
        'aryLogs.createdAt: 날짜\n',
        'aryLogs.course: 코스이름\n',
        'aryLogs.game_holenum: 홀수 9/18\n',
      ]
    },
    http: {path:'/get-usergamelog-store', verb: 'get'}
  });


  
  Store.getManagerGameStatusByRoom = async(access_token) => {
    const Course = Store.app.models.Course;
    const Room = Store.app.models.Room;
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      const query = {
        fields: ['id', 'Index', 'name', 'status', 'machineType', 'isAllowPlay', 'handType', 'playStatus', 'playStartTime', 'playEndTime', 'createdAt', 'modifiedAt', 'payment', 'practice_time'],
        where: {
          or: [
            { status: 'waitting' },
            { status: 'working' },
            { status: 'stopped' }
          ]
        },
        order: 'Index ASC'
      }
      const rooms = await storeObj.room.find(query);
      const query_game = {
        fields: ['startedAt', 'endedAt', 'game_mode', 'player_num', 'game_staus', 'current_hole', 'game_holenum', 'course_name', 'roomId'],
        where: {
          game_staus: 0,
          //endedAt: {gt: Date.now() - 1000 * 60 * 30}
        },
        order: 'endedAt DESC'
      }
      let results = [];
      await Promise.all(rooms.map(async roomObj => {
        let gameObj;
        let prediction;
        let countTime = 0;
        const now = Date.now();
        // if (roomObj.status == 'working') {
        let game_mode = '', game_modeKr = '', course_name = '', current_hole = 0, player_num = 0, startedAt = Date();
        if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Playing || roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_TimeOut) {
          // if (roomObj.playStartTime.getTime() < now && now < roomObj.playEndTime.getTime()) {
          // } else {
          //   if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Lobby || roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Playing) {
          //     roomObj.playStatus = Common.PLAY_STATUS.kPlayStatus_TimeOut;
          //     const data = {
          //       playStatus: Common.PLAY_STATUS.kPlayStatus_TimeOut,
          //     }
          //     await roomObj.updateAttributes(data);
          //   }
          // }
          gameObj = await roomObj.game.findOne(query_game);
          if (gameObj) {
            // const roomooo = await Room.findById(gameObj.roomId);
            course_name = await Course.getCourseName(gameObj.course_name);
            game_mode = gameObj.game_mode;
            game_modeKr = Common.getGameModeKr(gameObj.game_mode);
            current_hole = gameObj.current_hole;
            player_num = gameObj.player_num;
            startedAt = gameObj.startedAt;

            prediction = new Date();
            if (roomObj.machineType == 1) {
              prediction.setTime(roomObj.playEndTime.getTime());
            } else {
              if (gameObj.game_mode == 'driving') {
                prediction.setTime(gameObj.startedAt.getTime() + roomObj.practice_time * 60 * 1000);
              } else {
                if (gameObj.current_hole == 0) {
                  prediction.setTime(gameObj.startedAt.getTime() + gameObj.player_num * 3600 * 1000);
                } else {
                  const pass_holetime = (gameObj.endedAt.getTime() - gameObj.startedAt.getTime()) / gameObj.current_hole;
                  prediction.setTime(gameObj.startedAt.getTime() + (gameObj.game_holenum - gameObj.current_hole) * pass_holetime);
                }
              }
            }
            gameObj.current_hole += 1;
            if (roomObj.machineType == 0 && gameObj.game_mode != 'driving') {
              countTime = Math.floor((now - roomObj.playStartTime.getTime()) / 1000 / 60) + 1;
            } else {
              countTime = Math.floor((roomObj.playEndTime.getTime() - now) / 1000 / 60) + 1;
            }
          } else {
            // roomObj.status = 'waitting';
            // await roomObj.updateAttribute('status', 'waitting');
          }
        } else if (roomObj.playStatus == Common.PLAY_STATUS.kPlayStatus_Lobby && roomObj.machineType == 1) {
          countTime = Math.floor((roomObj.playEndTime.getTime() - now) / 1000 / 60) + 1;
        }

        if (countTime > 60 * 12) { // 3hour
          if (roomObj.playStatus != Common.PLAY_STATUS.kPlayStatus_Stopped) {
            roomObj.playStatus = Common.PLAY_STATUS.kPlayStatus_Stopped;
            await roomObj.updateAttribute('playStatus', Common.PLAY_STATUS.kPlayStatus_Stopped);
          }
          countTime = 0;
        }
        if (countTime < 0) countTime = 0;

        results.push({
          id: roomObj.id,
          machineType: roomObj.machineType ? roomObj.machineType : 0,
          //isAllowPlay: roomObj.isAllowPlay ? roomObj.isAllowPlay : false,
          //time: roomObj.time,
          Index: roomObj.Index,
          roomName: roomObj.name,
          status: roomObj.status,
          game: gameObj,
          playStatus: roomObj.playStatus,
          playStartTime: roomObj.playStartTime,
          playEndTime: roomObj.playEndTime,
          prediction: prediction ? prediction : '',
          strHandType: Common.makeStringHandType(roomObj.handType),
          countTime: countTime,

          game_mode: game_mode,
          game_modeKr: game_modeKr,
          course_name: course_name,
          current_hole: current_hole,
          player_num: player_num,
          startedAt: startedAt,
        });
      }))
      results.sort(function(a, b){
        return a.Index - b.Index;
      })
      return Promise.resolve(Common.makeResult(true, 'success', {
        default_time: storeObj.default_time,
        rooms: results
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getManagerGameStatusByRoom', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
    ],
    description: [
      '(매니저웹) 룸별 게임현황.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'Index: 방번호\n',
        'roomName: 방이름\n',
        'status: 방상태 (waitting: 대기, working: 진행중, stopped: 정지됨)\n',
        'game.startedAt: 시작시간\n',
        'game.game_mode: 게임종류\n',
        'game.player_num: 참여인원\n',
        'game.current_hole: 진행홀\n',
        'game.game_holenum: 홀수 9/18\n',
        'game.course_name: 코스이름\n',
        'prediction: 종료예정\n',
      ]
    },
    http: {path:'/get-manager-status-room', verb: 'get'}
  });


  
  Store.getManagerGameStatusByDate = async(access_token, type, roomName, startDay, endDay, holeLimit) => {
    const GameLogs = Store.app.models.GameLogs;
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      let query = {
        fields: ['Index', 'name', 'status'],
      }
      let rooms;
      if (roomName == 'all') {
        rooms = await storeObj.room.find(query);
      } else {
        query.where = { name: roomName };
        rooms = await storeObj.room.find(query);
      }
      if (rooms.length == 0) {
        return Promise.resolve(Common.makeResult(false, 'there is no room'));
      }
      let query_game = {
        fields: ['id', 'startedAt', 'endedAt', 'game_mode', 'player_num', 'game_staus', 'current_hole', 'game_holenum', 'course_name'],
        where: {
          current_hole: {
            gte: holeLimit
          },
          startedAt: {
            between: [startDay, endDay]
          }
        },
        order: 'modifiedAt DESC'
      }
      if (type == 'driving') {
        query_game.where.game_mode = 'driving';
      } else if (type == 'game') {
        query_game.where.game_mode = { neq: 'driving'};
      }
      // let aryRoomNames = [];
      let aryGames = [];
      await Promise.all(rooms.map(async roomObj => {
        // aryRoomNames.push(roomObj.name);
        let games = await roomObj.game.find(query_game);
        games.map(game => {
          game.roomName = roomObj.name;
          game.date = new Date(game.startedAt.getFullYear(), game.startedAt.getMonth(), game.startedAt.getDate());
          game.time = (game.endedAt.getTime() - game.startedAt.getTime()) / 1000;
          game.timeByPerson = (game.time / game.player_num).toFixed(2);
        })
        aryGames = aryGames.concat(games);
      }))
      aryGames.sort(function (a, b) {
        if (a.startedAt > b.startedAt) {
          return -1;
        }
        if (a.startedAt < b.startedAt) {
          return 1;
        }
        return 0;
      });
      return Promise.resolve(Common.makeResult(true, 'success', aryGames));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('getManagerGameStatusByDate', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
      {arg: 'type', type: 'string', required: true, description: "전체/게임/연습 (all/game/driving)"},
      {arg: 'roomName', type: 'string', required: true, description: "룸이름 (전체일때 all)"},
      {arg: 'startDay', type: 'date', required: true, description: "조회시작일"},
      {arg: 'endDay', type: 'date', required: true, description: "조회마감일"},
      {arg: 'holeLimit', type: 'number', required: true, description: "홀미만 제외"}
    ],
    description: [
      '(매니저웹) 일자별 게임현황.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
        'aryRoomNames: 룸이름목록\n',
        'aryGames: 게임목록\n',
        'date: 일자\n',
        'roomName: 룸이름\n',
        'startedAt: 시작시간\n',
        'endedAt: 종료시간\n',
        'time: 소요시간(초단위)\n',
        'player_num: 인원\n',
        'current_hole: 현재홀\n',
        'game_holenum: 홀수\n',
        'timeByPerson: 인당소요시간\n',
        'course_name: 코스이름\n',
        'game_mode: 모드\n',
        'id: 게임아이디(스코어카드를 얻는데 쓰인다.)\n',
      ]
    },
    http: {path:'/get-manager-status-date', verb: 'get'}
  });

  Store.saveDefaultTime = async(access_token, time) => {
    try {
      const res_user = await Store.getStoreFromToken(access_token);
      let storeObj;
      if (!res_user.success) {
        return Promise.resolve(Common.makeResult(false, res_user.content));
      } else {
        storeObj = res_user.result;
      }
      await storeObj.updateAttribute('default_time', time);
      return Promise.resolve(Common.makeResult(true, 'success'));
    } catch(e) {
      return Promise.reject(e);
    }
  };
  Store.remoteMethod('saveDefaultTime', {
    accepts: [
      {arg: 'access_token', type: 'string', required: true, description: "매장관리자토큰"},
      {arg: 'time', type: 'number', required: true, description: "기본시간"},
    ],
    description: [
      '(매니저웹) 룸별게임현황페이지에서 기본시간설정.\n',
    ],
    returns: {
      arg: 'res',
      type: 'object',
      description: [
      ]
    },
    http: {path:'/save-defaulttime', verb: 'post'}
  });

  
};
