/**
 * Login Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Check if already logged in
    if (API.getToken()) {
        window.location.href = '/dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        Utils.hideError('errorMessage');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!email || !password) {
            Utils.showError('errorMessage', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng nhập...';

        try {
            const response = await API.login(email, password);

            if (response.success && response.token) {
                // Save token
                API.setToken(response.token);

                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                Utils.showError('errorMessage', 'Đăng nhập thất bại');
            }
        } catch (error) {
            Utils.showError('errorMessage', error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Đăng nhập';
        }
    });
});
