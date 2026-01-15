// functions/src/index.ts
import * as admin from "firebase-admin";
import express from "express";
import {onRequest} from "firebase-functions/v2/https";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

// GET /api/reflections  (Hosting rewrites /api/** to this function)
app.get("/reflections", async (_req, res) => {
  try {
    const snap = await db
      .collection("reflections")
      .orderBy("createdAt", "desc")
      .get();

    const items = snap.docs.map((d) => ({id: d.id, ...d.data()}));
    res.json(items);
  } catch (e: any) {
    res.status(500).json({
      error: "failed to list reflections",
      details: String(e?.message || e),
    });
  }
});

// POST /api/reflections
app.post("/reflections", async (req, res) => {
  try {
    const {title, summary, citation, tags} = req.body || {};
    if (!title) {
      res.status(400).json({error: "title required"});
      return;
    }
    const now = admin.firestore.Timestamp.now();
    const docRef = await db.collection("reflections").add({
      title,
      summary: summary ?? "",
      citation: citation ?? "",
      tags: tags ?? "",
      createdAt: now,
      updatedAt: now,
    });
    const snap = await docRef.get();
    res.status(201).json({id: docRef.id, ...snap.data()});
  } catch (e: any) {
    res.status(500).json({
      error: "failed to create",
      details: String(e?.message || e),
    });
  }
});

// v2 export (region set here)
export const api = onRequest({region: "us-central1"}, app);
