import axios from "axios";

export const extractFromFastAPI = async (text) => {
    try {
        const res = await axios.post("http://localhost:8000/parse", { text });
        return res.data;
    } catch (error) {
        console.error("FastAPI Error:", error.message);
        throw new Error("Failed to parse resume text.");
    }
};