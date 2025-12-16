
class LoginUserInputDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

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
