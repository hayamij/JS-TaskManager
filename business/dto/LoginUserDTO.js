/**
 * Input DTO for user login
 */
class LoginUserInputDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

/**
 * Output DTO for successful login
 */
class LoginUserOutputDTO {
    constructor(token, user) {
        this.token = token;
        this.user = {
            id: user.getId(),
            username: user.getUsername(),
            email: user.getEmail()
        };
    }
}

module.exports = { LoginUserInputDTO, LoginUserOutputDTO };
