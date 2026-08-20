interface Data {
    [key: string]: any;
}

export const utils = {
    removeSecret: (data: Data): Data => {
        for (let key in data) {
            if (
                key.includes('password')
                || key.includes('private')
            ) data[key] = '********';
        }
        return data;
    }
}