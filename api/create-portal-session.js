const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { teamSlug } = req.body || {};
    if (!teamSlug) {
      res.status(400).json({ error: "teamSlug is required" });
      return;
    }

    const { data, error } = await supabase
      .from("volley_note_subscriptions")
      .select("stripe_customer_id")
      .eq("team_slug", teamSlug)
      .single();

    if (error || !data?.stripe_customer_id) {
      res.status(404).json({ error: "Subscription customer not found" });
      return;
    }

    const origin = req.headers.origin || process.env.PUBLIC_APP_URL;
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${origin}/?billing=portal_return`
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
