'use strict';


//var Course = require('./course.js');

module.exports = {
  makeResult: function(bSuccess, content, result) {
    if (bSuccess) {
      return {
        success: bSuccess,
        content: content,
        result: result
      }
    } else {
      return {
        success: bSuccess,
        content: content,
        result: result
      }
    }
  },

  isValidParamString: function(param, paramComment, cb) {
    if (!paramComment) {
      paramComment = '';
    }
    if (!param) {
      if (cb)
        cb(null, this.makeResult(false, paramComment + ' is Null'));
      return true;
    }
    if (param.length == 0) {
      if (cb)
        cb(null, this.makeResult(false, paramComment + 'is empty string'));
      return true;
    }
    return false;
  },

  groupBy: function(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
  },

  makeRandomString: function(length) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < possible.length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text.slice(0, length);
  },
  
  makeRandomNumber: function(length) {
    const now = new Date();
    var text = now.getTime() - (new Date('2018/10/1')).getTime();
    var possible = "0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));    
    return text;
  },

  clubName: [
    '드라이버',
    '우드3',
    '유틸리티3',
    '유틸리티5',
    '아이언3',
    '아이언4',
    '아이언5',
    '아이언6',
    '아이언7',
    '아이언8',
    '아이언9',
    'pw',
    'aw',
    'sw',
    '퍼팅'
  ],
  isBlankString: function(str) {
    return (!str || /^\s*$/.test(str));
  },
  getClubName: function(clubType) {
    if (clubType < 0 || clubType >= this.clubName.length) {
      clubType = 0;
    }
    return this.clubName[clubType];
  },

  //FILE_SERVER_PATH: 'http://54.180.179.66:5000/',
  FILE_SERVER_PATH: 'http://doorsgolf.com:5000/',

  getGameModeKr: function(gamemode, langId) {
    if (!langId) langId = 0;
    if (gamemode == 'stroke') {
      return '스트로크';
    } else if (gamemode == 'driving') {
      return '연습장';
    } else if (gamemode == 'stroke2') {
      return '스트로크2';
    } else if (gamemode == 'foursome') {
      return '포섬스트로크';
    }
    return '스트로크';
  },

  makeStringHandType: function(handType) {
    switch(handType) {
      case 0: return '없음';
      case 1: return '우타';
      case 2: return '좌타';
      case 3: return '양타';
    }
    return '우';
  },

  PLAY_STATUS: {
    kPlayStatus_Stopped: 0,
    // kPlayStatus_PlayWaitting: 1,
    kPlayStatus_Lobby: 2,
    kPlayStatus_Playing: 3,
    kPlayStatus_TimeOut: 4,
    // kPlayStatus_ExtendWaitting: 5,
    kPlayStatus_Count: 6,
  },

  makeRateValue: function(value, v1, v2, limit1, limit2) {
    if (!value) return 0;
    let result = limit1 + (value - v1) * (limit2 - limit1) / (v2 - v1);
    result = result > limit1 ? result : limit1;
    result = result < limit2 ? result : limit2;
    return result;
  },

  ClubDistanceForMale: [
    220, 190, 170, 180, 175, 165, 160, 150, 140, 130, 120, 110, 90, 80, 30
  ],
  ClubDistanceForFemale: [
    200, 170, 150, 160, 165, 155, 140, 130, 130, 110, 100, 95, 70, 60, 30
  ]
};
