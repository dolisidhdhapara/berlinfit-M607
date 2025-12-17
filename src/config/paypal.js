const paypal = require('@paypal/checkout-server-sdk');

const getPayPalClient = () => {
    let environment;
    if (process.env.PAYPAL_ENV === 'sandbox') {
        environment = new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        );
    } else {
        // production
        environment = new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        );
    }
    return new paypal.core.PayPalHttpClient(environment);
};

module.exports = { getPayPalClient };
