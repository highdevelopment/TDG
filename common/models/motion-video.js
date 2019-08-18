'use strict';
var Common = require('./common.js');

module.exports = function(MotionVideo) {

    MotionVideo.disableRemoteMethodByName("upsert");
    MotionVideo.disableRemoteMethodByName("find");
    MotionVideo.disableRemoteMethodByName("replaceOrCreate");
    MotionVideo.disableRemoteMethodByName("create");

    MotionVideo.disableRemoteMethodByName("prototype.updateAttributes");
    MotionVideo.disableRemoteMethodByName("findById");
    MotionVideo.disableRemoteMethodByName("exists");
    MotionVideo.disableRemoteMethodByName("replaceById");
    MotionVideo.disableRemoteMethodByName("deleteById");

    MotionVideo.disableRemoteMethodByName("createChangeStream");

    MotionVideo.disableRemoteMethodByName("count");
    MotionVideo.disableRemoteMethodByName("findOne");

    MotionVideo.disableRemoteMethodByName("update");
    MotionVideo.disableRemoteMethodByName("upsertWithWhere");

 
    MotionVideo.createVideo = async(gameLogId, filepath, filepath_thumb, holeIndex, club, carry, userObj) => {
        const GameLogs = MotionVideo.app.models.GameLogs;
        const Accoutns = MotionVideo.app.models.GameLogs;
        const Store = MotionVideo.app.models.Store;
        try {
            const gameLogObj = await GameLogs.findById(gameLogId);
            if (!gameLogObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong gameLogId'));
            }
            const storeObj = await Store.findById(gameLogObj.storeId, {fields: ['storeName']});
            // const userObj = await Accoutns.findById(userId);
            const data = {
                filepath: filepath,
                filepath_thumb: filepath_thumb,
                holeIndex: holeIndex,
                courseName: gameLogObj.course,
                storeName: storeObj.storeName,
                status: 'normal',
                club: club,
                carry: carry,
                isPublic: false,
                userId: userObj.id.toString(),
                user_nickname: userObj.nickname,
                like: 0,
                visit: 0,
                createdAt: Date(),
                updatedAt: Date()
            }
            const motionObj = await gameLogObj.motionVideo.create(data);
            return Promise.resolve(Common.makeResult(true, 'success', motionObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }


    MotionVideo.updatePublicVideo = async(access_token, motionId, isPublic, title, content) => {
        try {
            let motionObj = await MotionVideo.findById(motionId);
            if (!motionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong motionId'));
            }
            const data = {
                isPublic: isPublic,
                title: title,
                content: content,
                updatedAt: Date()
            }
            motionObj = await motionObj.updateAttributes(data);
            return Promise.resolve(Common.makeResult(true, 'success', motionObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('updatePublicVideo', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
            {arg: 'motionId', type: 'string', required: true, description: '비디오아이디'},
            {arg: 'isPublic', type: 'boolean', description: '공개/비공개'},
            {arg: 'title', type: 'string', description: '제목'},
            {arg: 'content', type: 'string', description: '내용'},
        ],
        description: [
            '(유저) 스윙모션비데오를 공개/비공개한다(자랑하기)',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '갱신된 스윙모션자료를 리턴한다.'
        },
        http: {path:'/update-public', verb: 'post'}
    });
    
    MotionVideo.updateData = async(motionId, title, isPublic) => {
        try {
            let motionObj = await MotionVideo.findById(motionId);
            if (!motionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong motionId'));
            }
            const data = {
                title: title,
                isPublic: isPublic,
                updatedAt: Date()
            }
            motionObj = await gameLogObj.motionVideo.create.find(data);
            return Promise.resolve(Common.makeResult(true, 'success', motionObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('updateData', {
        accepts: [
            {arg: 'motionId', type: 'string', description: '비디오아이디'},
            {arg: 'title', type: 'string', description: '모션타이틀'},
            {arg: 'isPublic', type: 'boolean', description: '공개/비공개'},
        ],
        description: [
            '스윙모션등록',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '갱신된 스윙모션자료를 리턴한다.'
        },
        http: {path:'/update-video', verb: 'post'}
    });


    MotionVideo.deleteVideo = async(access_token, motionId) => {
        try {
            const motionObj = await MotionVideo.findById(motionId);
            if (!motionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong motionId'));
            }
            const res = await MotionVideo.deleteById(motionId);
            return Promise.resolve(Common.makeResult(true, 'success', res));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    
    MotionVideo.remoteMethod('deleteVideo', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
            {arg: 'motionId', type: 'string', description: '모션아이디, getVideoList()에서 얻은 아이디'},
        ],
        description: [
            '(유저앱) 모션삭제',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: '스윙모션을 삭제한다.'
        },
        http: {path:'/delete-video', verb: 'post'}
    });

    
    MotionVideo.getVideoList_v2 = async(access_token, pageNum, pageIndex) => {
        if (pageNum == undefined) {
          pageNum = 100;
        }
        if (pageIndex == undefined) {
          pageIndex = 0;
        }
        const GameLogs = MotionVideo.app.models.GameLogs;
        const Accounts = MotionVideo.app.models.Accounts;
        
        var Store = Accounts.app.models.Store;
        try {
            const token = await Accounts.accessToken.findById(access_token);
            if (!token) {
                return Promise.resolve(Common.makeResult(false, 'Unauthorized (token error)'));
            } else {
                const user = await Accounts.findById(token.userId);
                let results = [];
                const query = {
                    fields: ['id', 'filepath', 'filepath_thumb', 'title', 'content', 'holeIndex', 'club', 'carry', 'courseName', 'storeName', 'createdAt', 'updatedAt'],
                    where: {
                    //     game_num: {gte: 8},
                        userId: user.id.toString()
                    },
                    order: 'createdAt DESC',
                    limit: pageNum,
                    skip: pageNum * pageIndex
                }
                const motions = await MotionVideo.find(query);
                const length = await MotionVideo.count(query.where);
                for (let motionObj of motions) {
                    motionObj.carry = motionObj.carry.toFixed(1);
                    motionObj.filepath = Common.FILE_SERVER_PATH + motionObj.filepath;
                    motionObj.filepath_thumb = Common.FILE_SERVER_PATH + motionObj.filepath_thumb;
                }
                return Promise.resolve(Common.makeResult(true, 'success', {
                    length: length,
                    motions: motions
                }));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('getVideoList_v2', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰아이디'},
            {arg: 'pageNum', type: 'number', description: ''},
            {arg: 'pageIndex', type: 'number', description: ''}
        ],
        description: [
            '현재 사용자의 스윙영상목록을 리턴한다.\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'length: 총개수\n',
                'motions.id: 모션아이디\n',
                'motions.filepath_thumb: 비디오이미지파일경로\n',
                'motions.filepath: 비디오파일경로\n',
                'motions.title: 제목\n',
                'motions.storeName: 매장이름\n',
                'motions.courseName: 코스이름\n',
                'motions.createdAt: 날짜\n',
            ]
        },
        http: {path:'/videolist_v2', verb: 'post'}
    });

    MotionVideo.getVideoList = async(access_token, pageNum, pageIndex) => {
        if (pageNum == undefined) {
          pageNum = 100;
        }
        if (pageIndex == undefined) {
          pageIndex = 0;
        }
        const GameLogs = MotionVideo.app.models.GameLogs;
        const Accounts = MotionVideo.app.models.Accounts;
        
        var Store = Accounts.app.models.Store;
        try {
            const token = await Accounts.accessToken.findById(access_token);
            if (!token) {
                return Promise.resolve(Common.makeResult(false, 'Unauthorized (token error)'));
            } else {
                const user = await Accounts.findById(token.userId);
                let results = [];
                const query = {
                    // where: {
                    //     game_num: {gte: 8},
                    // },
                    order: 'createdAt DESC',
                    limit: 4
                }
                const gameLogs = await user.game_log.find(query);
                await Promise.all(gameLogs.map(async gameLog => {
                    const query2 = {
                        fields: ['id', 'filepath', 'filepath_thumb', 'title', 'content', 'holeIndex', 'club', 'carry', 'courseName', 'storeName', 'createdAt', 'updatedAt'],
                        order: 'createdAt DESC'
                    }
                    let motions = await gameLog.motionVideo.find(query2);
                    for (let motionObj of motions) {
                        motionObj.carry = motionObj.carry.toFixed(1);
                        motionObj.filepath = Common.FILE_SERVER_PATH + motionObj.filepath;
                        motionObj.filepath_thumb = Common.FILE_SERVER_PATH + motionObj.filepath_thumb;
                    }
                    results = results.concat(motions);
                }))
                results.sort(function(a, b){return b.createdAt.getTime() - a.createdAt.getTime()});
                return Promise.resolve(Common.makeResult(true, 'success', results));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('getVideoList', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰아이디'},
            {arg: 'pageNum', type: 'number', description: ''},
            {arg: 'pageIndex', type: 'number', description: ''}
        ],
        description: [
            '현재 사용자의 스윙영상목록을 리턴한다.\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'id: 모션아이디\n',
                'filepath_thumb: 비디오이미지파일경로\n',
                'filepath: 비디오파일경로\n',
                'title: 제목\n',
                'storeName: 매장이름\n',
                'courseName: 코스이름\n',
                'createdAt: 날짜\n',
            ]
        },
        http: {path:'/videolist', verb: 'post'}
    });

    MotionVideo.getPublicBestList = async(date1, date2) => {
        try {
            const query = {
                fields: ['id', 'filepath', 'filepath_thumb', 'title', 'content', 'holeIndex', 'club', 'carry', 'courseName', 'storeName', 'createdAt', 'updatedAt'],
                where: {
                    isPublic: true,
                },
                order: ['createdAt DESC', 'like DESC', 'visit DESC'],
                limit: 3,
            }
            const motions = await MotionVideo.find(query);
            for (let motionObj of motions) {
                motionObj.time = motionObj.createdAt.yyyymmdd();
                motionObj.clubName = Common.clubName[motionObj.club];
            }
            return Promise.resolve(Common.makeResult(true, 'success', motions));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    // gender: 0: 전체, 1: 남자, 2: 여자
    // sort: 0: 최신순, 1: 좋아요순, 2: 조회순, 3: 댓글순
    MotionVideo.getPublicVideoList_v2 = async(pageNum, pageIndex, gender, sort) => {
        try {
            if (!pageNum) pageNum = 8;
            const query = {
                fields: ['id', 'filepath', 'filepath_thumb', 'title', 'content', 'holeIndex', 'club', 'carry', 'courseName', 'storeName', 'createdAt', 'updatedAt'],
                where: {
                    isPublic: true,
                },
                limit: pageNum,
                skip: pageNum * pageIndex,
            }
            if (gender == 1) { //남자
                query.where.gender = {neq: 1};
            } else if (gender == 2) { //여자
                query.where.gender = 1;
            }
            if (sort == 0) { //최신순
                query.order = 'createdAt DESC';
            } else if (sort == 1) { //좋아요순
                query.order = ['like DESC', 'createdAt DESC'];
            } else if (sort == 2) { //조회순
                query.order = ['visit DESC', 'createdAt DESC'];
            } else if (sort == 3) { //댓글순
                query.order = ['chat_num DESC', 'createdAt DESC'];
            } else {
                query.order = 'createdAt DESC';
            }
            const motions = await MotionVideo.find(query);
            const length = await MotionVideo.count(query.where);
            for (let motionObj of motions) {
                motionObj.time = motionObj.createdAt.yyyymmdd();
                motionObj.clubName = Common.clubName[motionObj.club];
            }
            return Promise.resolve(Common.makeResult(true, 'success', {
                motions: motions,
                length: length
            }));
        } catch(e) {
            return Promise.reject(e);
        }
    }

    MotionVideo.getPublicVideoList = async(limit) => {
        const Accounts = MotionVideo.app.models.Accounts;
        try {
            if (!limit) limit = 8;
            const query = {
                // where: {
                //     isPublic: true
                // },
                limit: limit,
                order: 'createdAt DESC',
            }
            const motions = await MotionVideo.find(query);
            for (let motionObj of motions) {
                motionObj.chat_num = await motionObj.chats.count();
                motionObj.time = motionObj.createdAt.yyyymmdd();
                motionObj.clubName = Common.clubName[motionObj.club];
            }
            return Promise.resolve(Common.makeResult(true, 'success', motions));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('getPublicVideoList', {
        accepts: [
            {arg: 'limit', type: 'number', description: '모션비디오개수'},
        ],
        description: [
            '공개된 스윙영상목록을 리턴한다.\n',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'id: 모션아이디\n',
                'filepath_thumb: 비디오이미지파일경로\n',
                'filepath: 비디오파일경로\n',
                'title: 제목\n',
                'courseName: 코스이름\n',
                'createdAt: 날짜\n',
                'time: 날짜(yyyy-mm-dd)\n',
                'nickname: 모션유저닉네임\n',
                'chat_num: 챠트개수\n',
            ]
        },
        http: {path:'/get-public-videos', verb: 'post'}
    });
    
    MotionVideo.getVideo = async(videoId) => {
        try {
            let motionObj = await MotionVideo.findById(videoId);
            if (!motionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong motionId'));
            }
            motionObj.clubName = Common.getClubName(motionObj.club);
            motionObj.time = motionObj.createdAt.yyyymmdd();
            await motionObj.updateAttribute('visit', motionObj.visit + 1);
            return Promise.resolve(Common.makeResult(true, 'success', motionObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('getVideo', {
        accepts: [
            {arg: 'videoId', type: 'string', description: '비디오아이디'},
        ],
        description: [
            '스윙모션비디오상세자료',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
                'filepath: 비디오파일경로\n',
                'filepath_thumb: 비디오이미지파일경로\n',
                'title: 타이틀\n',
                'holeIndex: 홀번호\n',
                'club: 클럽\n',
                'carry: 캐리(m)\n',
                'storeName: 매장이름\n',
                'courseName: 코스명\n',
                'isPublic: 공유\n',
                'time: 타임(yy-mm-dd)\n',
            ]
        },
        http: {path:'/get-video', verb: 'get'}
    });

    MotionVideo.likeVideo = async(access_token, videoId) => {
        try {
            const Accounts = MotionVideo.app.models.Accounts;
            const MotionLike = MotionVideo.app.models.MotionLike;

            const res = await Accounts.getSelfInfo(access_token);
            let userObj = res.result;
            if (!res.success) {
              return Promise.resolve(Common.makeResult(false, res.content));
            }
            let motionObj = await MotionVideo.findById(videoId);
            if (!motionObj) {
                return Promise.resolve(Common.makeResult(false, 'wrong motionId'));
            }
            await MotionLike.registerLike(motionObj, userObj.id);
            return Promise.resolve(Common.makeResult(true, 'success', motionObj));
        } catch(e) {
            return Promise.reject(e);
        }
    }
    MotionVideo.remoteMethod('likeVideo', {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, description: '유저토큰'},
            {arg: 'motionId', type: 'string', required: true, description: '모션아이디'},
        ],
        description: [
            '(유저웹) 스윙모션비디오 Like',
        ],
        returns: {
            arg: 'res',
            type: 'string',
            description: [
            ]
        },
        http: {path:'/like-video', verb: 'post'}
    });
};
