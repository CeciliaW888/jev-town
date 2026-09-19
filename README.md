# Signal Town

A local browser game where you are the Town Crier. Write one broadcast and 24 citizens decide, in parallel, whether to **investigate**, **join**, **flee**, **warn**, or **ignore** it.

The game uses one batched Jev `choice` request per round. Every citizen has a distinct role and personality, so the same announcement can split the town in surprising ways. Your directive changes each round. Balance trust and unrest while building a streak.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
TYPESAFE_API_KEY="$(<~/.config/typesafe/api_key)" npm run dev
```

Open <http://localhost:5173>.

The key is read only by the local Express backend on port `8787`; it is never sent to the browser. If the key is missing or Jev is unavailable, the game remains playable with a clearly labelled deterministic simulation fallback.

## Play

1. Read the round directive and its two hidden-in-plain-sight scoring goals.
2. Write a town-wide broadcast, or choose a prompt chip.
3. Watch all 24 citizens move according to their typed Jev decision.
4. Use the result chart and citizen confidence indicators to tune your next broadcast.
5. Keep trust above zero and unrest below 100 for six rounds.

## Verification

```bash
npm test
npm run build
```

The test suite covers scoring, reducer state, fallback determinism, request validation, response mapping, API-key isolation, and the exact five-action Jev schema.

## Public demo

The GitHub Pages build runs the deterministic simulation because a static site cannot keep an API key secret. It is labelled **Simulation** in the interface. Clone and run the project locally with `TYPESAFE_API_KEY` to play with real Jev decisions.

## Architecture

- `src/`: React/Vite game UI and animated town map
- `server/`: Express API, Jev adapter, validation, and fallback simulation
- `shared/`: citizens, action schema, scoring, positions, and wire protocol
- `tests/`: Vitest suite

One server request sends 24 typed `choice` questions to Jev. The response is validated and mapped back to the matching citizen. Invalid or missing answers are filled locally so a partial model response cannot break the round.
