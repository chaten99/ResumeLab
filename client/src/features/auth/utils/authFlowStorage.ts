const VERIFICATION_EMAIL_KEY = "auth:verification-email";
const RESET_EMAIL_KEY = "auth:reset-email";

export const authFlowStorage = {
    setVerificationEmail(email: string) {
        sessionStorage.setItem(
            VERIFICATION_EMAIL_KEY,
            email
        );
    },

    getVerificationEmail() {
        return sessionStorage.getItem(
            VERIFICATION_EMAIL_KEY
        );
    },

    clearVerificationEmail() {
        sessionStorage.removeItem(
            VERIFICATION_EMAIL_KEY
        );
    },

    setResetEmail(email: string) {
        sessionStorage.setItem(
            RESET_EMAIL_KEY,
            email
        );
    },

    getResetEmail() {
        return sessionStorage.getItem(
            RESET_EMAIL_KEY
        );
    },

    clearResetEmail() {
        sessionStorage.removeItem(
            RESET_EMAIL_KEY
        );
    },
};