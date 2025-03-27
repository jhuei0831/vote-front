import axios from "axios"

/**
 * 檢查 Token 是否有效
 * @param token - 要檢查的 JWT Token
 * @returns Promise<boolean> - 如果有效則返回 true，否則返回 false
 */
export async function isTokenValid(): Promise<boolean> {
  try {
    const response = await axios.post(
      "https://vote.oxtomato.com/v1/user/check-auth",
      {},
      {
        withCredentials: true,
      }
    )
    return response.status === 200 // 如果回應狀態碼是 200，表示 Token 有效
  } catch (error) {
    console.error("Token validation failed:", error)
    return false // 如果請求失敗，表示 Token 無效
  }
}