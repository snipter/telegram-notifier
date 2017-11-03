// Functions

const genAccessToken = () => {
    return Math.random().toString(36).substr(2, 10);
}

// Exports

module.exports = {
    genAccessToken,
}