const util = {
    successTrue: (info, data) => {
        return {
            result: 'success',
            info: info,
            data: data
        }
    },
    successFalse: (info, data) => {
        return {
            result: 'failed',
            info: info,
            data: data
        }
    }
};

module.exports = util;