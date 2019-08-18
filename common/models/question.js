'use strict';
var Common = require('./common.js');

module.exports = function(Question) {
    Question.disableRemoteMethodByName("upsert");
    Question.disableRemoteMethodByName("find");
    Question.disableRemoteMethodByName("replaceOrCreate");
    Question.disableRemoteMethodByName("create");
  
    Question.disableRemoteMethodByName("prototype.updateAttributes");
    Question.disableRemoteMethodByName("findById");
    Question.disableRemoteMethodByName("exists");
    Question.disableRemoteMethodByName("replaceById");
    Question.disableRemoteMethodByName("deleteById");
  
    Question.disableRemoteMethodByName("createChangeStream");
  
    Question.disableRemoteMethodByName("count");
    Question.disableRemoteMethodByName("findOne");
  
    Question.disableRemoteMethodByName("update");
    Question.disableRemoteMethodByName("upsertWithWhere");


    Question.getQuestionList_v2 = async(access_token, search_type, search, pageNum, pageIndex) => {
        const Accounts = Question.app.models.Accounts;
        try {
            if (access_token) {
                const res = await Accounts.getSelfInfo(access_token);
                if (res.success) {
                    const userObj = res.result;
                    const query = {
                        fields: ['id', 'type', 'title', 'content', 'answer', 'visit', 'status', 'createdAt', 'modifiedAt'],
                        where: {
                            or: [
                                {type: 0},
                                {type: 2},
                            ],
                            or: [
                                {status: 'waitting'},
                                {status: 'checked'},
                            ],
                        },
                        limit: pageNum,
                        skip: pageIndex * pageNum,
                        order: 'createdAt DESC'
                    }
                    if (search_type == 0) { //제목
                        query.where.title = {like: search, options: 'i'}
                    } else if (search_type == 1) { //내용
                        query.where.content = {like: search, options: 'i'}
                    } else if (search_type == 2) { //제목 + 내용
                        query.where.or = [
                            { like: search, options: 'i' },
                            { like: search, options: 'i' }
                        ]
                    }
                    const length = await userObj.questions.count(query.where);
                    const questions = await userObj.questions.find(query);
                    return Promise.resolve(Common.makeResult(true, 'success', {
                        length: length,
                        questions: questions
                    }));
                } else {
                    return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
                }
            } else {
                const questions = await Question.find({});
                return Promise.resolve(Common.makeResult(true, 'success', questions));
            }
        } catch(e) {
            return Promise.reject(e);
        } 
    }

    Question.getQuestionList = async(access_token, pageNum, pageIndex) => {
        const Accounts = Question.app.models.Accounts;
        try {
            if (access_token) {
                const res = await Accounts.getSelfInfo(access_token);
                if (res.success) {
                    const userObj = res.result;
                    const query = {
                        fields: ['id', 'type', 'title', 'content', 'answer', 'visit', 'status', 'createdAt', 'modifiedAt'],
                        where: {
                            or: [
                                {type: 0},
                                {type: 2},
                            ],
                            or: [
                                {status: 'waitting'},
                                {status: 'checked'},
                            ],
                        },
                        limit: pageNum,
                        skip: pageIndex,
                        order: 'createdAt DESC'
                    }
                    const questions = await userObj.questions.find(query);
                    return Promise.resolve(Common.makeResult(true, 'success', questions));
                } else {
                    return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
                }
            } else {
                const questions = await Question.find({});
                return Promise.resolve(Common.makeResult(true, 'success', questions));
            }
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('getQuestionList', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '현재 유저의 토큰아이디, 빈문자렬이면 전체검색'},
            {arg: 'pageNum', type: 'number'},
            {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(전체) 현재 유저의 1:1문의목록',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)'
            ]
        },
        http: {path:'/getquestions', verb: 'get'}
    });

    
    Question.getAllQuetionList = async(type, pageNum, pageIndex) => {
        try {
            const query = {
                fields: ['id', 'type', 'title', 'content', 'answer', 'visit', 'status', 'createdAt', 'modifiedAt'],
                where: {
                    type: type,
                },
                limit: pageNum,
                skip: pageIndex ? pageNum * pageIndex : 0,
                order: 'createdAt DESC'
            }
            const questions = await Question.find(query);
            return Promise.resolve(Common.makeResult(true, 'success', questions));            
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('getAllQuetionList', {
        accepts: [
            {arg: 'type', type: 'number', required: true, description: 'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ'},
            {arg: 'pageNum', type: 'number'},
            {arg: 'pageIndex', type: 'number'},
        ],
        description: [
            '(전체) 현재 유저의 1:1문의목록',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)'
            ]
        },
        http: {path:'/getall-questions', verb: 'get'}
    });

    Question.getQuestion = async(questionId) => {
        var Accounts = Question.app.models.Accounts;
        try {
            // const query = {
            //     fields: ['accountsId', 'type', 'title', 'content', 'answer', 'visit', 'status', 'photo_question', 'photo_answer', 'createdAt', 'modifiedAt'],
            // };
            const questionObj = await Question.findById(questionId);
            if (!questionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong questionId'));
            } else {
                const result = questionObj;
                if (questionObj.accountsId) {
                    const ss = await questionObj.updateAttribute('read', true);
                    const userObj = await Accounts.findById(questionObj.accountsId);
                    result.role = userObj.role;
                    if (userObj.role == 'admin') {
                        result.name = 'TDG 관리자';
                    }
                    else if (userObj.role == 'manager') {
                        const storeObj = await userObj.store.get();
                        result.name = storeObj.manager_name;
                        result.storeName = storeObj.storeName;
                    } else {
                        result.name = userObj.realname;
                    }
                } else {
                    result.name = 'TDG 관리자';
                }
                return Promise.resolve(Common.makeResult(true, 'success', result));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Question.remoteMethod('getQuestion', {
        accepts: [
            {arg: 'questionId', type: 'string', required: true, description: '목록에서 얻은 질문자료의 id값'},
        ],
        description: [
            '(전체) 질문목록을 클릭할때 개별적인 질문자료를 얻는다.',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'name: 작성자이름\n',
                'storeName: 점포명\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)\n',
                'createdAt: 작성일\n',
            ]
        },
        http: {path:'/getquestion', verb: 'get'}
    });

    Question.createQuestion = async(access_token, mail, title, content, photo_question) => {
        const Accounts = Question.app.models.Accounts;
        const Container = Question.app.models.Container;
        try {
            let type = 0;
            const res = await Accounts.getSelfInfo(access_token);
            if (res.success) {
                const userObj = res.result;
                if (Common.isBlankString(mail)) {
                    mail = userObj.mail;
                }
                if (userObj.role == 'manager') type = 2;
                const data = {
                    type: type,
                    mail: mail,
                    title: title,
                    content: content,
                    photo_question: photo_question,
                    createdAt: Date(),
                    modifiedAt: Date(),
                    status: 'waitting',
                }
                let question = await userObj.questions.create(data);
                if (photo_question) {
                    const newPath = await Container.ayncMoveFile(photo_question, 'question/' + question.id);
                    if (newPath) {
                        question = await question.updateAttribute('photo_question', newPath);
                    } else {
                        return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                    }
                }
                return Promise.resolve(Common.makeResult(true, 'success', question));
            } else {
                return Promise.resolve(Common.makeResult(false, 'wrong access_token'));
            }
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('createQuestion', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰아이디'},
            {arg: 'mail', type: 'string', required: false, description: '메일'},
            {arg: 'title', type: 'string', required: true, description: '질문제목'},
            {arg: 'content', type: 'string', required: false, description: '질문내용'},
            {arg: 'photo_question', type: 'string', required: false, description: '질문이미지'},
        ],
        description: [
            '(전체) 1:1문의를 등록'
        ],
        returns: {
            arg: 'res',
            type: 'object',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)\n'
            ]
        },
        http: {path:'/create-question', verb: 'post'}
    });

    
    Question.createPublicQuestion = async(type, title, content, answer) => {
        try {
            const data = {
                type: type,
                title: title,
                content: content,
                answer: answer,
                createdAt: Date(),
                modifiedAt: Date(),
                status: 'checked'
            }
            const question = await Question.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', question));
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('createPublicQuestion', {
        accepts: [
            {arg: 'type', type: 'number', required: true, description: '1: 유저FAQ / 3: 매장FAQ'},
            {arg: 'title', type: 'string', required: true, description: '질문제목'},
            {arg: 'content', type: 'string', required: false, description: '질문내용'},
            {arg: 'answer', type: 'string', required: false, description: '답변'},
        ],
        description: [
            '(어드민) 1:1문의를 등록'
        ],
        returns: {
            arg: 'res',
            type: 'object',
            description: [
                'type: 1: 유저FAQ / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)\n'
            ]
        },
        http: {path:'/create-public-question', verb: 'post'}
    });

    
    Question.answerQuestion = async(questionId, answer, photo_answer) => {
        try {
            const Container = Question.app.models.Container;
            let questionObj = await Question.findById(questionId);
            if (!questionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong questionId'));
            } else {
                if (photo_answer && photo_answer.length > 0 && questionObj.photo_answer != photo_answer) {
                    const newPath = await Container.ayncMoveFile(photo_answer, 'question/' + questionId);
                    if (newPath) {
                        photo_answer = newPath;
                    } else {
                        return Promise.resolve(Common.makeResult(false, 'server problem (file moving)'));
                    }
                }
                const data = {
                    answer: answer,
                    photo_answer: photo_answer,
                    status: 'checked',
                    modifiedAt: Date(),
                }
                questionObj = await questionObj.updateAttributes(data);
                if (!questionObj) {
                    return Promise.resolve(Common.makeResult(false, 'update failed'))
                }
                return Promise.resolve(questionObj);
            }
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('answerQuestion', {
        accepts: [
            {arg: 'questionId', type: 'string', required: true, description: '질문아이디'},
            {arg: 'answer', type: 'string', required: true, description: '답변내용'},
            {arg: 'photo_answer', type: 'string', required: false, description: '답변이미지'},
        ],
        description: [
            '(어드민) 1:1문의에 대한 답변'
        ],
        returns: {
            arg: 'res',
            type: 'object',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)\n'
            ]
        },
        http: {path:'/answer-question', verb: 'post'}
    });

    
    Question.updatePublicQuestion = async(questionId, title, content, photo_question, answer, photo_answer) => {
        try {
            let questionObj = await Question.findById(questionId);
            if (!questionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong questionId'));
            } else {
                const data = {
                    title: title,
                    content: content,
                    photo_question: photo_question,
                    answer: answer,
                    photo_answer: photo_answer,
                    modifiedAt: Date(),
                    status: 'done'
                }
                questionObj = await questionObj.updateAttributes(data);
                if (!questionObj) {
                    return Promise.resolve(Common.makeResult(false, 'update failed'))
                }
                return Promise.resolve(questionObj);
            }
        } catch(e) {
            return Promise.reject(e);
        } 
    }
    Question.remoteMethod('updatePublicQuestion', {
        accepts: [
            {arg: 'questionId', type: 'string', required: true, description: '질문아이디'},
            {arg: 'title', type: 'string', required: true, description: '답변내용'},
            {arg: 'content', type: 'string', required: false, description: '답변내용'},
            {arg: 'photo_question', type: 'string', required: false, description: '답변내용'},
            {arg: 'answer', type: 'string', required: true, description: '답변내용'},
            {arg: 'photo_answer', type: 'string', required: false, description: '답변내용'},
        ],
        description: [
            '(어드민) 질문자료를 업데이트'
        ],
        returns: {
            arg: 'res',
            type: 'object',
            description: [
                'type: 0: 유저질문 / 1: 유저FAQ / 2: 매장질문 / 3: 매장FAQ\n',
                'title: 질문제목\n',
                'content: 질문내용\n',
                'answer: 답변\n',
                'photo_question: 질문이미지\n',
                'photo_answer: 답변이미지\n',
                'status: 질문상태 (waitting: 답변대기중, checked: 답변완료, deleted: 삭제됨)\n'
            ]
        },
        http: {path:'/update-question', verb: 'post'}
    });

    
    // delete
    Question.deleteQuestion = async(questionId) => {
        try {
            const question = await Question.deleteById(questionId);
            return Promise.resolve(Common.makeResult(true, 'success', question));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Question.remoteMethod('deleteQuestion', {
        accepts: [
            {arg: 'questionId', type: 'string', required: true, description: '질문 ID'},
        ],
        description: [
            '(어드민) 질문을 삭제\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: ''
        },
        http: {path:'/delete-question', verb: 'post'}
    });
}

