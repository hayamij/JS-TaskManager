
class VerifyTokenInputDTO {
    constructor(token) {
        this.token = token;
    }
}

class VerifyTokenOutputDTO {
    constructor(userId, username, email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}

module.exports = { VerifyTokenInputDTO, VerifyTokenOutputDTO };
