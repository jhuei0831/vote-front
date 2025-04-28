import api from "@/utils/api";

export type Question = {
  id: string;
  title: string;
  updated_at: string;
};

export async function fetchQuestions(voteId: string, page: number, size: number) {
  try {
    const response = await api.get("/v1/question/list/"+voteId, { params: { page, size } });
    return response.data;
  } catch (err) {
    console.error(err);
    return { data: [], pagination: { total: 0, total_pages: 0 } };
  }
}

export async function handleDelete(id: string) {
  if (confirm("Are you sure you want to delete this question?")) {
    try {
      const response = await api.delete(`/v1/question/`, { data: [id] });
      alert(response.data.msg);
      window.location.reload();
    } catch (err) {
      alert("Failed to delete question.");
      console.log(err);
    }
  }
}