'use strict';

var Common = require('./common.js');
var fs = require('fs');
const sharp = require('sharp');
//const moveFile = require('move-file');

module.exports = function(Container) {
    Container.uploadFile = async(req, res, dirPath) => {
        try {
            const res_file = await Container.ayncUploadFile2(dirPath, null, req, res);
            if (!res_file.success) {
                return Promise.resolve(Common.makeResult(false, res_file.cotent));
            } else {
                const fileObj = res_file.result.file;
                const newPath = res_file.result.path;
                const result = {
                    file: fileObj,
                    path: newPath,
                    fullpath: Common.FILE_SERVER_PATH + newPath,
                };
                return Promise.resolve(Common.makeResult(true, 'success', result));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    };
    Container.remoteMethod('uploadFile', {
        description: 'Uploads a file',
        accepts: [
            { arg: 'req', type: 'object', http: { source:'req' } },
            { arg: 'res', type: 'object', http: { source:'res' } },
            { arg: 'dirPath', type: 'string', required: false, description: '빈문자인 경우 temp등록부에 보관' },
        ],
        returns: {
            arg: 'fileObject',
            type: 'object',
            root: true,
            description: [
                'file: 파일오브젝트\n',
                'path: 업로드된 파일경로\n',
            ]
        },
        http: {path:'/upload-file', verb: 'post'}
    });

    Container.uploadUserPicture = async(req, res, access_token) => {
        try {
            const Accounts = Container.app.models.Accounts;
            const res_account = await Accounts.getSelfInfo(access_token);
            if (!res_account.success) {
                return Promise.resolve(Common.makeResult(false, res_account.cotent));
            } else {
                let userObj = res_account.result;
                const dirPath = 'user-picture/' + userObj.id;
                const res_file = await Container.ayncUploadFile2(dirPath, null, req, res);
                if (!res_file.success) {
                    return Promise.resolve(Common.makeResult(false, res_file.cotent));
                } else {
                    const fileObj = res_file.result.file;
                    const filePath = res_file.result.path;
                    const filename = fileObj.name.split('.').slice(0, -1).join('.');
                    const resizedPath = dirPath + '/' + filename + '_resize.jpg';
                    await sharp('./storage/' + filePath)
                        .jpeg({
                            quality: 100,
                            chromaSubsampling: '4:4:4'
                        })
                        .resize({width: 256})
                        .withMetadata()
                        .toFile('./storage/' + resizedPath)
                    //   .toBuffer();
                    //     .rotate()
                    //     .resize(128)
                    //     .toBuffer()
                    //     .then( data => {
                    //         fs.writeFileSync('yellow.png', data);
                    //     })
                    //     .catch( err => {
                    //         console.log(err);
                    //     });	
                    userObj = await userObj.updateAttribute('photo', resizedPath);
                    const result = {
                        file: fileObj,
                        path: filePath,
                        user: userObj.id
                    };
                    return Promise.resolve(Common.makeResult(true, 'success', result));
                }
            }
        } catch(e) {
            return Promise.reject(e);
        }
    };
    Container.remoteMethod('uploadUserPicture', {
            description: 'Uploads a file',
            accepts: [
                { arg: 'req', type: 'object', http: { source:'req' } },
                { arg: 'res', type: 'object', http: { source:'res' } },
                { arg: 'access_token', type: 'string', required: true, description: '현재 유저의 토큰아이디' },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:'/upload-userpicture', verb: 'post'}
        }
    );
    
    let asyncMoveMotionMuliFiles = async(fileObjVideo, fileObjThumb, dirPath, gameLogId, holeIndex, club, carry, userObj) => {
        if (!fileObjVideo[0] || !fileObjThumb[0]) {
            return Promise.resolve(Common.makeResult(false, 'there is no uploaded file'));
        }
        const MotionVideo = Container.app.models.MotionVideo;
        const videoFilename = fileObjVideo[0].name;
        const thumbFilename = fileObjThumb[0].name;
        const newFilePathVideo = await Container.ayncMoveFile('temp/' + videoFilename, dirPath, videoFilename);
        const newFilePathThumb = await Container.ayncMoveFile('temp/' + thumbFilename, dirPath, thumbFilename);
        if (newFilePathVideo && newFilePathThumb) {
            const res_video = await MotionVideo.createVideo(gameLogId, newFilePathVideo, newFilePathThumb, holeIndex, club, carry, userObj);
            if (!res_video.success) {
                return Promise.resolve(Common.makeResult(false, res_upload.content));
            } else {
                return Promise.resolve(Common.makeResult(true, 'success', res_video));
            }
        } else {
            return Promise.resolve(Common.makeResult(false, 'moving failed2'));
        }
    }
    Container.uploadUserMotion = async(req, res, access_token, gameLogId, holeIndex, club, carry) => {
        try {
            const Accounts = Container.app.models.Accounts;

            const res_account = await Accounts.getSelfInfo(access_token);
            if (!res_account.success) {
                return Promise.resolve(Common.makeResult(false, res_account.content));
            } else {
                let userObj = res_account.result;
                const dirPath1 = 'storage/user-motion/' + userObj.id;
                if (!fs.existsSync(dirPath1)) {
                    fs.mkdirSync(dirPath1);
                }
                const dirPath2 = 'user-motion/' + userObj.id;
                
                const res_upload = await Container.ayncUploadFile('temp', req, res);
                let result1, result2;
                let fileObjVideo = res_upload.files["video1"];
                let fileObjThumb = res_upload.files["thumb1"];
                if (fileObjVideo && fileObjThumb) {
                    result1 = await asyncMoveMotionMuliFiles(fileObjVideo, fileObjThumb, dirPath2, gameLogId, holeIndex, club, carry, userObj);
                }
                fileObjVideo = res_upload.files["video2"];
                fileObjThumb = res_upload.files["thumb2"];
                if (fileObjVideo && fileObjThumb) {
                    result2 = await asyncMoveMotionMuliFiles(fileObjVideo, fileObjThumb, dirPath2, gameLogId, holeIndex, club, carry, userObj);
                }
                if (result1.success || result2.success) {
                    return Common.makeResult(true, 'success', {
                        result1: result1.result,
                        result2: result2 ? result2.result : null
                    });
                } else {
                    return Common.makeResult(false, 'move failed')
                }
            }
        } catch(e) {
            return Promise.reject(e);
        }
    };

    Container.remoteMethod('uploadUserMotion', {
            description: 'Uploads a file',
            accepts: [
                { arg: 'req', type: 'object', http: { source:'req' } },
                { arg: 'res', type: 'object', http: { source:'res' } },
                { arg: 'access_token', type: 'string', required: true, description: '유저의 토큰아이디' },
                { arg: 'gameLogId', type: 'string', required: true, description: '실행중의 게임로그아이디' },
                { arg: 'holeIndex', type: 'number', required: true, description: '현재 홀번호'},
                { arg: 'club', type: 'number', required: true, description: '클럽번호' },
                { arg: 'carry', type: 'number', required: true, description: '캐리거리' },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:'/upload-usermotion', verb: 'post'}
        }
    );

    
    Container.uploadLogFile = async(req, res, roomId) => {
        try {
            const dirPath = 'log-errors/' + roomId;
            const res_file = await Container.ayncUploadFile2(dirPath, null, req, res);
            if (!res_file.success) {
                return Promise.resolve(Common.makeResult(false, res_file.cotent));
            } else {
                return Promise.resolve(Common.makeResult(true, 'success', res_file.result));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    };

    Container.remoteMethod('uploadLogFile', {
            description: 'Uploads a log file',
            accepts: [
                { arg: 'req', type: 'object', http: { source:'req' } },
                { arg: 'res', type: 'object', http: { source:'res' } },
                { arg: 'roomId', type: 'string', required: true, description: '피씨의 아이디' },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:'/upload-logfile', verb: 'post'}
        }
    );






    // Container.getFileById = function(fileId, res, cb) {
    //     return new Promise((resolve, reject) => {
    //         Container.downloadById(fileId, res, function(err, fileObj) {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(fileObj);
    //             }
    //         })
    //     })
    // }
    // Container.remoteMethod('getFileById', {
    //         description: 'Uploads a file',
    //         accepts: [
    //             { arg: 'fileId', type: 'string', required: true, description: '파일 디비아이디' },
    //             { arg: 'res', type: 'object', http: { source:'res' } },
    //         ],
    //         returns: {
    //             arg: 'fileObject', type: 'object', root: true
    //         },
    //         http: {path:'/get-file', verb: 'post'}
    //     }
    // );
    
    Container.ayncUploadFile = async(container, req, res) => {
        return new Promise((resolve, reject) => {
            Container.upload(container, req, res, function(err, fileObjs) {
                if (err) {
                    reject(err);
                } else {
                    resolve(fileObjs);
                }
            })
        })
    }
    
    Container.ayncMoveFile = async(srcPath, dirPath, filename) => {
        if (!filename) filename = srcPath.replace(/^.*[\\\/]/, '')
        return new Promise((resolve, reject) => {
            srcPath = './storage/' + srcPath;
            const fullPath = './storage/' + dirPath;
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
            }
            fs.rename(srcPath, fullPath + '/' + filename, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(dirPath + '/' + filename);
                }
            })
        })
    }

    Container.ayncUploadFile2 = async(dirPath, filename, req, res) => {
        try {
            const result = await Container.ayncUploadFile('temp', req, res);
            let fileObjs = result.files['upload'];
            // if (!fileObjs) fileObjs = result.files[0];

            let fileObj;
            if (Array.isArray(fileObjs)) {
                if (fileObjs.length == 0) {
                    return Promise.resolve(Common.makeResult(false, 'did not updloaded'));
                }
                fileObj = fileObjs[0];
            } else {
                fileObj = fileObjs;
            }
            if (!fileObj) {
                return Promise.resolve(Common.makeResult(false, 'updloading failed2'));
            }
            if (!filename) {
                filename = fileObj.name;
            }
            let newFilePath;
            if (dirPath) {
                newFilePath = await Container.ayncMoveFile('temp/' + fileObj.name, dirPath, filename);
            } else {
                newFilePath = 'temp/' + fileObj.name;
            }
            return Promise.resolve(Common.makeResult(true, 'success', {
                file: fileObj,
                path: newFilePath
            }));
        } catch(e) {
            return Promise.reject(e);
        }
    }






    
    Container.uploadFileDB = async(req, res, roomId, version) => {
        try {
            const dirPath = 'log-errors/' + roomId;
            const res_file = await Container.ayncUploadFile2(dirPath, null, req, res);
            if (!res_file.success) {
                return Promise.resolve(Common.makeResult(false, res_file.cotent));
            } else {
                return Promise.resolve(Common.makeResult(true, 'success', res_file.result));
            }
        } catch(e) {
            return Promise.reject(e);
        }
    };

    Container.remoteMethod('uploadFileDB', {
            description: 'Uploads a log file',
            accepts: [
                { arg: 'req', type: 'object', http: { source:'req' } },
                { arg: 'res', type: 'object', http: { source:'res' } },
                { arg: 'version', type: 'string', required: true, description: '파일 버젼' },
                { arg: 'roomId', type: 'string', required: true, description: '피씨의 아이디' },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:'/upload-filedb', verb: 'post'}
        }
    );
};
