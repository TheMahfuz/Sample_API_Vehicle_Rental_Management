export const generateRequestID = (): string => {
    const randomstring = require("randomstring");
    const request_id = "RID-" + new Date().valueOf() + "-" + randomstring.generate({
        length: 6,
        charset: 'numeric'
    });

    return request_id;
}