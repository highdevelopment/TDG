// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-user-management
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var dsConfig = require('../datasources.json');
var path = require('path');
var loopback = require('loopback');

const ServerConfig = require('./routes/config.json');

var userpage = require('./routes/user');

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

module.exports = function(app) {
  console.log('starting ...');

  async function authorize(req, res, isAuth) {
    try {
      const token = req.signedCookies.access_token_tdg;
      if (!token) {
        if (isAuth) {
          res.redirect('/login');
          return Promise.resolve({isManager: true});
        }
        return Promise.resolve({isManager: true});
      }
      const tokenObj = await app.models.Accounts.accessToken.findById(token);
      if (!tokenObj) {
        if (isAuth) {
          res.redirect('/login');
          return Promise.resolve({isManager: true});
        } else {
          res.clearCookie("access_token_tdg");
          return Promise.resolve({isManager: true});
        }
      }
      let user = await app.models.Accounts.findById(tokenObj.userId);
      if (!user) {
        if (isAuth) {
          res.redirect('/login');
          return Promise.resolve({isManager: true});
        } else {
          return Promise.resolve({isManager: true});
        }
      }
      user.access_token = tokenObj.id;
      user.isAuth = true;
      // user.isManager = true;

      if (user.photo && user.photo.length > 0) {
        user.photo = ServerConfig.FILE_SERVER_PATH + user.photo;
      } else {
        user.photo = ServerConfig.FILE_SERVER_PATH + 'user-picture/user_default.png';
      }
      user.user_averscore = user.user_averscore.toFixed(2);
      user.user_bestscore = user.user_bestscore > 1000 ? 0 : user.user_bestscore.toFixed(2);
      user.user_averCarry = user.user_averCarry.toFixed(2);
      user.user_bestCarry = user.user_bestCarry.toFixed(2);
      user.user_averPuttingNum = user.user_averPuttingNum.toFixed(2);
      user.user_bestPuttingDist = user.user_bestPuttingDist.toFixed(2);
      user.user_fairwayHitRate = user.user_fairwayHitRate.toFixed(2);
      user.user_greenHitRate = user.user_greenHitRate.toFixed(2);
      user.api_url = ServerConfig.api_url;
      user.FILE_SERVER_PATH = ServerConfig.FILE_SERVER_PATH;
      user.user_leverl = user.user_level ? user.user_level : 5;
      user.isManager = user.role == 'manager' ? true : false;
      return Promise.resolve(user);
    } catch(e) {
      // return Promise.reject(e);
    }
  }

  userpage(app);

  async function firstPage(req, res) {
    try {
      const user = await authorize(req, res, false);
      const notices = (await app.models.Notices.listUserNotices('', 2, 0)).result;
      notices.map(notice => {
        if (notice.title.length > 30) {
          notice.title = notice.title.slice(0, 30) + '...';
        }
        notice.time = notice.modifiedAt.yyyymmdd();
      })
      const stores = (await app.models.Store.getSearchStore()).result;
      const events = (await app.models.Event.getEvents('', undefined, 2, 0)).result;
      events.map(event => {
        event.title = event.title.slice(0, 10);
      })
      const bestCourses = (await app.models.Course.getBestCourse(1)).result;
      const bestCourse = makeCourseData(bestCourses[0]);
      const newCourses = (await app.models.Course.getNewCourse(2)).result;
      const videos = (await app.models.MotionVideo.getPublicVideoList(3)).result;
      videos.map(video => {
        video.filepath_thumb = ServerConfig.FILE_SERVER_PATH + video.filepath_thumb;
      })
      // const images = (await app.models.PhotoZone.getPublicPhotoList(8)).result;
      user.photo = user.photo;
      res.render('index', {
        user: user,
        notices: notices,
        stores: stores,
        events: events,
        newCourses: newCourses,
        bestCourse: bestCourse,
        videos: videos,
        // images: images
      })
    } catch(e) {
      if (e == 'auth') {
      } else {
        // return Promise.reject(e);
      }
    }
  }

  app.get('/', async(req, res) => {
    firstPage(req, res);
  });
  app.get('/index', async(req, res) => {
    firstPage(req, res);
  });
  app.post('/loginUser', async(req, res) => {
    try {
      const result = await app.models.Accounts.loginUser(req.body.username, req.body.password);
      if (result.success) {
        token = result.result.token.toJSON();
        res.cookie('access_token_tdg', token.id, { signed: true , maxAge: 3000 * token.ttl });
        // res.redirect('/analy?access_token=' + token.id);
        // res.redirect('/');
        res.send({
          res: {
            success: true,
          }
        });
      } else {
        // res.redirect('/', {msg: '로그인이 실패하였습니다.'});
        res.send({
          res: {
            success: false,
            content: '아이디 또는 비밀번호가 틀립니다.'
          }
        });
      }
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.post('/logOutUser', async(req, res) => {
    try {
      let access_token = req.query.access_token_tdg;
      if (!access_token) access_token = req.signedCookies.access_token_tdg;
      if (access_token) {
        await app.models.Accounts.logout(access_token);
      }
      res.clearCookie("access_token_tdg");
      res.redirect('/');
    } catch(e) {
      // return Promise.reject(e);
    }
  });

  // 로그인
  app.get('/login', async(req, res) => {
    res.render('login', {
    })
  });
  // 내 기록 분석
  app.get('/my-analy', async(req, res) => {
    try {
      const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 5;
      const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      //await app.models.Accounts.resetAverageScore(user);
      const gameLogs = await app.models.Accounts.getUserLogs_v2(user.access_token, pageNum, pageIndex);
      const chart = {
        user_averscore: user.user_averscore / 80 * 100,
        user_greenHitRate: user.user_greenHitRate,
        user_fairwayHitRate: user.user_fairwayHitRate,
        user_averPuttingNum: user.user_averPuttingNum / 2 * 100,
        user_averCarry: user.user_averCarry / 250 * 100,
      }
      const aryClubs = app.models.GameConstants.club.slice(0);
      aryClubs.pop();
      aryClubs[0].user_dist = user.user_clubdist_driver;
      aryClubs[1].user_dist = user.user_clubdist_w3;
      aryClubs[2].user_dist = user.user_clubdist_u3;
      aryClubs[3].user_dist = user.user_clubdist_u5;
      aryClubs[4].user_dist = user.user_clubdist_i3;
      aryClubs[5].user_dist = user.user_clubdist_i4;
      aryClubs[6].user_dist = user.user_clubdist_i5;
      aryClubs[7].user_dist = user.user_clubdist_i6;
      aryClubs[8].user_dist = user.user_clubdist_i7;
      aryClubs[9].user_dist = user.user_clubdist_i8;
      aryClubs[10].user_dist = user.user_clubdist_i9;
      aryClubs[11].user_dist = user.user_clubdist_pw;
      aryClubs[12].user_dist = user.user_clubdist_aw;
      aryClubs[13].user_dist = user.user_clubdist_sw;
      aryClubs.map((clubData, index) => {
        clubData.delta = clubData.user_dist - clubData.dist;
        if (user.club_data && user.club_data.flyDist && user.club_data.flyDist[index] > 0) {
          clubData.flyDist = user.club_data.flyDist[index].toFixed(1);
        } else {
          clubData.flyDist = '-';
        }
        if (user.club_data && user.club_data.runDist && user.club_data.runDist[index]) {
          clubData.runDist = user.club_data.runDist[index].toFixed(2);
        } else {
          clubData.runDist = '-';
        }
        if (user.club_data && user.club_data.launchAngle && user.club_data.launchAngle[index]) {
          clubData.launchAngle = (180 / Math.PI * user.club_data.launchAngle[index]).toFixed(2);
        } else {
          clubData.launchAngle = '-';
        }
        if (user.club_data && user.club_data.velocity && user.club_data.velocity[index]) {
          clubData.velocity = user.club_data.velocity[index].toFixed(1);
        } else {
          clubData.velocity = '-';
        }
      })
      const chart1 = [];
      gameLogs.result.logs.map(async logObj => {
        chart1.push(logObj.score);
      })
      //gameLogs.result.pop();
      const length = gameLogs.result.length;
      chart1.reverse();
      res.render('my-analy', {
        user: user,
        club: aryClubs,
        chart1: chart1,
        chart: chart,
        gameLogs: gameLogs.result.logs,
        page: makePage(length, pageIndex, pageNum)
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // app.post('/login_changepass', async(req, res) => {
  //   try {
  //     const result = await app.models.Accounts.loginUser(req.body.username, req.body.password);
  //     if (result.success) {
  //       token = result.result.token.toJSON();
  //       res.cookie('access_token', token.id, { signed: true , maxAge: 1000 * token.ttl });
  //       res.redirect('/change_password');
  //     } else {
  //       res.send(500,'');
  //     }
  //   } catch(e) {
      // return Promise.reject(e);
  //   }
  // });
  ////////////////////////////////////////
  // app.get('/change_password', async(req, res) => {
  //   try {
  //     const user = await authorize(req, res, true);
  //     if (!user.isAuth) {
  //       // res.redirect('/error');
  //       return Promise.resolve(false);
  //     }
  //     res.render('change_password', {
  //       user: user
  //     })
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // });
  app.get('/course-detail', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const courseId = req.query.id;
      if (!courseId) {
        res.status(500).json('');
      }
      const course = (await app.models.Course.getCourseInfo(courseId)).result;
      course.course.markHoleLevel = new Array(parseInt(course.course.hole_level) + 1).join('* ');
      course.course.markGreenLevel = new Array(parseInt(course.course.green_level) + 1).join('* ');
      res.render('course-detail', {
        user: user,
        course: course.course,
        subCourse: course.subCourse
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });

  function makeCourseData(course) {
    let hole_level = course.hole_level ? course.hole_level * 1 : 0;
    let green_level = course.green_level ? course.green_level * 1 : 0;
    hole_level = hole_level < 5 ? parseInt(hole_level) : 5;
    green_level = green_level < 5 ? parseInt(green_level) : 5;
    course.imgHoleLevel = '../images/course/level' + hole_level + '.png';
    course.imgGreenLevel = '../images/course/level' + green_level + '.png';
    course.photo = ServerConfig.FILE_SERVER_PATH + course.photo;
    course.logo = ServerConfig.FILE_SERVER_PATH + 'course_logo/' + course.name + '.png';
    return course;
  }
  function makeCourseDataArray(courses) {
    const result = [];
    courses.map(course => {
      result.push(makeCourseData(course));
    })
    return result;
  }
  
  // 신규코스
  app.get('/course-new', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const newCourses = makeCourseDataArray((await app.models.Course.getNewCourse(3)).result);
      const bestCourses = makeCourseDataArray((await app.models.Course.getBestCourse(3)).result);
      const bestCourses_Male = makeCourseDataArray((await app.models.Course.getBestCourseForMale(3)).result);
      const bestCourses_Female = makeCourseDataArray((await app.models.Course.getBestCourseForFemale(3)).result);
      res.render('course-new', {
        user: user,
        newCourses: newCourses,
        bestCourses: bestCourses,
        bestCourses_Male: bestCourses_Male,
        bestCourses_Female: bestCourses_Female,
      })
    } catch(e) {
      console.log(e);
      // return Promise.reject(e);
    }
  });
  
  // 추천코스
  app.get('/course-recommend', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const courses = makeCourseDataArray((await app.models.Course.getRecommendCourse(user, 3)).result);
      res.render('course-recommend', {
        user: user,
        courses: courses
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 추천코스
  app.get('/course-search', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const courseId = req.query.id;
      let viewCourse, search_key, province, serach_province;
      search_key = req.query.search_key;
      province = req.query.province ? req.query.province * 1 : 0;
      serach_province = province == 0 ? undefined : province - 1;
      let sort_option = req.query.sort_option ? req.query.sort_option - 0 : 0;
      if (courseId) {
        viewCourse = makeCourseData(await app.models.Course.findById(courseId));
        search_key = '';
        serach_province = undefined;
        sort_option = 0;
      }
      let courses = await app.models.Course.searchCourseWithProvince(search_key, serach_province, sort_option);
      courses = makeCourseDataArray(courses.result);
      // courses.map(course => {
      //   let hole_level = course.hole_level ? course.hole_level * 1 : 0;
      //   let green_level = course.green_level ? course.green_level * 1 : 0;
      //   hole_level = hole_level > 5 ? hole_level : 5;
      //   green_level = green_level > 5 ? green_level : 5;
      //   course.markHoleLevel = new Array(hole_level + 1).join('*');
      //   course.markGreenLevel = new Array(green_level + 1).join('*');
      //   // courseData.push({
      //   //   hole_level: hole_level,
      //   //   green_level: green_level,
      //   //   courseId: course.id,
      //   //   logo: course.logo ? course.logo : '',
      //   //   name: course.name ? course.name : '',
      //   //   course_website: course.website ? course.website : '',
      //   //   course_photo: course.photo ? course.photo: '',
      //   //   course_address_kr: course.address_kr ? course.address_kr : '',
      //   //   course_distance: course.distance ? course.distance : 0,
      //   //   course_comment_kr: course.comment_kr ? course.comment_kr : '',
      //   // });
      // })
      
      res.render('course-search', {
        user: user,
        courseId: courseId ? courseId : '',
        province: province,
        search_key: search_key ? search_key : '',
        sort_option: sort_option,
        courses: courses,
        course: viewCourse,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  //전체 코스
  app.get('/course-all', async(req, res) => {
    const user = await authorize(req, res, false);
    try {
      res.render('course-all', {
        user: user
      })
    } catch(e) {

    }
  })

  // 이벤트목록
  app.get('/event-list', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 5;
      const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
      const result = (await app.models.Event.getEvents_v2(req.query.search, req.query.kind, pageNum, pageIndex)).result;
      const events = result.events;
      const length = result.length;
      events.map(event => {
        event.startTime = event.startAt ? event.startAt.yyyymmdd() : '';
        event.endTime = event.endAt ? event.endAt.yyyymmdd(): '';
        if (event.status == 1) event.strStatus = '진행중';
        else if (event.status == 2) event.strStatus = '완료';
        else event.strStatus = '진행중';
      })
      res.render('event-list', {
        user: user,
        events: events,
        page: makePage(length, pageIndex, pageNum)
      })
    } catch(e) {
      console.log(e);
      // return Promise.reject(e);
    }
  });
  // 이벤트상세페지
  app.get('/event-detail', async(req, res) => {
    try {
      res.render('uncomplete', {
      })
      // const user = await authorize(req, res, false);
      // const eventId = req.query.id;
      // const event = (await app.models.Event.getEvent(eventId, user.access_token)).result;
      // event.time = event.createdAt.yyyymmdd();
      // res.render('event-detail', {
      //   user: user,
      //   event: event
      // })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // app.get('/footer', function(req, res) {
  //   res.render('footer', {
      
  //   })
  // });
  app.post('/updateGameSetting', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const result = await app.models.Accounts.updateGameSetting(user.access_token, req.body.difficulty, req.body.tasekPos, req.body.teePos, req.body.teeHeight,
        req.body.dist_driver, req.body.dist_w3, req.body.dist_u3, req.body.dist_u5, 
        req.body.dist_i3, req.body.dist_i4, req.body.dist_i5, req.body.dist_i6, req.body.dist_i7, req.body.dist_i8,  req.body.dist_i9,
        req.body.dist_pw, req.body.dist_aw, req.body.dist_sw);
      if (result.success) {
        res.redirect(req.get('referer'));
      }
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 게임 설정
  app.get('/my-gamesetting', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const gameLogs = await app.models.Accounts.getUserLogs(user.access_token, 6, 0);
      const chart1 = [];
      gameLogs.result.map(async logObj => {
        chart1.push(logObj.score);
      })
      chart1.reverse();
      res.render('my-gamesetting', {
        user: user,
        chart1: chart1,
        checked_normal: user.user_setDifficulty == 0 ? 'checked' : '',
        checked_semituor: user.user_setDifficulty == 1 ? 'checked' : '',
        checked_tuor: user.user_setDifficulty == 2 ? 'checked' : '',

        checked_righthand: user.user_setTasekPos == 0 ? 'checked' : '',
        checked_lefthand: user.user_setTasekPos == 1 ? 'checked' : '',
        
        checked_red: user.user_setTeePos == 4 ? 'checked' : '',
        checked_yellow: user.user_setTeePos == 3 ? 'checked' : '',
        checked_white: user.user_setTeePos == 2 ? 'checked' : '',
        checked_blue: user.user_setTeePos == 1 ? 'checked' : '',
        checked_black: user.user_setTeePos == 0 ? 'checked' : '',

        checked_height0: user.user_setTeeHeight == 0 ? 'checked' : '',
        checked_height1: user.user_setTeeHeight == 1 ? 'checked' : '',
        checked_height2: user.user_setTeeHeight == 2 ? 'checked' : '',
        checked_height3: user.user_setTeeHeight == 3 ? 'checked' : '',
        checked_height4: user.user_setTeeHeight == 4 ? 'checked' : '',
        checked_height5: user.user_setTeeHeight == 5 ? 'checked' : '',
        checked_height6: user.user_setTeeHeight == 6 ? 'checked' : '',
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // app.get('/header', function(req, res) {
  //   res.render('header', {
      
  //   })
  // });

  // 공지사항_목록
  app.get('/notice-list', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const search = req.query.search;
      const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 5;
      const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
      const result = await app.models.Notices.listUserNotices_v2(search, pageNum, pageIndex);
      let notices = [];
      let length = 0;
      if (result.success) {
        length = result.result.length;
        notices = result.result.notices;
        notices.map(notice => {
          notice.time = notice.createdAt.yyyymmdd();
        })
      }
      res.render('notice-list', {
        search: search,
        user: user,
        notices: notices,
        page: makePage(length, pageIndex, pageNum)
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  //포토존
  app.get('/photozone', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('photozone', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.post('/updateProfile', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const birthday = new Date(req.body.birthday_year * 1, req.body.birthday_month * 1, req.body.birthday_date * 1);
      const result = await app.models.Accounts.updateProfile(user.access_token, null, birthday, req.body.sex,
        req.body.nickname, req.body.phone_number, req.body.mail, req.body.agree_marketting_email, req.body.agree_marketting_sns, req.body.realname);
      if (result.success) {
        //res.redirect(req.get('referer'));
        res.redirect('/');
      }
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 프로필관리
  app.get('/my-profile', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      let years = [];
      for (let i = 2010; i >= 1950; i--) {
        years.push(i);
      }
      let mailed = ['', ''];
      if (user.mail) mailed = user.mail.split('@');
      
      res.render('my-profile', {
        user: user,
        sex_male: user.sex == 'male' ? 'checked' : '',
        sex_female: user.sex == 'female' ? 'checked' : '',
        birthday_year: user.birthday ? user.birthday.getFullYear() : 1970,
        birthday_month: user.birthday ? user.birthday.getMonth(): 1,
        birthday_date: user.birthday ? user.birthday.getDate() : 1,
        years: years,
        phone_number1: user.phone_number.slice(3, 7),
        phone_number2: user.phone_number.slice(7),
        mail_id: mailed[0],
        mail_type: mailed[1],
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });

  function makePage(length, pageIndex, pageNum) {
    length = Math.ceil(length / pageNum);
    const start = Math.floor(pageIndex / 10) * 10;
    const page = {
      length: length,
      start: start,
      end: Math.min(start + 10, length),
      pageIndex: pageIndex,
      pageNum: pageNum,
      prev10_disable: pageIndex <= 0 ? 'disabled' : '',
      prev_disable: pageIndex <= 0 ? 'disabled' : '',
      next10_disable: pageIndex >= length - 1 ? 'disabled' : '',
      next_disable: pageIndex >= length - 1 ? 'disabled' : '',
      nextPage10: Math.min(pageIndex + 10, length - 1),
      nextPage: Math.min(pageIndex + 1, length - 1),
      prevPage: Math.max(pageIndex - 1, 0), 
      prevPage10: Math.max(pageIndex - 10, 0),
    }
    return page;
  }
  // 1대1문의
  app.get('/my-qalist', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 10;
      const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
      const params = {
        search_type: req.query.search_type ? req.query.search_type : 0,
        search: req.query.search ? req.query.search : ''
      }
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const result = await app.models.Question.getQuestionList_v2(user.access_token, params.search_type, params.search, pageNum, pageIndex);
      if (!result.success) {
        return Promise.resolve(false);
      }
      const length = result.result.length;
      const questions = result.result.questions;
      let count = 0;
      questions.map(question => {
        question.index = count + 1;
        count++;
        question.time = question.modifiedAt.yyyymmdd();
        if (question.status == 'waitting') {
          question.status = '대기중';
          question.statusClass = 'noAnswer';
        } else if (question.status == 'checked') {
          question.status = '답변완료';
          question.statusClass = 'answer';
        }
      })
      res.render('my-qalist', {
        user: user,
        questions: questions,
        pageIndex: pageIndex,
        page: makePage(length, pageIndex, pageNum),
        params: params
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 아이디비밀번호찾기
  app.get('/resetpassword', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('resetpassword', {
        user: user
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.get('/confirm_password', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      res.render('confirm_password', {
        user: user
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });

  function makeScoreSymbol(aryScore, arySymbol) {
    const result = [];
    aryScore.map((score, index) => {
      const symbol = arySymbol[index];
      let style = 'position: absolute; left: 36px; top: 12px;'
      if (!symbol) {
        style = '';
      } else if (symbol == 'doublebogey' || symbol == 'eagle') {
        style += ' color: white';
      } else {
      }
      result[index] = {
        symbol: symbol ? 'img/scoresymbol/' + symbol + '.png' : '',
        score: score,
        style: style,
      }
    })
    return result;
  }
  app.get('/score', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const logId = req.query.id;
      const result = await app.models.GameLogs.getGameLog(logId);
      if (result.success) {
        const gameLog = result.result;
        gameLog.rank = gameLog.rank + 1;
        gameLog.new_sub1_score = makeScoreSymbol(gameLog.sub1_score, gameLog.sub1_symbols);
        gameLog.new_sub2_score = makeScoreSymbol(gameLog.sub2_score, gameLog.sub2_symbols);
        res.render('score', {
          user: user,
          gameLog: gameLog,
        })
      } else {
        res.render('score', {
          user: user,
        })
      }
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.get('/searchdetail', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const storeId = req.query.id;
      if (!storeId) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const result = (await app.models.Store.getStoreById(storeId)).result;
      const store = result.store;
      store.photo = ServerConfig.FILE_SERVER_PATH + store.photo;
      store.system_lefthand = store.system_lefthand ? store.system_lefthand : '없음';
      store.swingplate = store.swingplate ? store.swingplate : '없음';
      store.parking_status = store.parking_status ? store.swingplate : '없음';
      res.render('searchdetail', {
        user: user,
        result: result,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 매장찾기
  app.get('/store-search', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const search_key = req.query.search_key;
      const province = req.query.province;
      const stores = (await app.models.Store.getSearchStore(search_key, province)).result;
      let stores_regular;
      if (user.isAuth) {
        stores_regular = (await app.models.Accounts.getRegularStore(user, 5)).result;
      }
      let provinces = [].fill.call({ length: 10 }, 0);
      stores.map(store => {
        for (let i = 0; i < 7; i++) {
          if (store.province == i) {
            provinces[i]++;
            break;
          }
        }
        store.photo = ServerConfig.FILE_SERVER_PATH + store.photo;
      })
      res.render('store-search', {
        user: user,
        api_url: ServerConfig.api_url,
        search_key: search_key,
        province: province,
        stores: stores,
        stores_num: stores.length,
        provinces: provinces,
        stores_regular: stores_regular
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 회원가입-약관동의
  app.get('/signupAgree', function(req, res) {
    res.render('signupAgree', {
      
    })
  });
  // 회원가입-입력
  app.get('/signupInput', function(req, res) {
    res.render('signupInput', {
      api_url: ServerConfig.api_url
    })
  });
  // 회원가입-성공
  app.get('/signupComplete', async function(req, res) {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        return Promise.resolve(false);
      }
      res.render('signupComplete', {
        user: user
      })
    } catch(e) {
      console.log(e)
    }
  });
  app.post('/updatePublicVideo', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const videoId = req.body.videoId;
      const title = req.body.title;
      const content = req.body.content;
      const result = await app.models.MotionVideo.updatePublicVideo(user.access_token, videoId, true, title, content);
      if (result.success) {
        // res.redirect('/swing');
      }
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 스윙영상상세보기
  app.get('/myswing', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const videoId = req.query.id;
      const video = await app.models.MotionVideo.getVideo(videoId);
      video.filepath = ServerConfig.FILE_SERVER_PATH + video.filepath;
      res.render('myswing', {
        user: user,
        video: video.result
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 내스윙영상
  app.get('/my-swing', async(req, res) => {
    try {
      const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 6;
      const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
      const user = await authorize(req, res, true);
      const motionId = req.query.id;
      if (!user.isAuth) {
        // res.redirect('/error');
        return Promise.resolve(false);
      }
      const res_video = await app.models.MotionVideo.getVideoList_v2(user.access_token, pageNum, pageIndex);
      let length = 0;
      let motions = [];
      let selectedMotion;
      if (res_video.success) {
        length = res_video.result.length;
        motions = res_video.result.motions;
        motions.map(video => {
          video.time = video.createdAt.yyyymmdd();
          if (motionId && motionId == video.id) {
            selectedMotion = video;
          }
        })
        if (!selectedMotion && motions.length > 0) {
          selectedMotion = motions[0];
        }
      }
      
      let difficulty = '일반';
      if (user.user_setDifficulty == 1) difficulty = '세미투어';
      else if (user.user_setDifficulty == 2) difficulty = '투어';

      res.render('my-swing', {
        user: user,
        selectedMotion: selectedMotion,
        difficulty: difficulty,
        videos: motions,
        page: makePage(length, pageIndex, pageNum)
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.get('/swingdetail', function(req, res) {
    res.render('swingdetail', {
      
    })
  });

  // function makeDateString(date) {
  //   let month = '' + (date.getMonth() + 1);
  //   let day = '' + date.getDate();
  //   let year = date.getFullYear();

  //   // if (month.length < 2) month = '0' + month;
  //   // if (day.length < 2) day = '0' + day;
  //   return [year, month, day].join('.');
  // }
  // function parseDateString(strDate) {
  //   if (strDate && strDate.length > 0) {
  //     const d = strDate.split('.');
  //     return new Date(d[0], d[1] - 1, d[2]);
  //   }
  //   return new Date();
  // }
  // 스윙영상
  app.get('/swingvideo', async(req, res) => {
    const user = await authorize(req, res, false);
    const pageNum = req.query.page_num > 0 ? req.query.page_num - 0 : 8;
    const pageIndex = req.query.page >= 0 ? req.query.page - 0 : 0;
    const params = {
      // type: req.query.type ? req.query.type : 0,
      // date: req.query.date ? req.query.date : makeDateString(new Date()),
      gender: req.query.gender ? req.query.gender : 0,
      sort: req.query.sort ? req.query.sort : 0,
    }
    // const curDate = parseDateString(params.date);
    // let date = curDate; date.setDate(date.getDate() - 1);
    // params.beforeday = makeDateString(date);
    // date = curDate; date.setDate(date.getDate() + 1);
    // params.nextday = makeDateString(date);
    // date = curDate; date.setDate(date.getDate() - 7);
    // params.beforeweek = makeDateString(date);
    // date = curDate; date.setDate(date.getDate() + 7);
    // params.nextweek = makeDateString(date);

    const videos_best = (await app.models.MotionVideo.getPublicBestList(params.date)).result;
    videos_best.map(video => {
      video.filepath_thumb = ServerConfig.FILE_SERVER_PATH + video.filepath_thumb;
      video.carry = video.carry.toFixed(2);
    })
    const result = (await app.models.MotionVideo.getPublicVideoList_v2(pageNum, pageIndex, params.gender, params.sort)).result;
    let length = result.length;
    let videos = result.motions;

    videos.map(video => {
      video.filepath_thumb = ServerConfig.FILE_SERVER_PATH + video.filepath_thumb;
    })
    res.render('swingvideo', {
      user: user,
      api_url: ServerConfig.api_url,
      fileserver_url: ServerConfig.FILE_SERVER_PATH,
      videos_best: videos_best,
      videos: videos,
      params: params,
      page: makePage(length, pageIndex, pageNum)
    })
  });
  // 홀인원기록
  app.get('/holeinone-list', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('holeinone-list', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 대회
  app.get('/champion', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('champion', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 브랜드 소개
  app.get('/intro-brand', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('intro-brand', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 제품 소개
  app.get('/intro-product', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('intro-product', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 회사소개
  app.get('/intro-company', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('intro-company', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 창업절차
  app.get('/intro-founding', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      res.render('intro-founding', {
        user: user,
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 고객센터
  app.get('/contact-us', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const questions = (await app.models.Question.getAllQuetionList(1)).result;
      res.render('contact-us', {
        user: user,
        questions: questions
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 공지사항_상세
  app.get('/notice-detail', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const noticeId = req.query.id;
      const notice = (await app.models.Notices.getNotice(noticeId, user.access_token)).result;
      notice.time = notice.createdAt.yyyymmdd();
      res.render('notice-detail', {
        user: user,
        notice: notice
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });

  function isImageFile(path) {
    if (path.match(/.(jpg|jpeg|png|gif)$/i)) {
      return true;
    }
    return false;
  }
  function getFileExtension( url ) {
    return url.split('.').pop().split(/\#|\?/)[0];
  }
  function getFileName( fullPath ) {
    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    return filename;
  }
  function makeAttachedFile(fileUrl) {
    let file_url, filename, photo_url;
    if (fileUrl && fileUrl.length > 0) {
      filename = getFileName(fileUrl);
      if (isImageFile(filename)) {
        photo_url = ServerConfig.FILE_SERVER_PATH + fileUrl;
      } else {
        file_url = ServerConfig.FILE_SERVER_PATH + fileUrl;
        photo_url = null;
      }
    } else {
      photo_url = null;
    }
    return {
      file_url: file_url,
      filename: filename,
      photo_url: photo_url
    }
  }
  
  // 1대1문의보기
  app.get('/my-qadetail', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      const questionId = req.query.id;
      const question = (await app.models.Question.getQuestion(questionId, user.access_token)).result;
      question.time = question.createdAt.yyyymmdd();
      question.answer_time = question.modifiedAt.yyyymmdd();

      const attachedQuestion = makeAttachedFile(question.photo_question);
      question.file_question = attachedQuestion.file_url;
      question.file_question_name = attachedQuestion.filename;
      question.photo_question = attachedQuestion.photo_url;

      const attachedAnswer = makeAttachedFile(question.photo_answer);
      question.file_answer = attachedAnswer.file_url;
      question.file_answer_name = attachedAnswer.filename;
      question.photo_answer = attachedAnswer.photo_url;
      
      res.render('my-qadetail', {
        user: user,
        question: question
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  // 1대1문의하기
  app.get('/my-qamake', async(req, res) => {
    try {
      const user = await authorize(req, res, true);
      if (!user.isAuth) {
        return Promise.resolve(false);
      }
      let emailed = ['', ''];
      if (user.mail) emailed = user.mail.split('@');
      res.render('my-qamake', {
        user: user,
        mail_id: emailed[0],
        mail_type: emailed[1]
      })
    } catch(e) {
      // return Promise.reject(e);
    }
  });
  app.get('/manager', async(req, res) => {
    try {
      const user = await authorize(req, res, false);
      // if (user.role != 'manager') {
      //   return Promise.resolve(false);
      // }
      res.redirect(ServerConfig.SERVER_ADDRESS + '/dist/');
    } catch(e) {
      // return Promise.reject(e);
    }
  })
};
