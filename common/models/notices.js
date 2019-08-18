'use strict';

var Common = require('./common.js');

module.exports = function(Notices) {
  Notices.disableRemoteMethodByName("upsert");
  Notices.disableRemoteMethodByName("find");
  Notices.disableRemoteMethodByName("replaceOrCreate");
  Notices.disableRemoteMethodByName("create");

  Notices.disableRemoteMethodByName("prototype.updateAttributes");
  Notices.disableRemoteMethodByName("findById");
  Notices.disableRemoteMethodByName("exists");
  Notices.disableRemoteMethodByName("replaceById");
  Notices.disableRemoteMethodByName("deleteById");

  Notices.disableRemoteMethodByName("createChangeStream");

  Notices.disableRemoteMethodByName("count");
  Notices.disableRemoteMethodByName("findOne");

  Notices.disableRemoteMethodByName("update");
  Notices.disableRemoteMethodByName("upsertWithWhere");

  Notices.listUserNotices_v2 = async(search, pageNum, pageIndex) => {
    if (!search) {
      search = '';
    }
    const query = {
      fields: ['id', 'title', 'content', 'createdAt', 'modifiedAt', 'visit'],
      where: {
        type: 'user',
        title: {
          like: search,
          options: 'i'
        }
      },
      limit: pageNum,
      skip: pageNum * pageIndex,
      order: 'modifiedAt DESC'
    }
    try {
      const notices = await Notices.find(query);
      const length = await Notices.count(query.where);
      return Promise.resolve(Common.makeResult(true, 'success', {
        notices,
        length: length
      }));
    } catch(e) {
      //cb(err, 'error');
      console.error(e);
      return Promise.reject(e);
    }
  }

  Notices.listUserNotices = async(search, pageNum, pageIndex) => {
    if (!search) {
      search = '';
    }
    if (pageNum == undefined) {
      pageNum = 100;
    }
    if (pageIndex == undefined) {
      pageIndex = 0;
    }

    const query = {
      fields: ['id', 'title', 'content', 'createdAt', 'modifiedAt', 'visit'],
      where: {
        type: 'user',
        title: {
          like: search,
          options: 'i'
        }
      },
      limit: pageNum,
      skip: pageNum * pageIndex,
      order: 'modifiedAt DESC'
    }
    try {
      const notices = await Notices.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', notices));
    } catch(e) {
      //cb(err, 'error');
      console.error(e);
      return Promise.reject(e);
    }
  }

  Notices.remoteMethod('listUserNotices', {
    accepts: [
      {arg: 'search', type: 'string', description: '검색문자렬, 빈문자렬일때 전체검색, 아니면 제목검색'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(전체) 전체공지창에서 공지내용목록\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'title: 공지제목\n',
        'content: 공지내용\n',
        'visit: 조회수\n',
        'type: 공지타입 (user: 유저공지 / store: 매장공지)\n',
      ]
    },
    http: {path:'/user-notices', verb: 'get'}
  });


  Notices.listStoreNotices = async(search, pageNum, pageIndex) => {
    if (!search) {
      search = '';
    }
    if (pageNum == undefined) {
      pageNum = 100;
    }
    if (pageIndex == undefined) {
      pageIndex = 0;
    }

    const query = {
      where: {
        type: 'store',
        title: {
          like: search,
          options: 'i'
        }
      },
      order: 'modifiedAt DESC',
      limit: pageNum,
      skip: pageNum * pageIndex
    }
    try {
      const notices = await Notices.find(query);
      return Promise.resolve(Common.makeResult(true, 'success', notices));
    } catch(e) {
      console.error(e);
      return Promise.reject(e);
    }
    // var Accounts = Notices.app.models.Accounts;
    // var Store = Notices.app.models.Store;
    // Accounts.inStoreInfo(manager_id, (err, res) => {
    //   if (err) {
    //     cb(err, 'error');
    //   } else {
    //     if (!res.success) {
    //       cb(null, Common.makeResult(false, res.content));
    //     } else {
    //       const userObj = res.result.user;
    //       const store = res.result.store;
    //       store.notices.find(query, (err, notices) => {
    //         if (err) {
    //           cb(err, 'error');
    //         } else {
    //           cb(null, Common.makeResult(true, 'success', notices));
    //         }
    //       });
    //     }
    //   }
    // });
  }

  Notices.remoteMethod('listStoreNotices', {
    accepts: [
      {arg: 'search', type: 'string', description: '검색문자렬, 빈문자일때 전체검색, 아니면 제목검색'},
      {arg: 'pageNum', type: 'number'},
      {arg: 'pageIndex', type: 'number'},
    ],
    description: [
      '(어드민, 매니저)매장공지창에서 공지내용목록\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'title: 공지제목\n',
        'content: 공지내용\n',
        'visit: 조회수\n',
        'modifiedAt: 작성일\n',
        'type: 공지타입 (user / store)\n',
      ]
    },
    http: {path:'/manager-notices', verb: 'get'}
  });



  // register
  Notices.registerNotices = async(title, content, type) => {
    if (Common.isValidParamString(title))
      return Promise.resolve(Common.makeResult(false, 'title is not empty'));
    if (Common.isValidParamString(content))
      return Promise.resolve(Common.makeResult(false, 'content is not empty'));

    try {
      const data = {
        title: title,
        content: content,
        createdAt: Date(),
        modifiedAt: Date(),
        type: type
      }
      const notice = await Notices.create(data);
      return Promise.resolve(Common.makeResult(true, 'success', notice));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Notices.remoteMethod('registerNotices', {
    accepts: [
      {arg: 'title', type: 'string', required: true, description: '제목'},
      {arg: 'content', type: 'string', required: true, description: '내용'},
      {arg: 'type', type: 'string', required: true, description: '유저공지일떄 "user", 매장공지일떄 "store"'},
    ],
    description: [
      '(어드민) 공지를 새로 등록할때\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'title: 공지제목\n',
        'content: 공지내용\n',
        'visit: 조회수\n',
        'type: 공지타입 (user / store)\n',
      ]
    },
    http: {path:'/register-notice', verb: 'post'}
  });


  // get notice
  Notices.getNotice = async(noticeId, access_token) => {
    const Accounts = Notices.app.models.Accounts;
    const AccessLogs = Notices.app.models.AccessLogs;
    try {
      let noticeObj = await Notices.findById(noticeId);
      if (!noticeObj) {
        return Promise.resolve(Common.makeResult(false, 'wrong noticeId'));
      }
      if (access_token) {
        const res_user = await Accounts.getSelfInfo(access_token);
        if (res_user.success) {
          const userObj = res_user.result;
          await AccessLogs.registerLog(userObj, 0, noticeObj);
          //noticeObj = await noticeObj.updateAttribute('visit', noticeObj.visit + 1);
        }
      }
      return Promise.resolve(Common.makeResult(true, 'success', noticeObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Notices.remoteMethod('getNotice', {
    accepts: [
      {arg: 'noticeId', type: 'string', required: true, description: '공지목록에서 얻은 목록결과에서 id'},
      {arg: 'access_token', type: 'string', required: false, description: '공지를 열람하는 유저의 토큰'}
    ],
    description: [
      '(전체) 목록에서 선택한 공지내용을 표시\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'title: 공지제목\n',
        'content: 공지내용\n',
        'visit: 조회수\n',
        'modifiedAt: 작성일\n',
        'type: 공지타입 (user / store)\n',
      ]
    },
    http: {path:'/get-notice', verb: 'get'}
  });

  // update notice
  Notices.updateNotices = async(noticeId, title, content, type) => {
    if (Common.isValidParamString(noticeId))
      return Promise.resolve(Common.makeResult(false, 'noticeId is not empty'));
    if (Common.isValidParamString(title))
      return Promise.resolve(Common.makeResult(false, 'title is not empty'));
    if (Common.isValidParamString(content))
      return Promise.resolve(Common.makeResult(false, 'content is not empty'));

    if (!type) type = 'user';

    try {
      const data = {
        title: title,
        content: content,
        modifiedAt: Date(),
        type: type
      }
      const notice = await Notices.findById(noticeId);
      const res = await notice.updateAttributes(data);
      return Promise.resolve(Common.makeResult(true, 'success', res));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Notices.remoteMethod('updateNotices', {
    accepts: [
      {arg: 'noticeId', type: 'string', required: true, description: '공지목록에서 얻은 목록결과에서 id'},
      {arg: 'title', type: 'string', required: true, description: '공지제목'},
      {arg: 'content', type: 'string', required: true, description: '공지내용'},
      {arg: 'type', type: 'string', required: true, description: '유저공지일떄 "user", 매장공지일떄 "store"'},
    ],
    description: [
      '(어드민) 수정된 공지내용을 보관\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '수정된 공지결과를 출력'
    },
    http: {path:'/update-notice', verb: 'post'}
  });


  
  // delete notice
  Notices.deleteNotice = async(noticeId) => {
    try {
      const notice = await Notices.deleteById(noticeId);
      return Promise.resolve(Common.makeResult(true, 'success', notice));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  Notices.remoteMethod('deleteNotice', {
    accepts: [
      {arg: 'noticeId', type: 'string', required: true, description: '공지 ID'},
    ],
    description: [
      '(어드민) 공지를 삭제\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: ''
    },
    http: {path:'/delete-notice', verb: 'post'}
  });
}
