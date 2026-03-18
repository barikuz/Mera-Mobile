module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: ["nativewind/babel"], // Bütün çeviri işini sadece burası yapacak!
    };
};