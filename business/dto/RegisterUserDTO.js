/**
 * Input DTO for user registration
 */
class RegisterUserInputDTO {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}

/**
 * Output DTO for successful registration
 */
class RegisterUserOutputDTO {
    constructor(userId, username, email, createdAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }

    static fromUser(user) {
        return new RegisterUserOutputDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt()
        );
    }
}

module.exports = { RegisterUserInputDTO, RegisterUserOutputDTO };
