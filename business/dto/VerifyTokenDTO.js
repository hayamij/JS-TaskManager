/**
 * Input DTO for verifying JWT token
 */
class VerifyTokenInputDTO {
    constructor(token) {
        this.token = token;
    }
}

/**
 * Output DTO for verified token
 */
class VerifyTokenOutputDTO {
    constructor(userId, username, email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}

module.exports = { VerifyTokenInputDTO, VerifyTokenOutputDTO };
