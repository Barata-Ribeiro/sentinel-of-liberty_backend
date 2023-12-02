import axios from "axios";
import url from "url";

interface AccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export class AuthServices {
    async discordLoginRedirect(code: string): Promise<AccessTokenResponse> {
        const formData = new url.URLSearchParams();
        formData.append("client_id", process.env.DISCORD_CLIENT_ID || "");
        formData.append(
            "client_secret",
            process.env.DISCORD_CLIENT_SECRET || ""
        );
        formData.append("grant_type", "authorization_code");
        formData.append("code", code);
        formData.append(
            "redirect_uri",
            process.env.DISCORD_CLIENT_REDIRECT_URL || ""
        );

        let tokenData;

        try {
            const tokenResponse = await axios.post(
                "https://discord.com/api/v10/oauth2/token",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            tokenData = tokenResponse.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response)
                throw new Error(error.response.data.message);
        }

        return tokenData;
    }
}
