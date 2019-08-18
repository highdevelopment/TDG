'use strict';

module.exports = function(RoomLogs) {
    RoomLogs.createRoomLog = async(roomObj, startedAt, endedAt) => {
        try {
            const playTime = (endedAt.getTime() - startedAt.getTime()) / 1000 / 60;
            const roomId = roomObj.id.toString();
            const storeId = roomObj.storeId.toString();
            const query = {
                where: {
                    roomId: roomId,
                    storeId: storeId
                },
                order: 'startedAt DESC',
            }
            const logObj = await RoomLogs.findOne(query);
            if (logObj) {
                if (logObj.startedAt < startedAt && startedAt < logObj.endedAt) {
                    const data = {
                        endedAt: startedAt,
                        playTime: (startedAt.getTime() - logObj.startedAt.getTime()) / 1000 / 60
                    }
                    await logObj.updateAttributes(data);
                }
            }

            const data = {
                roomId: roomObj.id.toString(),
                storeId: roomObj.storeId.toString(),
                startedAt: startedAt,
                playTime: playTime,
                endedAt: endedAt
            }
            await RoomLogs.create(data);
        } catch(e) {
            return Promise.reject(e);
        }
    }

    RoomLogs.endGame = async(roomObj) => {
        try {
            const roomId = roomObj.id.toString();
            const storeId = roomObj.storeId.toString();
            const query = {
                where: {
                    roomId: roomId,
                    storeId: storeId
                },
                order: 'startedAt DESC',
            }
            const logObj = await RoomLogs.findOne(query);
            if (logObj) {
                const now = new Date();
                if (logObj.startedAt < now && now < logObj.endedAt) {
                    const data = {
                        endedAt: now,
                        playTime: (now.getTime() - logObj.startedAt.getTime()) / 1000 / 60
                    }
                    await logObj.updateAttributes(data);
                }
            }
        } catch(e) {
            return Promise.reject(e);
        }
    }
};
