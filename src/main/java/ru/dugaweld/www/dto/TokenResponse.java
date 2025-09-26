package ru.dugaweld.www.dto;

public class TokenResponse {
    private String token;
    private String refreshToken;

    public TokenResponse(String token) {
        this.token = token;
    }

    public TokenResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}




