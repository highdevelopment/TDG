'use strict';
var Common = require('./common.js');

module.exports = function(Card) {
    Card.disableRemoteMethodByName("upsert");
    Card.disableRemoteMethodByName("find");
    Card.disableRemoteMethodByName("replaceOrCreate");
    Card.disableRemoteMethodByName("create");
  
    Card.disableRemoteMethodByName("prototype.updateAttributes");
    Card.disableRemoteMethodByName("findById");
    Card.disableRemoteMethodByName("exists");
    Card.disableRemoteMethodByName("replaceById");
    Card.disableRemoteMethodByName("deleteById");
  
    Card.disableRemoteMethodByName("createChangeStream");
  
    Card.disableRemoteMethodByName("count");
    Card.disableRemoteMethodByName("findOne");
  
    Card.disableRemoteMethodByName("update");
    Card.disableRemoteMethodByName("upsertWithWhere");

    // register
    Card.registerCard = async(access_token, type, userId, userPass) => {
        try {
            const Accounts = Card.app.models.Accounts;
            const managerObj = await Accounts.accessToken.findById(access_token);
            const user_res = await Accounts.loginUser(userId, userPass);
            if (!user_res.success) {
                return Promise.resolve(Common.makeResult(false, user_res.content, user_res.result));
            }
            const userObj = user_res.result.user;
            const data = {
                type: type,
                managerId: managerObj.id,
                userId: userObj.id,
                createdAt: Date(),
                modifiedAt: Date(),
            }
            let cardObj = await Card.create(data);
            if (!cardObj) {
                return Promise.resolve(Common.makeResult(false, 'cannot create card'));
            }
            return Promise.resolve(Common.makeResult(true, 'success', {
                cardId: cardObj.id,
                managerId: cardObj.managerId,
                type: cardObj.type,
                userId: userObj.id,
                nickname: userObj.nickname,
                createdAt: cardObj.createdAt
            }));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    Card.remoteMethod('registerCard', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '매니저토큰'},
            {arg: 'type', type: 'string', required: true, description: '카드타입'},
            {arg: 'userId', type: 'string', required: true, description: '유저아이디'},
            {arg: 'userPass', type: 'string', required: true, description: '유저암호'},
        ],
        description: [
            '(NFC 프로그램) 카드를 새로 등록할때\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'cardId: 카드아이디\n',
                'type: 카드타입\n',
                'managerId: 매니저아이디\n',
                'userId: 유저아이디\n',
                'nickname: 유저닉네임\n',
                'createdAt: 창조날짜\n',
            ]
        },
        http: {path:'/register-card', verb: 'post'}
    });
};
