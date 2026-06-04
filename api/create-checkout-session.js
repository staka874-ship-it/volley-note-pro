const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { teamSlug, teamName } = req.body || {};
    if (!teamSlug || !teamName) {
      res.status(400).json({ error: "teamSlug and teamName are required" });
      return;
    }

    const origin = req.headers.origin || process.env.PUBLIC_APP_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: teamSlug,
      metadata: {
        team_slug: teamSlug,
        team_name: teamName
      },
      subscription_data: {
        metadata: {
          team_slug: teamSlug,
          team_name: teamName
        }
      },
      success_url: `${origin}/?checkout=success&team=${encodeURIComponent(teamSlug)}`,
      cancel_url: `${origin}/?checkout=cancel&team=${encodeURIComponent(teamSlug)}`
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
