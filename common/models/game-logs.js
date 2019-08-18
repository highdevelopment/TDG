'use strict';

var Common = require('./common.js');

module.exports = function(GameLogs) {

  GameLogs.disableRemoteMethodByName("upsert");
  GameLogs.disableRemoteMethodByName("find");
  GameLogs.disableRemoteMethodByName("replaceOrCreate");
  GameLogs.disableRemoteMethodByName("create");

  GameLogs.disableRemoteMethodByName("prototype.updateAttributes");
  GameLogs.disableRemoteMethodByName("findById");
  GameLogs.disableRemoteMethodByName("exists");
  GameLogs.disableRemoteMethodByName("replaceById");
  GameLogs.disableRemoteMethodByName("deleteById");

  GameLogs.disableRemoteMethodByName("createChangeStream");

  GameLogs.disableRemoteMethodByName("count");
  GameLogs.disableRemoteMethodByName("findOne");

  GameLogs.disableRemoteMethodByName("update");
  GameLogs.disableRemoteMethodByName("upsertWithWhere");


  //GameLogs.saveGameLogs = async(userIds, gameId, )
  // register
  GameLogs.registerGameLog = async(userId, username, gameId, storeId, course) => {
    var Accounts = GameLogs.app.models.Accounts;
    var Games = GameLogs.app.models.Games;
    var Room = GameLogs.app.models.Room;
    // try {
    //   const aryScore = JSON.parse(scores);
    //   if (!aryScore) return Promise.resolve(Common.makeResult(false, 'wrong scores'));
    // } catch(e) {
    //   return Promise.reject(e);
    // }

    try {
      const userObj = await Accounts.findById(userId);
      const gameObj = await Games.findById(gameId);
      const roomObj = await Room.findById(gameObj.roomId);
      if (roomObj.status == 'waitting') roomObj.updateAttribute('status', 'working');
      if (!gameObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong gameId'));
      }
      const scores = [];
      const putting_num = [];
      let nHoleNum = 9;
      if (gameObj.subCourse2) {
        nHoleNum = 18;
      }
      for (let i = 0; i < nHoleNum; i++) {
        scores.push(-1);
        putting_num.push(-1);
      }
      const data = {
        playerId: userId,
        playerName: username,
        game_holenum: gameObj.game_holenum,
        gameId: gameId,
        scores: scores,
        score: 0,
        putting_num: putting_num,
        createdAt: Date(),
        modifiedAt: Date(),
        game_staus: 0,
        roomId: gameObj.roomId,
        storeId: storeId,
        course: course
      }
      let gameLogObj;
      if (userObj) {
        gameLogObj = await userObj.game_log.create(data);
      } else {
        gameLogObj = await GameLogs.create(data);
      }
      return Promise.resolve(Common.makeResult(true, 'success', gameLogObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  GameLogs.remoteMethod('registerGameLog', {
    accepts: [
      {arg: 'userId', type: 'string', required: true, description: '유저디비아이디'},
      {arg: 'username', type: 'string', required: true, description: '유저이름'},
      {arg: 'gameId', type: 'string', required: true, description: '게임아이디'},
    ],
    description: [
      '(프로그램) 게임로그를 생성, 게임시작할때 호출',
    ],
    returns: {arg: 'res', type: 'string', description: '게임로그'},
    http: {path:'/register-gamelog', verb: 'post'}
  });


  // update
  GameLogs.updateGameLog = async(logId, nHoleIndex, score) => {
    try {
      let logObj = await GameLogs.findById(logId);
      if (!logObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong logId'))
      }
      if (logObj.scores[nHoleIndex] != -1) {
        return Promise.resolve(Common.makeResult(false, 'score is setted already'));
      }
      logObj.scores[nHoleIndex] = score;
      logObj.holeIndex = nHoleIndex;
      const data = {
        scores: logObj.scores,
        modifiedAt: Date()
      }
      // if (logObj.scores.length - 1 <= nHoleIndex) {
      //   let gameObj = await logObj.game.get();
      //   if (!gameObj) {
      //     return Promise.resolve(Common.makeResult(false, 'Game is Null'));
      //   }
      //   let score_sum = 0;
      //   scores.map(score => {
      //     score_sum += score;
      //   })
      //   const gameData = {
      //     game_staus: 1,
      //     score: score_sum,
      //     endedAt: Date()
      //   }
      //   gameObj = await gameObj.updateAttributes(gameData);
      // }
      logObj = await logObj.updateAttributes(data);
      return Promise.resolve(Common.makeResult(true, 'success', logObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  GameLogs.remoteMethod('updateGameLog', {
    accepts: [
      {arg: 'logId', type: 'string', required: true, description: '로그아이디'},
      {arg: 'nHoleIndex', type: 'number', required: true, description: ''},
      {arg: 'score', type: 'number', required: true, description: ''},
    ],
    description: [
      '(프로그램) 홀이동시 게임로그를 업데이트',
    ],
    returns: {arg: 'res', type: 'string'},
    http: {path:'/update-gamelog', verb: 'post'}
  });

  function makeScoreSymbole(aryPar, aryScore) {
    let result = [];
    aryPar.map((par_num, index) => {
      const score = aryScore[index];
      if (score == 99) {
        aryScore[index] = '/';
        result[index] = '';
      } else {
        const diff = score - par_num;
        switch(diff) {
        case -3:
          result[index] = 'albatross';
          break;
        case -2:
          if (par_num == 3) result[index] = 'holeinone';
          else result[index] = 'eagle';
          break;
        case -1:
          result[index] = 'birdie';
          break;
        case 0:
          result[index] = '';
          break;
        case 1:
          result[index] = 'bogey';
          break;
        default:
          result[index] = 'doublebogey';
          break;
        }
      }
    });
    return result;
  }
  
  function makeArraySum(ary) {
    if (!ary || ary.length == 0) {
      return [];
    }
    let numOr0 = n => isNaN(n) ? 0 : n
    return ary.reduce((a, b) => numOr0(a) + numOr0(b));
  }
  GameLogs.getScoresOnly = async(logObj, gameObj) => {
    var Course = GameLogs.app.models.Course;
    try {
    let par_num = 18;
    const courseObj = await Course.findOne({where: {name: {like: gameObj.course_name, options: 'i'}}});
    if (!courseObj) {
      return null;
    }
    if (!courseObj.sub_course) {
      return null;
    }
    let subCourse1, subCourse2;
    if (gameObj.game_holenum == 18) {
      par_num = 72;
      subCourse1 = await courseObj.sub_course.findOne({where: {name: gameObj.subCourse1}});
      subCourse2 = await courseObj.sub_course.findOne({where: {name: gameObj.subCourse2}});
      if (!subCourse1) {
        return null;
      }
    } else {
      par_num = 36;
      subCourse1 = await Course.sub_course.findOne({where: {name: gameObj.subCourse1}});
    }
    let sub1_par, sub2_par;
    sub1_par = [
      subCourse1.par_number1,
      subCourse1.par_number2,
      subCourse1.par_number3,
      subCourse1.par_number4,
      subCourse1.par_number5,
      subCourse1.par_number6,
      subCourse1.par_number7,
      subCourse1.par_number8,
      subCourse1.par_number9,
    ];
    if (subCourse2) {
      sub2_par = [
        subCourse2.par_number1,
        subCourse2.par_number2,
        subCourse2.par_number3,
        subCourse2.par_number4,
        subCourse2.par_number5,
        subCourse2.par_number6,
        subCourse2.par_number7,
        subCourse2.par_number8,
        subCourse2.par_number9,
      ];
    }
    const sub1_score = logObj.scores.slice(0, 9);
    const sub2_score = logObj.scores.slice(9);
    let scores1 = [], scores2 = [];
    sub1_score.map((score, index) => {
      let strScore;
      if (score == 99) {
        strScore = '/';
      } else {
        score = score - sub1_par[index];
        if (score > 0) strScore = '+' + score;
        else if (score > 0) strScore = '-' + score;
        else strScore = '0';
      }
      scores1[index] = strScore;
    })
    sub2_score.map((score, index) =>{
      let strScore;
      if (score == 99) {
        strScore = '/';
      } else {
        score = score - sub2_par[index];
        if (score > 0) strScore = '+' + score;
        else if (score > 0) strScore = '-' + score;
        else strScore = '0';
      }
      scores2[index] = strScore;
    })
    return {
      scores1: scores1,
      sub1_score_sum: makeArraySum(sub1_score),
      scores2: scores2,
      sub2_score_sum: makeArraySum(sub2_score),
    }
  } catch(e) {
      return Promise.reject(e);
  }
  }
  // get
  GameLogs.getGameLog = async(logId) => {
    var Course = GameLogs.app.models.Course;
    var Store = GameLogs.app.models.Store;
    try {
      let gameLog = await GameLogs.findById(logId);
      if (!gameLog) {
        return Promise.resolve(Common.makeResult(false, 'wrong logId'))
      }
      // if (logObj.scores[nHoleIndex] != -1) {
      //   return Promise.resolve(Common.makeResult(false, 'score is setted already'));
      // }
      
      const game = await gameLog.game.get();
      const room = await game.room.get();
      const store = await Store.findById(room.storeId);
      // let total_score = 0;
      // gameLog.scores.map(score => {
      //   total_score += (score - 0);
      // })
      let total_putting = 0;
      gameLog.putting_num.map(putting_num => {
        total_putting += (putting_num - 0);
      })
      let par_num = 18;
      const courseObj = await Course.findOne({where: {name: {like: game.course_name, options: 'i'}}});
      if (!courseObj) {
        return Promise.resolve(Common.makeResult(false, 'courseObj is null'));
      }
      let subCourse1, subCourse2;
      if (game.game_holenum == 18) {
        par_num = 72;
        subCourse1 = await courseObj.sub_course.findOne({where: {name: game.subCourse1}});
        subCourse2 = await courseObj.sub_course.findOne({where: {name: game.subCourse2}});
      } else {
        par_num = 36;
        subCourse1 = await Course.sub_course.findOne({where: {name: game.subCourse1}});
      }
      const userObj = await gameLog.accounts.get();
      if (!userObj) {
        return Promise.resolve(Common.makeResult(false, 'userObj is null'));
      }

      let sub1_par = [
        subCourse1.par_number1,
        subCourse1.par_number2,
        subCourse1.par_number3,
        subCourse1.par_number4,
        subCourse1.par_number5,
        subCourse1.par_number6,
        subCourse1.par_number7,
        subCourse1.par_number8,
        subCourse1.par_number9,
      ];
      const sub1_score = gameLog.scores.slice(0, 9);
      const sub1_putting = gameLog.putting_num.slice(0, 9);
      const sub1_symbols = makeScoreSymbole(sub1_par, sub1_score);

      let sub2_par = [
        subCourse2.par_number1,
        subCourse2.par_number2,
        subCourse2.par_number3,
        subCourse2.par_number4,
        subCourse2.par_number5,
        subCourse2.par_number6,
        subCourse2.par_number7,
        subCourse2.par_number8,
        subCourse2.par_number9,
      ];
      const sub2_score = gameLog.scores.slice(9);
      const sub2_putting = gameLog.putting_num.slice(9);
      const sub2_symbols = makeScoreSymbole(sub2_par, sub2_score);

      let handicap = 0;
      if (gameLog.game_num >= 9 && gameLog.game_num < 18) {
        handicap = gameLog.score - 36;
      } else if (gameLog.game_num == 18) {
        handicap = gameLog.score - 72;
      } else {
        handicap = 0;
      }
      if (handicap > 0) handicap = '+' + handicap;
      else if (handicap < 0) handicap = '-' + Math.abs(handicap);
      
      const sub1_score_sum = makeArraySum(sub1_score);
      const sub1_putting_sum = makeArraySum(sub1_putting);
      const sub2_score_sum = makeArraySum(sub2_score);
      const sub2_putting_sum = makeArraySum(sub2_putting);

      const result = {
        course_name: game.course_name,
        total_score: gameLog.score,
        handicap: handicap,
        game_mode: game.game_mode,
        storeName: store.storeName,
        time: game.endedAt.yyyymmdd(),
        
        recent_averscore: userObj.user_averscore ? userObj.user_averscore: 0,
        recent_averCarry: userObj.user_averCarry ? userObj.user_averCarry : 0,
        recent_averPuttingNum: userObj.user_averPuttingNum ? userObj.user_averPuttingNum: 0,

        user_bestscore: userObj.user_bestscore,
        user_bestPuttingDist: userObj.user_bestPuttingDist,
        user_bestCarry: userObj.user_bestCarry,
        user_averscore: userObj.user_averscore,
        user_averCarry: userObj.user_averCarry,
        user_averPuttingNum: userObj.user_averPuttingNum,
        user_fairwayHitRate: userObj.user_fairwayHitRate,
        user_greenHitRate: userObj.user_greenHitRate,
        par_num: par_num,
        total_putting: total_putting,
        rank: gameLog.rank,
        player_num: game.player_num,

        subCourse1_name_kr: subCourse1.name_kr,
        subCourse1_name: subCourse1.name,
        sub1_par: sub1_par,
        
        sub1_score: sub1_score,
        sub1_score_sum: sub1_score_sum,
        sub1_putting: sub1_putting,
        sub1_putting_sum: sub1_putting_sum,
        sub1_symbols: sub1_symbols,
        
        subCourse2_name_kr: subCourse2.name_kr,
        subCourse2_name: subCourse2.name,
        sub2_par: sub2_par,
        sub2_score: sub2_score,
        sub2_score_sum: sub2_score_sum,
        sub2_putting: sub2_putting,
        sub2_putting_sum: sub2_putting_sum,
        sub2_symbols: sub2_symbols,
      }
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  GameLogs.remoteMethod('getGameLog', {
    accepts: [
      {arg: 'logId', type: 'string', required: true, description: '로그아이디'},
    ],
    description: [
      '(유저앱) 일자별스코어목록에서 개별적인 항목을 클릭하였을때 호출되는 스코어카드',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'course_name: 코스이름 (인터불고...)\n',
        'total_score: 점수 (93타)\n',
        'handicap: 핸디캡 (+20) 0보다 큰값이면 +, 작으면 -를 붙여준다.\n',
        'game_mode: 게임모드 (스트로크)\n',
        'storeName: 매장이름\n',
        'time: 게임시간\n',

        'user_bestscore: 최고스코어\n',
        'user_bestPuttingDist: 최고퍼팅거리\n',
        'user_bestCarry: 최대비거리\n',
        'user_averscore: 평균타수\n',
        'user_averCarry: 평균비거리\n',
        'user_averPuttingNum: 평균퍼팅수\n',
        'user_fairwayHitRate: 패어웨이 안착률\n',
        'user_greenHitRate: 그린적중률\n',

        'par_num: Par\n',
        'total_putting: 퍼팅수\n',
        'rank: 라운딩순위\n',
        'player_num: 게임에 참가한 플레이어수\n',

        'subCourse1_name_kr: 서브코스1 이름\n',
        'subCourse1_name: 서브코스1 영어이름\n',
        'sub1_par: 서브코스1 파수목록\n',
        'sub1_score: 서브코스1 스코어\n',
        'sub1_putting: 서브코스1 퍼팅수\n',
        'sub1_symbols: 서브코스1 심볼이미지\n',

        'subCourse2_name_kr: 서브코스2 이름\n',
        'subCourse2_name: 서브코스2 영어이름\n',
        'sub2_par: 서브코스2 파수목록\n',
        'sub2_score: 서브코스2 스코어\n',
        'sub2_putting: 서브코스2 퍼팅수\n',
        'sub2_symbols: 서브코스2 심볼이미지\n',
      ]
    },
    http: {path:'/getLogById', verb: 'post'}
  });

  
  // get SwingMotion Video
  GameLogs.getMotionVideos = async(logId) => {
    try {
      let logObj = await GameLogs.findById(logId);
      if (!logObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong logId'))
      }
      // if (logObj.scores[nHoleIndex] != -1) {
      //   return Promise.resolve(Common.makeResult(false, 'score is setted already'));
      // }
      logObj.scores[nHoleIndex] = score;
      const data = {
        scores: logObj.scores,
        modifiedAt: Date()
      }
      if (logObj.scores.length - 1 <= nHoleIndex) {
        let gameObj = await logObj.game.get();
        if (!gameObj) {
          return Promise.resolve(Common.makeResult(false, 'Game is Null'));
        }
        const gameData = {
          game_staus: 1,
          endedAt: Date()
        }
        gameObj = await gameObj.updateAttributes(gameData);
      }
      logObj = await logObj.updateAttributes(data);
      return Promise.resolve(Common.makeResult(true, 'success', logObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  // GameLogs.remoteMethod('updateGameLog', {
  //   accepts: [
  //     {arg: 'logId', type: 'string', required: true, description: '로그아이디'},
  //     {arg: 'nHoleIndex', type: 'number', required: true, description: ''},
  //     {arg: 'score', type: 'number', required: true, description: ''},
  //   ],
  //   description: [
  //     '(프로그램) 홀이동시 게임로그를 업데이트',
  //   ],
  //   returns: {arg: 'res', type: 'string'},
  //   http: {path:'/update-gamelog', verb: 'post'}
  // });


  GameLogs.getUserGameLogAtStore = async(userId, storeId) => {
    const Accounts = GameLogs.app.models.Accounts;
    try {
      const query = {
        fields: ['game_holenum', 'course', 'score', 'createdAt', 'modifiedAt'],
        where: {
          storeId: storeId.toString()
        },
        order: 'modifiedAt DESC'
      };
      const userObj = await Accounts.findById(userId);
      if (!userObj) {
        return Promise.resolve(null);
      }
      const gamelogs = await userObj.game_log.find();
      return Promise.resolve(gamelogs);
    } catch(e) {
      return Promise.reject(e);
    }
  }
};
