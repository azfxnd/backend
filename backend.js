// === backend.js ===

const express = require("express");
const app = express();
app.use(express.json());

const universeServers = {}; 
const REQUIRED_SERVER_COUNT = 100;

app.post("/playerJoin", (req, res) => {
  const { universeId, playerId } = req.body;
  if (!universeId || !playerId) return res.sendStatus(400);

  if (!universeServers[universeId] || universeServers[universeId].length < REQUIRED_SERVER_COUNT) {
    return res.status(428).json({ message: "Need to generate reserved servers", needed: REQUIRED_SERVER_COUNT });
  }

  const servers = universeServers[universeId];

  // Find the best server under capacity
  let target = null;

  servers.forEach(s => {
    if (s.players.length < 50) {
      if (!target || s.players.length > target.players.length) {
        target = s;
      }
    }
  });

  // If all servers are full, signal the frontend to generate more
  if (!target) {
    return res.status(428).json({ message: "All servers full, need to generate more." });
  }

  target.players.push(playerId);
  res.json({ serverCode: target.code });
});

app.post("/playerLeave", (req, res) => {
  const { universeId, playerId } = req.body;
  if (!universeId || !playerId) return res.sendStatus(400);

  const servers = universeServers[universeId];
  if (!servers) return res.sendStatus(404);

  servers.forEach(s => {
    s.players = s.players.filter(p => p !== playerId);
  });

  res.sendStatus(200);
});

app.post("/addServer", (req, res) => {
  const { universeId, serverCode } = req.body;
  if (!universeId || !serverCode) return res.sendStatus(400);

  if (!universeServers[universeId]) universeServers[universeId] = [];
  universeServers[universeId].push({ code: serverCode, players: [] });
  res.sendStatus(200);
});

app.get("/serverCount", (req, res) => {
  const universeId = req.query.universeId;
  if (!universeId) return res.sendStatus(400);

  const count = universeServers[universeId]?.length || 0;
  res.json({ count });
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
