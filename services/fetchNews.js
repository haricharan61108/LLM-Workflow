import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function getNews() {
  try {
    const indiaURL = `https://newsapi.org/v2/everything?q=india&pageSize=5&apiKey=${NEWS_API_KEY}`;
    const globalURL = `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;

    const [indiaResponse, globalResponse] = await Promise.all([
      axios.get(indiaURL),
      axios.get(globalURL),
    ]);

    const indiaArticles = indiaResponse?.data?.articles || [];
    const globalArticles = globalResponse?.data?.articles || [];

    const simplifiedArticles = [
      ...indiaArticles.map((article) => ({
        title: article.title,
        url: article.url,
        description: article.description || "No description available",
        category: "India",
      })),
      ...globalArticles.map((article) => ({
        title: article.title,
        url: article.url,
        description: article.description || "No description available",
        category: "World",
      })),
    ];

    return simplifiedArticles;
  } catch (error) {
    console.error("Error fetching news:", error?.message);
    throw new Error("Failed to fetch news");
  }
}
