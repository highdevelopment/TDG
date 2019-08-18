'use strict';
var Common = require('./common.js');

module.exports = function(ManualData) {

    ManualData.disableRemoteMethodByName("upsert");
    ManualData.disableRemoteMethodByName("find");
    ManualData.disableRemoteMethodByName("replaceOrCreate");
    ManualData.disableRemoteMethodByName("create");
  
    ManualData.disableRemoteMethodByName("prototype.updateAttributes");
    ManualData.disableRemoteMethodByName("findById");
    ManualData.disableRemoteMethodByName("exists");
    ManualData.disableRemoteMethodByName("replaceById");
    ManualData.disableRemoteMethodByName("deleteById");
  
    ManualData.disableRemoteMethodByName("createChangeStream");
  
    ManualData.disableRemoteMethodByName("count");
    ManualData.disableRemoteMethodByName("findOne");
  
    ManualData.disableRemoteMethodByName("update");
    ManualData.disableRemoteMethodByName("upsertWithWhere");


    
    ManualData.getDataList = async(type, pageNum, pageIndex) => {
        if (pageNum == undefined) pageNum = 100;
        if (pageIndex == undefined) pageIndex = 0;

        try {
          if (type == 0) type = undefined;
            const query = {
              fields: ['id', 'data_no', 'title', 'createdAt', 'modifiedAt', 'visit'],
              where: {
                type: type,
              },
              limit: pageNum,
              skip: pageNum * pageIndex,
              order: 'modifiedAt DESC'
            }
            const results = await ManualData.find(query);
            return Promise.resolve(Common.makeResult(true, 'success', results));
        } catch(e) {
            return Promise.reject(e);
        }
    }

    ManualData.remoteMethod('getDataList', {
        accepts: [
          {arg: 'type', type: 'number', required: true, description: '0: 전체, 1: 매뉴얼, 2: 자료'},
          {arg: 'pageNum', type: 'number'},
          {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(어드민, 관리자) 매뉴얼&자료실 목록\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'id: 아이디\n',
                'data_no: 자료번호\n',
                'title: 제목\n',
                'createdAt: 작성일\n',
                'modifiedAt: 변경일\n',
                'visit: 조회수\n',
            ]
        },
        http: {path:'/get-datalist', verb: 'get'}
    });

    // register
    ManualData.registerData = async(type, title, content, data_links) => {
        try {
            const data_no = await ManualData.count();
            const data = {
              type: type,
                data_no: data_no,
                title: title,
                content: content,
                visit: 0,
                data_links: data_links,
                createdAt: Date(),
                modifiedAt: Date(),
            }
            const dataObj = await ManualData.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', dataObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    ManualData.remoteMethod('registerData', {
        accepts: [
          {arg: 'type', type: 'number', required: true, description: '1: 매뉴얼, 2: 자료'},
          {arg: 'title', type: 'string', required: true, description: '제목'},
          {arg: 'content', type: 'string', required: false, description: '내용'},
          {arg: 'data_links', type: 'string', required: false, description: '자료링크 목록'},
        ],
        description: [
            '(어드민) 자료를 새로 등록\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'id: 아이디\n',
                'data_no: 자료번호\n',
                'title: 제목\n',
                'modifiedAt: 작성일\n',
                'visit: 조회수\n',
            ]
        },
        http: {path:'/register-data', verb: 'post'}
    });


  // get
  ManualData.getDataById = async(dataId) => {
    try {
      const dataObj = await ManualData.findById(dataId);
      return Promise.resolve(Common.makeResult(true, 'success', dataObj));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  ManualData.remoteMethod('getDataById', {
    accepts: [
      {arg: 'dataId', type: 'string', required: true, description: '목록에서 얻은 자료아이디'}
    ],
    description: [
      '(어드민, 매니저) 목록에서 선택한 자료내용을 표시\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
        'id: 아이디\n',
        'data_no: 자료번호\n',
        'title: 제목\n',
        'content: 내용\n',
        'data_links: 자료링크 목록\n',
        'modifiedAt: 작성일\n',
        'visit: 조회수\n',
      ]
    },
    http: {path:'/get-data', verb: 'get'}
  });

  // update Data
  ManualData.updateManualData = async(dataId, title, content, data_links) => {
    try {
      const data = {
        title: title,
        content: content,
        data_links: data_links,
        modifiedAt: Date(),
      }
      const dataObj = await ManualData.findById(dataId);
      const result = await dataObj.updateAttributes(data);
      return Promise.resolve(Common.makeResult(true, 'success', result));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  ManualData.remoteMethod('updateManualData', {
    accepts: [
      {arg: 'dataId', type: 'string', required: true, description: '자료아이디'},
      {arg: 'title', type: 'string', required: true, description: '제목'},
      {arg: 'content', type: 'string', required: false, description: '내용'},
      {arg: 'data_links', type: 'array', required: false, description: '자료링크 목록'},
    ],
    description: [
      '(어드민) 수정된 자료내용을 보관\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: '수정된 자료결과를 출력'
    },
    http: {path:'/update-data', verb: 'post'}
  });

  

  // get
  ManualData.deleteData = async(dataId) => {
    try {
      const res = await ManualData.deleteById(dataId);
      return Promise.resolve(Common.makeResult(true, 'success', res));
    } catch(e) {
      return Promise.reject(e);
    }
  }
  ManualData.remoteMethod('deleteData', {
    accepts: [
      {arg: 'dataId', type: 'string', required: true, description: '자료아이디'}
    ],
    description: [
      '(어드민) 자료삭제\n',
    ],
    returns: {
      arg: 'res',
      type: 'string',
      description: [
      ]
    },
    http: {path:'/delete-data', verb: 'post'}
  });
};
