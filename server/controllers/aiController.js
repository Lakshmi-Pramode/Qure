import { GoogleGenerativeAI } from "@google/generative-ai";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";
import Queue from "../models/Queue.js";

// Initialize lazy so the server doesn't crash on boot if the key is missing
let genAI = null;

const initGemini = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Fetches live data from MongoDB and builds a context string for the AI.
 */
const buildDataContext = async () => {
  try {
    const [hospitals, doctors, queues] = await Promise.all([
      Hospital.find().lean(),
      Doctor.find().populate("hospitalId", "name").lean(),
      Queue.find().populate({ path: "doctorId", populate: { path: "hospitalId", select: "name" } }).lean(),
    ]);

    const hospitalSummary = hospitals.map((h) => {
      const hospitalDoctors = doctors.filter(
        (d) => d.hospitalId?._id?.toString() === h._id.toString()
      );
      const hospitalQueues = queues.filter(
        (q) => hospitalDoctors.some((d) => d._id.toString() === q.doctorId?._id?.toString())
      );
      const totalWaiting = hospitalQueues.reduce((sum, q) => sum + (q.waitingCount || 0), 0);
      return `- ${h.name} (${h.address}): ${h.departments?.join(", ") || "General"} | Contact: ${h.contact} | Doctors: ${hospitalDoctors.length} | Total people waiting: ${totalWaiting}`;
    }).join("\n");

    const doctorSummary = doctors.map((d) => {
      const queue = queues.find((q) => q.doctorId?._id?.toString() === d._id.toString());
      const waitingCount = queue?.waitingCount || 0;
      const currentToken = queue?.currentToken || 0;
      const estimatedWait = waitingCount * (d.consultationTime || 15);
      return `- Dr. ${d.name} | ${d.specialization} | ${d.experience} yrs exp | ₹${d.consultationFee} fee | ~${d.consultationTime} min/patient | Status: ${d.availabilityStatus} | Accepting: ${d.isAcceptingAppointments ? "Yes" : "No"} | Hospital: ${d.hospitalId?.name || "Unknown"} | Queue: ${waitingCount} waiting (token #${currentToken}) | Est. wait: ~${estimatedWait} min`;
    }).join("\n");

    const queueSummary = queues.map((q) => {
      const doctorName = q.doctorId?.name || "Unknown";
      const hospitalName = q.doctorId?.hospitalId?.name || "Unknown";
      return `- Dr. ${doctorName} at ${hospitalName}: Token #${q.currentToken}, ${q.waitingCount} waiting`;
    }).join("\n");

    return `
=== LIVE SYSTEM DATA (as of ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}) ===

HOSPITALS (${hospitals.length} total):
${hospitalSummary || "No hospitals registered yet."}

DOCTORS (${doctors.length} total):
${doctorSummary || "No doctors registered yet."}

QUEUES:
${queueSummary || "No active queues right now."}
`;
  } catch (error) {
    console.error("Error fetching data context:", error.message);
    return "\n[Could not load live data from the system]\n";
  }
};

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    const ai = initGemini();
    if (!ai) {
      return res.status(500).json({ 
        message: "Gemini AI is not configured. Please add GEMINI_API_KEY to your .env file." 
      });
    }

    const dataContext = await buildDataContext();

    const systemPrompt = `You are **Qure AI Assistant**, an intelligent healthcare queue management assistant.

## Your Capabilities
- Help patients find the best hospital based on queue length, departments, and location.
- Recommend doctors by specialization, experience, fees, and current availability.
- Provide real-time queue status and estimated waiting times.
- Suggest the best time to visit based on current queue data.
- Answer general healthcare-related questions.

## Rules
1. ALWAYS base your answers on the LIVE SYSTEM DATA provided below. Do NOT make up hospital names, doctor names, or queue numbers.
2. If the data shows no hospitals or doctors, tell the user the system is still being set up.
3. Keep answers concise, friendly, and helpful.
4. Use bullet points and bold text for readability.
5. When recommending, explain WHY (e.g., "shortest queue", "most experienced", "lowest fee").
6. Include estimated wait times when discussing queues.
7. If a question is outside healthcare/queue scope, politely redirect.

${dataContext}

## User Question:
${prompt}`;

    const model = ai.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response.text();

    res.status(200).json({ answer: response });
  } catch (error) {
    console.error("AI Controller Error:", error.message);

    if (error.message?.includes("API_KEY_INVALID")) {
      return res.status(500).json({
        message: "Invalid Gemini API Key. Please double check the key in your .env file.",
      });
    }

    res.status(500).json({
      message: "Something went wrong with the AI service. Please try again.",
    });
  }
};