# Custom 48-Team Champions League Tournament - AI Prompt

**Act as a senior frontend engineer. I need you to build a single-page web app for a custom 48-team football tournament that strictly follows the new UEFA Champions League "Swiss system" format.**

**Repo & Deployment:**
Work directly inside this GitHub repo: https://github.com/MrMarcoAI/baul-de-cosas/tree/main/champions. Build everything in that directory because we're going to deploy this straight to Vercel when it's done.

**Tech Stack:** 
Use React, Next.js, and Tailwind CSS. 

**Initial Data (Seed Teams):**
Seed the application state with the following 48 teams. They are already grouped into 4 Pots (12 teams each) based on their UEFA coefficient. Use this exact structure to handle the initial draw logic:

* **Pot 1:** Bayern, Arsenal, Real Madrid, PSG, Inter, Man City, Barcelona, Liverpool, Leverkusen, Dortmund, Atletico, Aston Villa
* **Pot 2:** Tottenham, Fiorentina, Roma, Chelsea, Porto, Benfica, Brugge, Sporting, Atalanta, Betis, PSV, Milan
* **Pot 3:** Man United, Frankfurt, Olympiakos, Napoli, Fenerbahce, Juventus, Lille, Real Sociedad, Feyenoord, Lyon, Leipzig, Midtjylland
* **Pot 4:** Athletic, Galatasaray, Marseille, Celtic, Ajax, Villarreal, Newcastle, Sevilla, Lens, Como, Spartak, Zenit

**Design & UI (UEFA Vibe):**
*   Heavily base the UX/UI on the official UEFA Champions League fixtures and results page: https://www.uefa.com/uefachampionsleague/fixtures-results/. 
*   Stick to deep navy and midnight purple backgrounds, with neon cyan and magenta glowing accents.
*   Use the "Syne" font family for all headings to give it a bold, modern look, and a clean sans-serif like Inter for the table data.
*   The layout must be modern, sleek, and fully responsive. 

**Core Features & App Logic:**
1.  **Match Input Panel:** A clean form to log match results. Just keep it simple with fields for Home Team, Away Team, Home Score, and Away Score. 
2.  **Dynamic Standings Table:** A single, massive league table showing all 48 teams. 
3.  **Real-Time Math:** Points are standard — 3 for a win, 1 for a draw, 0 for a loss. The table must automatically re-sort every time I submit a match result. Tiebreakers: Goal Difference (GD), then Goals Scored (GS).
4.  **Visual Cut-offs (Crucial):**
    *   **Ranks 1 — 8:** Highlight these rows with a green or cyan accent. Add a small badge that says "Direct to Round of 16".
    *   **Ranks 9 — 24:** Highlight with a yellow or subtle orange accent. Badge: "Play-offs".
    *   **Ranks 25 — 48:** Dim these rows or use a red accent. Badge: "Eliminated".
5.  **Match Feed:** Below or next to the table, include a scrolling feed or card grid showing the history of the matches I just entered, complete with the final score.
6.  **Interactive Knockout Bracket:** Once the league phase is over, I need a toggle to switch to a visual tournament tree view. This bracket must strictly follow the new UEFA paired seeding logic:
    *   **Play-offs:** Ranks 9 — 16 are seeded and face ranks 17 — 24. 
    *   **Round of 16:** Ranks 1 — 8 get a bye and wait for the play-off winners. The logic must place Rank 1 and Rank 2 on opposite sides of the draw so they can only face each other in the final. 
    *   **Match Logic:** Make the bracket nodes clickable. When I click a matchup, a modal should pop up letting me input the aggregate scores for the two legs. Once submitted, the app needs to automatically push the winning team to the next round on the bracket. Keep it flowing all the way to the final.
7.  **Top Scorers Leaderboard:** Build a totally separate tab or section for the top goalscorers. I need a quick form here with three inputs: Player Name, Team, and Goals to add. When I hit submit, the app should update an existing player's goal tally or add a new guy to the list if he's not there yet. This leaderboard must auto-sort instantly so the player with the most goals is always sitting right at number one.
