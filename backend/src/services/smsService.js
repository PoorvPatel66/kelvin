import AppError from '../utils/AppError.js';

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AppError(`SMS delivery is not configured (${name}).`, 503);
  }

  return value;
}

export async function sendAdminLoginOtp({ mobile, otp, expiresInMinutes }) {
  const deliveryMode = process.env.ADMIN_OTP_DELIVERY_MODE?.trim().toLowerCase() || 'sms';

  if (deliveryMode === 'development') {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Development OTP delivery cannot be used in production.', 503);
    }

    return {
      delivered: true,
      developmentOtp: otp
    };
  }

  const endpoint = required('SMS_PROVIDER_URL');
  const apiKey = required('SMS_PROVIDER_API_KEY');
  const templateId = required('SMS_OTP_TEMPLATE_ID');

  let response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: mobile,
        templateId,
        variables: {
          otp,
          expiresInMinutes: String(expiresInMinutes)
        }
      }),
      signal: AbortSignal.timeout(10_000)
    });
  } catch {
    throw new AppError('Unable to contact the SMS provider.', 502);
  }

  if (!response.ok) {
    throw new AppError('The SMS provider could not deliver the OTP.', 502);
  }

  return { delivered: true };
}
