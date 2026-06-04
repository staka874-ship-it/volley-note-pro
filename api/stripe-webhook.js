const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await upsertSubscription({
        team_slug: session.metadata.team_slug,
        team_name: session.metadata.team_name,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await upsertSubscription({
        team_slug: subscription.metadata.team_slug,
        team_name: subscription.metadata.team_name,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

async function upsertSubscription(row) {
  if (!row.team_slug) return;
  const { error } = await supabase
    .from("volley_note_subscriptions")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "team_slug" });
  if (error) throw error;
}
