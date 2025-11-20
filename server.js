import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// SECURITY: API KEY CHECKER
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API Key" });
  }
  next();
});

// Simple Cache (5 min)
let cache = {};
const cacheTime = 5 * 60 * 1000;

function cachedFetch(key, fetchFn) {
  return new Promise(async (resolve, reject) => {
    if (cache[key] && Date.now() - cache[key].time < cacheTime) {
      return resolve(cache[key].data);
    }
    try {
      const data = await fetchFn();
      cache[key] = { data, time: Date.now() };
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

// BASE URL (SOURCE)
const BASE = "https://free-ff-api-src-5plp.onrender.com/api/v1";

// =====================================
// 1️⃣ ACCOUNT LOOKUP
// =====================================
app.get("/account", async (req, res) => {
  const { region, uid } = req.query;

  if (!region || !uid) {
    return res.status(400).json({ error: "Missing region or uid" });
  }

  try {
    const data = await cachedFetch(`/acc-${region}-${uid}`, async () => {
      const response = await axios.get(
        `${BASE}/account?region=${region}&uid=${uid}`
      );
      return response.data;
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account data" });
  }
});

// =====================================
// 2️⃣ PLAYER STATS
// =====================================
app.get("/playerstats", async (req, res) => {
  const { region, uid } = req.query;

  if (!region || !uid) {
    return res.status(400).json({ error: "Missing region or uid" });
  }

  try {
    const data = await cachedFetch(`/stats-${region}-${uid}`, async () => {
      const response = await axios.get(
        `${BASE}/playerstats?region=${region}&uid=${uid}`
      );
      return response.data;
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

// =====================================
// 3️⃣ CRAFTLAND PROFILE
// =====================================
app.get("/craftlandProfile", async (req, res) => {
  const { region, uid } = req.query;

  if (!region || !uid) {
    return res.status(400).json({ error: "Missing region or uid" });
  }

  try {
    const data = await cachedFetch(`/craft-${region}-${uid}`, async () => {
      const response = await axios.get(
        `${BASE}/craftlandProfile?region=${region}&uid=${uid}`
      );
      return response.data;
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// =====================================
// 4️⃣ GUILD INFO
// =====================================
app.get("/guildInfo", async (req, res) => {
  const { region, uid } = req.query;

  if (!region || !uid) {
    return res.status(400).json({ error: "Missing region or uid" });
  }

  try {
    const data = await cachedFetch(`/guild-${region}-${uid}`, async () => {
      const response = await axios.get(
        `${BASE}/guildInfo?region=${region}&uid=${uid}`
      );
      return response.data;
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guild info" });
  }
});

// ROOT TEST
app.get("/", (req, res) => {
  res.send("DawensFF API is running...");
});

// START SERVER

export default app;
