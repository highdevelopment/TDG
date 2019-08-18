'use strict';

var Common = require('./common.js');

module.exports = function(CustomerService) {

    CustomerService.disableRemoteMethodByName("upsert");
    CustomerService.disableRemoteMethodByName("find");
    CustomerService.disableRemoteMethodByName("replaceOrCreate");
    CustomerService.disableRemoteMethodByName("create");
  
    CustomerService.disableRemoteMethodByName("prototype.updateAttributes");
    CustomerService.disableRemoteMethodByName("findById");
    CustomerService.disableRemoteMethodByName("exists");
    CustomerService.disableRemoteMethodByName("replaceById");
    CustomerService.disableRemoteMethodByName("deleteById");
  
    CustomerService.disableRemoteMethodByName("createChangeStream");
  
    CustomerService.disableRemoteMethodByName("count");
    CustomerService.disableRemoteMethodByName("findOne");
  
    CustomerService.disableRemoteMethodByName("update");
    CustomerService.disableRemoteMethodByName("upsertWithWhere");

    
    CustomerService.listServices = async(search, pageNum, pageIndex) => {
        if (!search) {
            search = '';
        }
        const query = {
            fields: [ 'id', 'service_no', 'type', 'storeName', 'roomName', 'category', 'title', 'receptedAt', 'endedAt', 'status' ],
            where: {
                or: [
                    { storeName: { like: search, options: 'i' } },
                    { requester_name: { like: search, options: 'i' } },
                    { roomName: { like: search, options: 'i' } },
                    { title: { like: search, options: 'i' } },
                ]
            },
            limit: pageNum,
            skip: pageNum * pageIndex,
            order: 'createdAt DESC'
        }
        try {
            const services = await CustomerService.find(query);
            return Promise.resolve(Common.makeResult(true, 'success', services));
        } catch(e) {
            return Promise.reject(e);
        }
    }

    CustomerService.remoteMethod('listServices', {
        accepts: [
            {arg: 'search', type: 'string', description: '검색문자렬, 빈문자렬일때 전체검색'},
            {arg: 'pageNum', type: 'number'},
            {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(어드민) 클레임접수 및 조치 목록\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 접수형태 online: 온라인 / phone: 유선\n',
                'service_no: 번호\n',
                'category: 분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타\n',
                'storeName: 매장명\n',
                'roomName: 룸이름\n',
                'receptedAt: 접수일\n',
                'endedAt: 완료일\n',
                'title: 제목\n',
                'status: "상태 waitting: 대기 / processing: 진행중 / done: 완료"\n',
            ]
        },
        http: {path:'/get-services', verb: 'get'}
    });

    
    CustomerService.getManagerServices = async(access_token, pageNum, pageIndex) => {
        const Store = CustomerService.app.models.Store;
        try {
            if (!pageNum) pageNum = 30;
            if (!pageIndex) pageIndex = 0;
            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const query = {
                fields: [ 'id', 'service_no', 'type', 'storeName', 'roomName', 'category', 'title', 'content', 'receptedAt', 'endedAt', 'status' ],
                limit: pageNum,
                skip: pageNum * pageIndex,
                order: 'modifiedAt DESC',
            }
            const services = await storeObj.CustomerService.find(query);
            return Promise.resolve(Common.makeResult(true, 'success', services));
        } catch(e) {
            return Promise.reject(e);
        }
    }

    CustomerService.remoteMethod('getManagerServices', {
        accepts: [
            {arg: 'access_token', type: 'string', description: '매니저토큰아이디'},
            {arg: 'pageNum', type: 'number'},
            {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(매니저웹) AS요청 목록\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 접수형태 online: 온라인 / phone: 유선\n',
                'service_no: 번호\n',
                'category: 분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타\n',
                'storeName: 매장명\n',
                'roomName: 룸이름\n',
                'receptedAt: 접수일\n',
                'endedAt: 완료일\n',
                'title: 제목\n',
                'content: 내용\n',
                'status: "상태 waitting: 대기 / processing: 진행중 / done: 완료"\n',
            ]
        },
        http: {path:'/get-manager-services', verb: 'get'}
    });


    
    // register
    CustomerService.registerServiceByAdmin = async(storeName, roomName, category, request_name, request_contact, recept_name, recept_contact, receptedAt, title, content) => {
        try {
            if (!receptedAt) receptedAt = new Date();
            const count = await CustomerService.count();
            const data = {
                service_no: 1000 + count + 1,
                type: 'phone',
                storeName: storeName,
                roomName: roomName,
                category: category,
                request_name: request_name,
                request_contact: request_contact,
                recept_name: recept_name,
                recept_contact: recept_contact,
                receptedAt: receptedAt,
                title: title,
                content: content,
                createdAt: Date(),
                modifiedAt: Date(),
                status: 'processing'
            }
            const service = await CustomerService.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', service));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CustomerService.remoteMethod('registerServiceByAdmin', {
        accepts: [
            {arg: 'storeName', type: 'string', required: true, description: '매장명'},
            {arg: 'roomName', type: 'string', required: true, description: '룸이름'},
            {arg: 'category', type: 'string', required: true, description: '분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타'},
            {arg: 'request_name', type: 'string', required: true, description: '요청자이름'},
            {arg: 'request_contact', type: 'string', required: true, description: '요청자 연락처'},
            {arg: 'recept_name', type: 'string', required: true, description: '접수자이름'},
            {arg: 'recept_contact', type: 'string', required: true, description: '접수자 연락처'},
            {arg: 'receptedAt', type: 'string', required: false, description: '접수날짜'},
            {arg: 'title', type: 'string', required: true, description: '제목'},
            {arg: 'content', type: 'string', required: false, description: '내용'},
        ],
        description: [
            '(어드민) 어드민에서 접수를 받고 새로 등록할때\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '등록된 자료를 리턴한다.'
        },
        http: {path:'/register-admin', verb: 'post'}
    });


    
    // register
    CustomerService.registerServiceByManager = async(access_token, roomName, category, request_name, request_contact, receptedAt, title, content, photo) => {
        const Store = CustomerService.app.models.Store;
        try {
            if (!receptedAt) receptedAt = new Date();

            const res_user = await Store.getStoreFromToken(access_token);
            let storeObj;
            if (!res_user.success) {
              return Promise.resolve(Common.makeResult(false, res_user.content));
            } else {
              storeObj = res_user.result;
            }
            const storeName = storeObj.storeName;
            const count = await CustomerService.count();
            const data = {
                service_no: 1000 + count + 1,
                type: 'online',
                storeName: storeName,
                roomName: roomName,
                category: category,
                request_name: request_name,
                request_contact: request_contact,
                receptedAt: receptedAt,
                title: title,
                content: content,
                photo: photo,
                createdAt: Date(),
                modifiedAt: Date(),
                status: 'waitting'
            }
            const service = await storeObj.CustomerService.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', service));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CustomerService.remoteMethod('registerServiceByManager', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '매니저토큰아이디'},
            {arg: 'roomName', type: 'string', required: true, description: '룸이름'},
            {arg: 'category', type: 'string', required: true, description: '분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타'},
            {arg: 'request_name', type: 'string', required: true, description: '요청자이름'},
            {arg: 'request_contact', type: 'string', required: true, description: '요청자 연락처'},
            {arg: 'receptedAt', type: 'string', required: false, description: '접수날짜'},
            {arg: 'title', type: 'string', required: true, description: '제목'},
            {arg: 'content', type: 'string', required: false, description: '내용'},
            {arg: 'photo', type: 'string', required: false, description: '이미지파일경로'},
        ],
        description: [
            '(매니저웹) as 요청\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '등록된 자료를 리턴한다.'
        },
        http: {path:'/register-manager', verb: 'post'}
    });

    
    CustomerService.procService = async(serviceId, recept_name, recept_contact, status, note) => {
        try {
            let serviceObj = await CustomerService.findById(serviceId);
            if (!serviceObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong serviceId'));
            }
            const data = {
                recept_name: recept_name,
                recept_contact: recept_contact,
                status: status,
                note: note,
                modifiedAt: Date(),
            }
            if (status == 'done') {
                data.endedAt = new Date();
            }
            serviceObj = await serviceObj.updateAttributes(data);
            return Promise.resolve(Common.makeResult(true, 'success', serviceObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CustomerService.remoteMethod('procService', {
        accepts: [
            {arg: 'serviceId', type: 'string', required: true, description: '서비스아이디'},
            {arg: 'recept_name', type: 'string', required: true, description: '접수자이름'},
            {arg: 'recept_contact', type: 'string', required: false, description: '접수자 연락처'},
            {arg: 'status', type: 'string', required: true, description: '상태 waitting: 대기 / processing: 진행중 / done: 완료'},
            {arg: 'note', type: 'string', required: false, description: '비고'},
        ],
        description: [
            '(어드민) 클레임처리\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 접수형태 online: 온라인 / phone: 유선\n',
                'category: 분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타\n',
                'storeName: 매장명\n',
                'roomName: 룸이름\n',
                'request_name: 요청자이름',
                'request_contact: 요청자 연락처',
                'recept_name: 접수자이름',
                'recept_contact: 접수자 연락처',
                'receptedAt: 접수날짜',
                'title: 제목\n',
                'content: 내용\n',
                'title: 제목\n',
                'status: "상태 waitting: 대기 / processing: 진행중 / done: 완료"\n',
                'note: 비고\n',
                'endedAt: 완료일\n',
            ]
        },
        http: {path:'/proc-service', verb: 'post'}
    });

    

    CustomerService.getServiceById = async(serviceId) => {
        try {
            let serviceObj = await CustomerService.findById(serviceId);
            if (!serviceObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong serviceId'));
            }
            if (serviceObj.photo) serviceObj.photo = Common.FILE_SERVER_PATH + serviceObj.photo;
            return Promise.resolve(Common.makeResult(true, 'success', serviceObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    CustomerService.remoteMethod('getServiceById', {
        accepts: [
            {arg: 'serviceId', type: 'string', required: true, description: '서비스아이디'},
        ],
        description: [
            '(어드민, 매니저) 목록에서 클릭하였을때 서비스상세보기\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 접수형태 online: 온라인 / phone: 유선\n',
                'category: 분류 pc: 컴퓨터 / autotee: 오토티업기 / mat: 매트 / project: 프로젝터 / sensor: 센서 / swingcamera: 스윙카메라 / other: 기타\n',
                'storeName: 매장명\n',
                'roomName: 룸이름\n',
                'request_name: 요청자이름',
                'request_contact: 요청자 연락처',
                'recept_name: 접수자이름',
                'recept_contact: 접수자 연락처',
                'receptedAt: 접수날짜',
                'title: 제목\n',
                'content: 내용\n',
                'title: 제목\n',
                'status: "상태 waitting: 대기 / processing: 진행중 / done: 완료"\n',
                'note: 비고\n',
                'endedAt: 완료일\n',
            ]
        },
        http: {path:'/get-service', verb: 'get'}
    });

};
