'use strict';

var Common = require('./common.js');

module.exports = function(Course) {

  Course.disableRemoteMethodByName("upsert");
  Course.disableRemoteMethodByName("find");
  Course.disableRemoteMethodByName("replaceOrCreate");
  Course.disableRemoteMethodByName("create");

  Course.disableRemoteMethodByName("prototype.updateAttributes");
  Course.disableRemoteMethodByName("findById");
  Course.disableRemoteMethodByName("exists");
  Course.disableRemoteMethodByName("replaceById");
  Course.disableRemoteMethodByName("deleteById");

  Course.disableRemoteMethodByName("createChangeStream");

  Course.disableRemoteMethodByName("count");
  Course.disableRemoteMethodByName("findOne");

  Course.disableRemoteMethodByName("update");
  Course.disableRemoteMethodByName("upsertWithWhere");

  
  Course.disableRemoteMethodByName('prototype.__get__sub_course');
  Course.disableRemoteMethodByName('prototype.__create__sub_course');
  Course.disableRemoteMethodByName('prototype.__delete__sub_course');
  Course.disableRemoteMethodByName('prototype.__findById__sub_course');
  Course.disableRemoteMethodByName('prototype.__updateById__sub_course');
  Course.disableRemoteMethodByName('prototype.__destroyById__sub_course');
  Course.disableRemoteMethodByName('prototype.__count__sub_course');

  // register
  Course.saveCourse = async(name, country, hole_level, green_level, subCC_num, photo, address,
    name_kr, address_kr, comment_kr, name_cn, address_cn, name_en, address_en, name_jp, address_jp,
    sub1_name, sub1_name_kr, sub1_name_cn, sub1_name_en, sub1_name_jp, sub1_par1, sub1_par2, sub1_par3, sub1_par4, sub1_par5, sub1_par6, sub1_par7, sub1_par8, sub1_par9,
    sub2_name, sub2_name_kr, sub2_name_cn, sub2_name_en, sub2_name_jp, sub2_par1, sub2_par2, sub2_par3, sub2_par4, sub2_par5, sub2_par6, sub2_par7, sub2_par8, sub2_par9,
    sub3_name, sub3_name_kr, sub3_name_cn, sub3_name_en, sub3_name_jp, sub3_par1, sub3_par2, sub3_par3, sub3_par4, sub3_par5, sub3_par6, sub3_par7, sub3_par8, sub3_par9,
    sub4_name, sub4_name_kr, sub4_name_cn, sub4_name_en, sub4_name_jp, sub4_par1, sub4_par2, sub4_par3, sub4_par4, sub4_par5, sub4_par6, sub4_par7, sub4_par8, sub4_par9,
    website, province, logo) => {
      
    var SubCourse = Course.app.models.SubCourse;
    var Container = Course.app.models.Container;

    try {
      const query = {
        where: {
          name: {
            like: name,
            options: 'i'
          }
        }
      }
      let courseObj = await Course.findOne(query);
      if (!courseObj || photo && photo != courseObj.photo) {
          const newPath = await Container.ayncMoveFile(photo, 'course/' + name);
          if (newPath) {
            photo = newPath;
          } else {
              return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
          }
      }
      const data = {
        name: name,
        country: country,
        hole_level: hole_level,
        green_level: green_level,
        subCC_num: subCC_num,
        address: address,
        photo: photo,
  
        name_kr: name_kr,
        address_kr: address_kr,
        comment_kr: comment_kr,
        name_cn: name_cn,
        address_cn: address_cn,
        name_en: name_en,
        address_en: address_en,
        name_jp: name_jp,
        address_jp: address_jp,
        createdAt: Date(),
        modifiedAt: Date(),
  
        website: website,
        province: province,
        logo: logo
      };
      courseObj = await Course.upsertWithWhere({name: name}, data);
      if (!courseObj) {
        return Promise.resolve(Common.makeResult(false, 'create faile'));
      }
      let res_subcourse = await SubCourse.saveSubCourse(courseObj, 0, sub1_name, sub1_name_kr, sub1_name_cn, sub1_name_en, sub1_name_jp,
        sub1_par1, sub1_par2, sub1_par3, sub1_par4, sub1_par5, sub1_par6, sub1_par7, sub1_par8, sub1_par9);
      if (!res_subcourse.success) {
        return Promise.resolve(Common.makeResult(false, res_subcourse.content, '첫번째 ' + res_subcourse.result));
      }
      if (sub2_name) {
        res_subcourse = await SubCourse.saveSubCourse(courseObj, 1, sub2_name, sub2_name_kr, sub2_name_cn, sub2_name_en, sub2_name_jp,
          sub2_par1, sub2_par2, sub2_par3, sub2_par4, sub2_par5, sub2_par6, sub2_par7, sub2_par8, sub2_par9);
        if (!res_subcourse.success) {
          return Promise.resolve(Common.makeResult(false, res_subcourse.content, '두번째 ' + res_subcourse.result));
        }
      }
      if (sub3_name) {
        res_subcourse = await SubCourse.saveSubCourse(courseObj, 2, sub3_name, sub3_name_kr, sub3_name_cn, sub3_name_en, sub3_name_jp,
          sub3_par1, sub3_par2, sub3_par3, sub3_par4, sub3_par5, sub3_par6, sub3_par7, sub3_par8, sub3_par9);
        if (!res_subcourse.success) {
          return Promise.resolve(Common.makeResult(false, res_subcourse.content, '세번째 ' + res_subcourse.result));
        }
      }
      if (sub4_name) {
        res_subcourse = await SubCourse.saveSubCourse(courseObj, 3, sub4_name, sub4_name_kr, sub4_name_cn, sub4_name_en, sub4_name_jp,
          sub4_par1, sub4_par2, sub4_par3, sub4_par4, sub4_par5, sub4_par6, sub4_par7, sub4_par8, sub4_par9);
        if (!res_subcourse.success) {
          return Promise.resolve(Common.makeResult(false, res_subcourse.content, '네번째 ' + res_subcourse.result));
        }
      }
      return Promise.resolve(Common.makeResult(true, 'success', courseObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Course.remoteMethod('saveCourse', {
    accepts: [
      {arg: 'name', type: 'string', required: true, description: '코스이름(자료))'},
      {arg: 'country', type: 'string', required: true, description: '나라이름 (kor, chn, jpn, ...)'},
      {arg: 'hole_level', type: 'number', required: true, description: '코스난이도(0-5)'},
      {arg: 'green_level', type: 'number', required: true, description: '그린난이도(0-5)'},
      {arg: 'subCC_num', type: 'number', required: true, description: '서브코스개수 (1-4)'},
      {arg: 'photo', type: 'string', required: false, description: '코스이미지'},
      {arg: 'address', type: 'geopoint', required: false, description: '구글맵주소 ex: {"lat": 37.3664242, "lng": -126.45345351}'},

      {arg: 'name_kr', type: 'string', required: true, description: '코스이름(kr)'},
      {arg: 'address_kr', type: 'string', required: true, description: '주소(kr)'},
      {arg: 'comment_kr', type: 'string', required: false, description: '해설문(kr)'},
      {arg: 'name_cn', type: 'string', description: '코스이름(cn)'},
      {arg: 'address_cn', type: 'string'},
      {arg: 'name_en', type: 'string', description: '코스이름(en)'},
      {arg: 'address_en', type: 'string'},
      {arg: 'name_jp', type: 'string', description: '코스이름(jp)'},
      {arg: 'address_jp', type: 'string'},
      
      {arg: 'sub1_name', type: 'string', required: true, description: '두번째 서브코스이름'},
      {arg: 'sub1_name_kr', type: 'string', required: true},
      {arg: 'sub1_name_cn', type: 'string', required: false},
      {arg: 'sub1_name_en', type: 'string', required: false},
      {arg: 'sub1_name_jp', type: 'string', required: false},
      {arg: 'sub1_par1', type: 'number', required: true, description: '1홀파수'},
      {arg: 'sub1_par2', type: 'number', required: true, description: '2홀파수'},
      {arg: 'sub1_par3', type: 'number', required: true, description: '3홀파수'},
      {arg: 'sub1_par4', type: 'number', required: true, description: '4홀파수'},
      {arg: 'sub1_par5', type: 'number', required: true, description: '5홀파수'},
      {arg: 'sub1_par6', type: 'number', required: true, description: '6홀파수'},
      {arg: 'sub1_par7', type: 'number', required: true, description: '7홀파수'},
      {arg: 'sub1_par8', type: 'number', required: true, description: '8홀파수'},
      {arg: 'sub1_par9', type: 'number', required: true, description: '9홀파수'},

      {arg: 'sub2_name', type: 'string', required: true, description: '두번째 서브코스이름'},
      {arg: 'sub2_name_kr', type: 'string', required: true},
      {arg: 'sub2_name_cn', type: 'string', required: false},
      {arg: 'sub2_name_en', type: 'string', required: false},
      {arg: 'sub2_name_jp', type: 'string', required: false},
      {arg: 'sub2_par1', type: 'number', required: true, description: '1홀파수'},
      {arg: 'sub2_par2', type: 'number', required: true, description: '2홀파수'},
      {arg: 'sub2_par3', type: 'number', required: true, description: '3홀파수'},
      {arg: 'sub2_par4', type: 'number', required: true, description: '4홀파수'},
      {arg: 'sub2_par5', type: 'number', required: true, description: '5홀파수'},
      {arg: 'sub2_par6', type: 'number', required: true, description: '6홀파수'},
      {arg: 'sub2_par7', type: 'number', required: true, description: '7홀파수'},
      {arg: 'sub2_par8', type: 'number', required: true, description: '8홀파수'},
      {arg: 'sub2_par9', type: 'number', required: true, description: '9홀파수'},

      {arg: 'sub3_name', type: 'string', required: false, description: '두번째 서브코스이름'},
      {arg: 'sub3_name_kr', type: 'string', required: false},
      {arg: 'sub3_name_cn', type: 'string', required: false},
      {arg: 'sub3_name_en', type: 'string', required: false},
      {arg: 'sub3_name_jp', type: 'string', required: false},
      {arg: 'sub3_par1', type: 'number', required: false, description: '1홀파수'},
      {arg: 'sub3_par2', type: 'number', required: false, description: '2홀파수'},
      {arg: 'sub3_par3', type: 'number', required: false, description: '3홀파수'},
      {arg: 'sub3_par4', type: 'number', required: false, description: '4홀파수'},
      {arg: 'sub3_par5', type: 'number', required: false, description: '5홀파수'},
      {arg: 'sub3_par6', type: 'number', required: false, description: '6홀파수'},
      {arg: 'sub3_par7', type: 'number', required: false, description: '7홀파수'},
      {arg: 'sub3_par8', type: 'number', required: false, description: '8홀파수'},
      {arg: 'sub3_par9', type: 'number', required: false, description: '9홀파수'},
      
      {arg: 'sub4_name', type: 'string', required: false, description: '두번째 서브코스이름'},
      {arg: 'sub4_name_kr', type: 'string', required: false},
      {arg: 'sub4_name_cn', type: 'string', required: false},
      {arg: 'sub4_name_en', type: 'string', required: false},
      {arg: 'sub4_name_jp', type: 'string', required: false},
      {arg: 'sub4_par1', type: 'number', required: false, description: '1홀파수'},
      {arg: 'sub4_par2', type: 'number', required: false, description: '2홀파수'},
      {arg: 'sub4_par3', type: 'number', required: false, description: '3홀파수'},
      {arg: 'sub4_par4', type: 'number', required: false, description: '4홀파수'},
      {arg: 'sub4_par5', type: 'number', required: false, description: '5홀파수'},
      {arg: 'sub4_par6', type: 'number', required: false, description: '6홀파수'},
      {arg: 'sub4_par7', type: 'number', required: false, description: '7홀파수'},
      {arg: 'sub4_par8', type: 'number', required: false, description: '8홀파수'},
      {arg: 'sub4_par9', type: 'number', required: false, description: '9홀파수'},
      
      {arg: 'website', type: 'string', required: false, description: '홈페이지'},
      {arg: 'province', type: 'number', required: false, description: '매장지역 0: 수도권, 1: 강원도, 2: 충청도, 3: 전라도, 4: 경상도, 5: 제주도, 6: 해외'},
      {arg: 'logo', type: 'string', required: false, description: '코스로고'},
    ],
    description: [
      '(어드민웹) 코스자료를 등록 및 보관한다',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '등록이 성공하면 등록된 코스를 리턴한다.'
    },
    http: {path:'/save-course', verb: 'post'}
  });

  Course.getProvince = function(index) {
    switch(index) {
      case 0: return '수도권';
      case 1: return '강원도';
      case 2: return '충청도';
      case 3: return '전라도';
      case 4: return '경상도';
      case 5: return '제주도';
      case 6: return '해외';
    }
    return '수도권';
  }
  Course.searchCourse = async(search, pageNum, pageIndex) => {
    if (!search) search = '';
    try {
      const query = {
        where: {
          or: [
            { name: { like: search, options: 'i' } },
            { name_kr: { like: search, options: 'i' } },
          ]
        },
        order: 'name_kr ASC',
        limit: pageNum,
        skip: pageNum * pageIndex
      };
      const courses = await Course.find(query);
      courses.map(course => {
        course.strProvince = Course.getProvince(course.province - 0);
        course.photo = Common.FILE_SERVER_PATH + course.photo;
      })
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.remoteMethod('searchCourse', {
    accepts: [
      {arg: 'search', type: 'string', description: '코스제목 검색문자렬'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(전체) 코스제목',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '코스검색결과를 리턴한다.'
    },
    http: {path:'/search-course', verb: 'get'}
  });

  Course.searchCourseWithProvince = async(search, province, sort_option) => {
    if (!search) search = '';
    try {
      const query = {
        where: {
          or: [
            { name: { like: search, options: 'i' } },
            { name_kr: { like: search, options: 'i' } },
          ]
        },
        order: 'createdAt DESC',
      };
      if (province != undefined) {
        query.where.province = province - 0;
      }
      if (sort_option == 1) {
        query.order = 'hole_level DESC'
      } else if (sort_option == 2) {
        query.order = 'hole_level ASC'
      }
      const courses = await Course.find(query);
      courses.map(course => {
        course.strProvince = Course.getProvince(course.province - 0);
      })
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Course.getNewCourse = async(limit) => {
    if (!limit) limit = 4;
    try {
      const query = {
        where: {
          
        },
        order: 'createdAt DESC',
        limit: limit
      };
      const courses = await Course.find(query);
      courses.map(course => {
        course.strProvince = Course.getProvince(course.province - 0);
        // course.photo = Common.FILE_SERVER_PATH + course.photo;
      })
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.remoteMethod('getNewCourse', {
    accepts: [
      {arg: 'limit', type: 'number', required: false, description: '코스개수'},
    ],
    description: [
      '(전체) 신규코스',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '신규코스들을 리턴한다.'
    },
    http: {path:'/get-newcourse', verb: 'get'}
  });

  // Course.getOldCourse = async() => {
  //   try {
  //     const query = {
  //       where: {
  //       },
  //       order: 'createdAt DESC',
  //       skip: 4
  //     };
  //     const courses = await Course.find(query);
  //     return Promise.resolve(Common.makeResult(true, 'success', courses));
  //   } catch(e) {
  //     return Promise.reject(e);
  //   }
  // }
  // Course.remoteMethod('getOldCourse', {
  //   accepts: [
  //   ],
  //   description: [
  //     '(전체) 코스제목',
  //   ],
  //   returns: {
  //     arg: 'res',
  //     type: 'string',
  //     description: '신규코스를 제외한 나머지코스들을 리턴한다.'
  //   },
  //   http: {path:'/get-oldcourse', verb: 'get'}
  // });
  
  Course.getCourseInfo = async(courseId) => {
    try {
      const courseObj = await Course.findById(courseId);
      const subCourses = await courseObj.sub_course.getAsync();
      return Promise.resolve(Common.makeResult(true, 'success', {
        course: courseObj,
        subCourse: subCourses
      }));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.remoteMethod('getCourseInfo', {
    accepts: [
      {arg: 'courseId', type: 'string', required: true, description: '코스자료아이디'},
    ],
    description: [
      '(전체) 코스와 코스에 속한 서브코스자료를 얻는다.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'course: 코스자료\n',
        'course.name: 디비상에서의 이름\n',
        'course.country: 코스가 위치한 나라명\n',
        'course.hole_level: 홀난이도\n',
        'course.green_level: 그린난이도\n',
        'course.subCC_num: 서브코스개수\n',
        'course.name_kr: 한국식이름\n',
        'course.address_kr: 한국식주소\n',
        'course.comment_kr: 한국식해설문\n',
        'course.name_cn: 중국식이름\n',
        'course.address_cn: 중국식주소\n',
        'course.name_en: 영식이름\n',
        'course.address_en: 영식주소\n',
        'course.name_jp: 일본식이름\n',
        'course.address_jp: 일본식주소\n',
        'course.photo: 코스소개이미지\n',
        'course.address: 실제주소\n',

        'subCourse: 코스에 속한 서브코스자료목록\n',
        'subCourse.index: 코스자료에서의 번호 (0-3)\n',
        'subCourse.name: 디비에서의 식별이름\n',
        'subCourse.name_kr: 서브코스이름\n',
        'subCourse.name_cn: 서브코스이름\n',
        'subCourse.name_en: 서브코스이름\n',
        'subCourse.name_jp: 서브코스이름\n',
        'subCourse.par_number1: 1홀 파수\n',
        'subCourse.par_number2: 2홀 파수\n',
        'subCourse.par_number3: 3홀 파수\n',
        'subCourse.par_number4: 4홀 파수\n',
        'subCourse.par_number5: 5홀 파수\n',
        'subCourse.par_number6: 6홀 파수\n',
        'subCourse.par_number7: 7홀 파수\n',
        'subCourse.par_number8: 8홀 파수\n',
        'subCourse.par_number9: 9홀 파수\n',
        'subCourse.name: 디비상에서의\n',
      ]
    },
    http: {path:'/get-course', verb: 'get'}
  });

  Course.deleteCourse = async(courseId) => {
    try {
      const result = await Course.deleteById(courseId);
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.remoteMethod('deleteCourse', {
    accepts: [
      {arg: 'courseId', type: 'string', required: true, description: '코스아이디'},
    ],
    description: [
      '(어드민) 코스를 삭제한다',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: ''
    },
    http: {path:'/delete-course', verb: 'post'}
  });

  let courseNames;
  Course.initNameTable = async() => {
    courseNames = {
      'driving': '연습장'
    };
    try {
      const query = {
        fileds: ['name', 'name_kr']
      }
      const courses = await Course.find(query);
      courses.map(courseObj => {
        courseNames[courseObj.name] = courseObj.name_kr;
      })
      return Promise.resolve(true);
    } catch(e) {
      return Promise.resolve(false);
    }
  }

  Course.getCourseName = async(course_name, langId) => {
    if (!langId) langId = 0;
    if (!courseNames) {
      await Course.initNameTable();
    }
    let result = courseNames[course_name];
    if (!result) {
      result = await Course.getCourseNameAsync(course_name, langId);
    }
    return result;
  }

  Course.getCourseNameAsync = async(course_name, langId) => {
    if (!langId) langId = 0;
    try {
      const query = {
        where: {
          name: {
            like: course_name,
            options: 'i'
          }
        }
      }
      const courseObj = await Course.findOne(query);
      if (courseObj) {
        return Promise.resolve(courseObj.name_kr);
      }
      return course_name;
    } catch(e) {
      return Promise.reject(e);
    }
  }
  


  
  Course.resetAllVisit = async() => {
    var GameLogs = Course.app.models.GameLogs;
    try {
      const query = {
        where: {
          game_num: {gte: 9}
        }
      }
      const ary_logs = await GameLogs.find(query);      
      ary_logs.sort((a, b) => {
        if (a.course > b.course) return 1;
        if (a.course < b.course) return -1;
        return a.modifiedAt - b.modifiedAt;
      })
      const groupedLogs = {};
      ary_logs.map(async logObj => {
        const user = await logObj.accounts.get();
        if (groupedLogs[logObj.course]) {
          groupedLogs[logObj.course].count++;
          groupedLogs[logObj.course].time = logObj.modifiedAt;
          if (user) {
            if (user.sex == 'male') {
              groupedLogs[logObj.course].count_male++;
            } else {
              groupedLogs[logObj.course].count_female++;
            }
          }
        } else {
          groupedLogs[logObj.course] = {
            count: 1,
            time: logObj.modifiedAt,
            count_male: 0,
            count_female: 0
          };
          if (user) {
            if (user.sex == 'male') {
              groupedLogs[logObj.course].count_male = 1;
            } else {
              groupedLogs[logObj.course].count_female = 1;
            }
          }
        }
      });

      const courses = await Course.find();
      courses.map(async courseObj => {
        const obj = groupedLogs[courseObj.name]
        const data = {
          visit: obj ? obj.count : 0,
          visit_male: obj ? obj.count_male : 0,
          visit_female: obj ? obj.count_female : 0,
        };
        await courseObj.updateAttributes(data);
      })

    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.remoteMethod('resetAllVisit', {
    accepts: [
    ],
    description: [
      '(어드민) 베스트코스를 얻기 위해 코스조회수를 갱신한다.',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: ''
    },
    http: {path:'/reset-visit', verb: 'post'}
  });


  Course.getBestCourse = async(limit) => {
    if (!limit) limit = 3;
    try {
      const query = {
        fileds: 'course',
        where: {
        },
        order: 'visit DESC createdAt DESC',
        limit: limit
      };
      const courses = await Course.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.getBestCourseForMale = async(limit) => {
    if (!limit) limit = 3;
    try {
      const query = {
        fileds: 'course',
        where: {
        },
        order: 'visit_male DESC createdAt DESC',
        limit: limit
      };
      const courses = await Course.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Course.getBestCourseForFemale = async(limit) => {
    if (!limit) limit = 3;
    try {
      const query = {
        fileds: 'course',
        where: {
        },
        order: 'visit_female DESC createdAt DESC',
        limit: limit
      };
      const courses = await Course.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', courses));
    } catch(e) {
      return Promise.reject(e);
    }
  }

  Course.getRecommendCourse = async(userObj, limit) => {
    if (!limit) limit = 3;
    try {
      const query_log = {
        fileds: ['course', 'modifiedAt'],
        where: {
          game_num: {gte: 9}
        },
        order: 'modifiedAt DESC',
        limit: 100
      }
      const gameLogs = [];
      const ary_logs = await userObj.game_log.find(query_log);
      ary_logs.sort((a, b) => {
        if (a.course > b.course) return 1;
        if (a.course < b.course) return -1;
        return a.modifiedAt - b.modifiedAt;
      })
      const groupedLogs = {};
      const strComp = '';
      ary_logs.map(obj => {
        if (groupedLogs[obj.course]) {
          groupedLogs[obj.course].count++;
          groupedLogs[obj.course].time = obj.modifiedAt;
        } else {
          groupedLogs[obj.course] = {
            count: 1,
            time: obj.modifiedAt
          };
        }
      });

      const query = {
        fileds: 'course',
        where: {
        },
        order: 'createdAt DESC',
      };
      const allCourses = await Course.find(query);
      allCourses.sort((a, b) => {
        const visit1 = groupedLogs[a.name] ? groupedLogs[a.name].count : 0;
        const visit2 = groupedLogs[b.name] ? groupedLogs[b.name].count : 0;
        if (visit1 > visit2) return 1;
        if (visit1 < visit2) return -1;
        const time1 = groupedLogs[a.name] ? groupedLogs[a.name].time : 0;
        const time2 = groupedLogs[b.name] ? groupedLogs[b.name].time : 0;
        if (time1 > time2) return 1;
        if (time1 < time2) return -1;
        return a.createdAt - b.createdAt;
      })
      return Promise.resolve(Common.makeResult(true, 'success', allCourses.slice(0, limit)));
    } catch(e) {
      return Promise.reject(e);
    }
  }
};








