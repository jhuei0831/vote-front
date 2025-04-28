import api from "@/utils/api";

/**
 * 密碼列表的型別定義
 * @typedef {Object} Password
 * @property {string} id - 密碼的唯一識別碼
 * @property {string} password - 密碼的內容
 * @property {string} status - 密碼的狀態（例如：有效或無效）
 */
export type Password = {
  id: string;
  password: string;
  status: string;
};

export const formatOptions = [
  { value: "int", label: "Number" },
  { value: "en",  label: "Symbol" },
  { value: "mix", label: "Number + Symbol" },
  { value: "mixExcl", label: "Number + Symbol(exclude special)" },
  { value: "mixLower", label: "Number + Symbol(Lowercase exclude special)" },
  { value: "mixUpper", label: "Number + Symbol(Uppercase exclude special)" },
];

/**
 * 獲取密碼列表
 * @param voteId 投票ID
 * @param page 頁碼
 * @param size 每頁大小
 * @returns 
 */
export async function fetchPasswords(voteId:string, page: number, size: number) {
  try {
    const response = await api.get("/v1/password/list/"+voteId, { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

/**
 * 解密密碼
 * @param passwords 密碼列表
 * @returns 解密後的密碼列表
 */
export async function decryptPasswords(passwords: Password[]) {
  try {
    // 處理Password的資料，只取出password的值
    const passwordsToDecrypt = passwords.map((password) => password.password);
    
    // 發送請求到後端進行解密
    // 這裡假設後端的API是 /v1/password/decrypt
    // 並且需要傳遞一個包含密碼的陣列
    const response = await api.post("/v1/password/decrypt", passwordsToDecrypt);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 刪除密碼
 * @param id 密碼ID
 * @returns {Promise<void>}
 */
export async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this password?")) {
    try {
      const response = await api.delete(`/v1/password/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete password.");
      console.log(err);
    }
  }
}