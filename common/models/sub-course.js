'use strict';
var Common = require('./common.js');

module.exports = function(SubCourse) {
    SubCourse.saveSubCourse = async(courseObj, index, sub_name, sub_name_kr, sub_name_cn, sub_name_en, sub_name_jp,
        sub_par1, sub_par2, sub_par3, sub_par4, sub_par5, sub_par6, sub_par7, sub_par8, sub_par9) => {
        // if (sub_par1 + sub_par2 + sub_par3 + sub_par4 + sub_par5 + sub_par6 + sub_par7 + sub_par8 + sub_par9 != 36) {
        //     return Promise.resolve(Common.makeResult(false, 'sgerror', '서브코스의 파수들의 합은 36이여야 합니다.'));
        // }
        const data = {
            index: index,
            name: sub_name,
            name_kr: sub_name_kr,
            name_cn: sub_name_cn,
            name_en: sub_name_en,
            name_jp: sub_name_jp,
            par_number1: sub_par1,
            par_number2: sub_par2,
            par_number3: sub_par3,
            par_number4: sub_par4,
            par_number5: sub_par5,
            par_number6: sub_par6,
            par_number7: sub_par7,
            par_number8: sub_par8,
            par_number9: sub_par9,
        }
        try {
            let subCourse = await courseObj.sub_course.findOne({where: {index: index}});
            if (subCourse) {
                subCourse = await courseObj.sub_course.updateById(subCourse.id, data);
            } else {
                subCourse = await courseObj.sub_course.create(data);
            }
            return Promise.resolve(Common.makeResult(true, 'success', subCourse));
        } catch(e) {
            return Promise.reject(e);
        }
    }
};
