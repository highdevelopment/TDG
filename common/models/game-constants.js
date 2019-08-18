'use strict';

module.exports = function(Gameconstants) {
    Gameconstants.club = [
        {
            name: 'W1',
            dist: 220,
        },
        {
            name: 'W3',
            dist: 190,
        },
        {
            name: 'W5',
            dist: 170,
        },
        {
            name: 'U3',
            dist: 180,
        },
        {
            name: 'I3',
            dist: 175,
        },
        {
            name: 'I4',
            dist: 165,
        },
        {
            name: 'I5',
            dist: 160,
        },
        {
            name: 'I6',
            dist: 150,
        },
        {
            name: 'I7',
            dist: 140,
        },
        {
            name: 'I8',
            dist: 130,
        },
        {
            name: 'I9',
            dist: 120,
        },
        {
            name: 'PW',
            dist: 110,
        },
        {
            name: 'AW',
            dist: 90,
        },
        {
            name: 'SW',
            dist: 80,
        },
        {
            name: 'PU',
            dist: 30,
        },
    ];

    Gameconstants.saveConstants = async() => {
        try {
            const constantsObjs = await Gameconstants.find();
            if (constantsObjs.length > 1) {
                return Promise.resolve('constants have to be one');
            }
            const data = {
                club: Gameconstants.club
            }
            const constObj = constantsObjs[0];
            await constObj.updateAttributes(data);
            return Promise.resolve('success');
        } catch(e) {
            return Promise.resolve(e);
        }
    }

    Gameconstants.getClubDistance = async() => {
        try {
            const constantsObj = await Gameconstants.findOne();
            return constantsObj.club;
        } catch(e) {
            return Promise.resolve(e);
        }
    }
};
