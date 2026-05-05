import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_THEME = {
  bg: "#F8F7F4",
  text: "#151515",
  accent: "#959595",
  white: "#FFFFFF",
  font: "Montserrat, sans-serif"
};

const getEmailHeader = (title: string) => `
  <div style="background-color: ${EMAIL_THEME.bg}; padding: 40px 20px; text-align: center; border-bottom: 1px solid #E2E0D9;">
    <h1 style="font-family: serif; font-size: 28px; margin: 0; color: ${EMAIL_THEME.text}; font-style: italic;">Bridexx Planet</h1>
    <p style="text-transform: uppercase; letter-spacing: 0.3em; font-size: 10px; margin-top: 5px; color: ${EMAIL_THEME.accent}; font-weight: bold;">Luxury Bridal Atelier</p>
    <h2 style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-top: 20px; color: ${EMAIL_THEME.text};">${title}</h2>
  </div>
`;

const getEmailFooter = () => `
  <div style="background-color: ${EMAIL_THEME.bg}; padding: 40px 20px; text-align: center; border-top: 1px solid #E2E0D9; margin-top: 30px;">
    <p style="font-family: serif; font-style: italic; color: ${EMAIL_THEME.accent}; font-size: 14px; margin-bottom: 20px;">"Confidence is your best accessory - wear it in luxury."</p>
    <div style="margin-bottom: 20px;">
      <a href="https://wa.me/message/SUZYWEGCRSVQO1" style="text-decoration: none; color: ${EMAIL_THEME.white}; background-color: ${EMAIL_THEME.text}; padding: 12px 25px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; display: inline-block;">Message the Atelier</a>
    </div>
    <p style="font-size: 10px; color: ${EMAIL_THEME.accent}; text-transform: uppercase; letter-spacing: 0.1em;">© ${new Date().getFullYear()} Bridexx Planet. All Rights Reserved.</p>
  </div>
`;

export const app = express();
app.use(express.json());

app.get("/api/verify-email-service", async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    res.status(200).json({ status: "success", message: "Resend configuration detected" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "Verification failed" });
  }
});

// 1. Order Confirmation Email
app.post("/api/send-order-email", async (req, res) => {
  const { customer, order, measurements } = req.body;
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: "Resend not configured" });

  try {
    const { data, error } = await resend.emails.send({
      from: "Bridexx Planet <ceo@shop.bridexxplanet.com>",
      to: [customer.email, "ceo@shop.bridexxplanet.com"],
      subject: `Your Selection at Bridexx Planet - Order ${order.id}`,
      html: `
        <div style="font-family: ${EMAIL_THEME.font}; color: ${EMAIL_THEME.text}; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_THEME.white};">
          ${getEmailHeader("Order Confirmation")}
          
          <div style="padding: 40px 30px;">
            <p>Dear ${customer.name},</p>
            <p>It is our pleasure to confirm your order. Your choice reflects a taste for timeless elegance, and our artisans are honored to begin the meticulous process of crafting your masterpiece.</p>
            
            <div style="margin: 30px 0; padding: 20px; border: 1px solid #E2E0D9;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 20px; border-bottom: 1px solid #F0F0F0; padding-bottom: 10px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_THEME.accent};">Order ID:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_THEME.accent};">Item:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.productName || 'Bespoke Item'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_THEME.accent};">Amount Paid:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₦${order.totalAmount?.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 15px;">Authenticated Measurements</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                ${Object.entries(measurements).filter(([_, v]) => v).map(([k, v]) => `
                  <div style="padding: 5px 0; border-bottom: 1px solid #FAFAFA;">
                    <span style="color: ${EMAIL_THEME.accent}; text-transform: uppercase;">${k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span style="font-weight: bold; float: right;">${v}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 15px;">Shipping Destination</h3>
              <p style="font-size: 13px; line-height: 1.6; color: ${EMAIL_THEME.accent};">
                ${customer.address}<br/>
                ${customer.phone}
              </p>
            </div>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });

    if (error) throw error;

    console.log(`Order email sent successfully to ${customer.email} for Order ${order.id}`);
    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    console.error("Order email error:", err);
    res.status(500).json({ error: "Email delivery failed", details: err.message });
  }
});

// 2. Booking Confirmation Email
app.post("/api/send-booking-email", async (req, res) => {
  const { booking } = req.body;
  try {
    const { data, error } = await resend.emails.send({
      from: "Bridexx Planet <hello@shop.bridexxplanet.com>",
      to: [booking.email, "ceo@shop.bridexxplanet.com"],
      subject: `Your Consultation Request - Bridexx Planet`,
      html: `
        <div style="font-family: ${EMAIL_THEME.font}; color: ${EMAIL_THEME.text}; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_THEME.white};">
          ${getEmailHeader("Consultation Secured")}
          
          <div style="padding: 40px 30px;">
            <p>Hello ${booking.name},</p>
            <p>Your request for a private consultation at the Bridexx Planet Atelier has been received. We are eager to discuss your vision for your special day.</p>
            
            <div style="margin: 30px 0; padding: 25px; background-color: ${EMAIL_THEME.bg}; border-radius: 4px;">
              <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 15px 0; color: ${EMAIL_THEME.accent};">Proposed Schedule</h3>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${new Date(booking.consultationDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="font-size: 14px; color: ${EMAIL_THEME.text};">${booking.preferredTime} WAT</div>
              
              <div style="margin-top: 20px; font-size: 12px;">
                <div style="margin-bottom: 5px;"><strong style="color: ${EMAIL_THEME.accent};">LOOK TYPE:</strong> ${booking.lookType}</div>
                <div><strong style="color: ${EMAIL_THEME.accent};">EVENT DATE:</strong> ${booking.eventDate}</div>
              </div>
            </div>

            <p style="font-size: 13px; color: ${EMAIL_THEME.accent}; line-height: 1.6;">Our team will reach out shortly via phone (${booking.phone}) to finalize the appointment details.</p>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });

    if (error) throw error;

    console.log(`Booking email sent successfully to ${booking.email}`);
    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    console.error("Booking email error:", err);
    res.status(500).json({ error: "Email delivery failed", details: err.message });
  }
});

// 3. Status Update Email
app.post("/api/send-status-email", async (req, res) => {
  const { email, orderId, oldStatus, newStatus, customerName } = req.body;
  try {
    const { data, error } = await resend.emails.send({
      from: "Bridexx Planet <ceo@shop.bridexxplanet.com>",
      to: [email, "ceo@shop.bridexxplanet.com"],
      subject: `Order Status Update - Order ${orderId}`,
      html: `
        <div style="font-family: ${EMAIL_THEME.font}; color: ${EMAIL_THEME.text}; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_THEME.white};">
          ${getEmailHeader("Status Update")}
          
          <div style="padding: 40px 30px; text-align: center;">
            <p style="text-align: left;">Dear ${customerName},</p>
            <p style="text-align: left;">Your order journey has progressed. We are pleased to inform you that your masterpiece is moving closer to completion.</p>
            
            <div style="margin: 40px 0; display: flex; align-items: center; justify-content: center; gap: 20px;">
              <div style="text-transform: uppercase; font-size: 10px; color: ${EMAIL_THEME.accent}; letter-spacing: 0.1em; opacity: 0.5;">${oldStatus}</div>
              <div style="font-size: 20px; color: ${EMAIL_THEME.accent};">→</div>
              <div style="text-transform: uppercase; font-size: 14px; font-weight: bold; letter-spacing: 0.2em; border: 1px solid ${EMAIL_THEME.text}; padding: 10px 20px;">${newStatus}</div>
            </div>

            <p style="font-size: 13px; color: ${EMAIL_THEME.accent}; line-height: 1.6; text-align: left;">
              Log into your dashboard at any time to see the latest details regarding your fit and delivery schedule.
            </p>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });

    if (error) throw error;

    console.log(`Status update email sent successfully to ${email}`);
    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    console.error("Status email error:", err);
    res.status(500).json({ error: "Email delivery failed", details: err.message });
  }
});

// 4. Welcome Email
app.post("/api/send-welcome-email", async (req, res) => {
  const { email, name } = req.body;
  try {
    const { data, error } = await resend.emails.send({
      from: "Bridexx Planet <hello@shop.bridexxplanet.com>",
      to: email,
      subject: `Welcome to the Bridexx Planet Atelier`,
      html: `
        <div style="font-family: ${EMAIL_THEME.font}; color: ${EMAIL_THEME.text}; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_THEME.white};">
          ${getEmailHeader("A Legacy Begins")}
          
          <div style="padding: 40px 30px; text-align: center;">
            <p style="text-align: left;">Dear ${name},</p>
            <p style="text-align: left;">Welcome to Bridexx Planet. You have just taken the first step into a world where bridal fashion meets architectural precision and bespoke artistry.</p>
            
            <div style="margin: 40px 0; padding: 30px; border: 1px solid #E2E0D9; display: inline-block;">
              <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; margin: 0; color: ${EMAIL_THEME.accent}; mb-5;">Profile Activated</p>
              <div style="font-size: 18px; font-weight: bold; margin-top: 10px;">${email}</div>
            </div>

            <p style="font-size: 13px; color: ${EMAIL_THEME.accent}; line-height: 1.6; text-align: left;">
              As a registered member of our atelier, you can now:
              <ul style="text-align: left; margin-top: 10px;">
                <li>Track your bespoke dress production in real-time.</li>
                <li>Schedule and manage private consultations.</li>
                <li>Access our exclusive bridal pricing and lookbooks.</li>
              </ul>
            </p>
            
            <div style="margin-top: 30px;">
              <a href="${process.env.APP_URL || '#'}/dashboard" style="text-decoration: none; color: ${EMAIL_THEME.white}; background-color: ${EMAIL_THEME.text}; padding: 15px 30px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; display: inline-block;">Enter Your Dashboard</a>
            </div>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });

    if (error) throw error;

    console.log(`Welcome email sent successfully to ${email}`);
    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    console.error("Welcome email error:", err);
    res.status(500).json({ error: "Email delivery failed", details: err.message });
  }
});

// 5. Payment Received Email
app.post("/api/send-payment-email", async (req, res) => {
  const { email, orderId, amount, customerName, type } = req.body;
  try {
    const { data, error } = await resend.emails.send({
      from: "Bridexx Planet <ceo@shop.bridexxplanet.com>",
      to: email,
      subject: `Payment Received - Order ${orderId}`,
      html: `
        <div style="font-family: ${EMAIL_THEME.font}; color: ${EMAIL_THEME.text}; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_THEME.white};">
          ${getEmailHeader("Payment Confirmed")}
          
          <div style="padding: 40px 30px; text-align: center;">
            <p style="text-align: left;">Dear ${customerName},</p>
            <p style="text-align: left;">We have successfully received your payment for the <strong>${type}</strong> associated with order ${orderId}.</p>
            
            <div style="margin: 40px 0; padding: 30px; background-color: ${EMAIL_THEME.bg}; border-radius: 8px;">
              <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; margin: 0 0 10px 0; color: ${EMAIL_THEME.accent};">Transaction Amount</p>
              <div style="font-size: 28px; font-weight: bold; color: ${EMAIL_THEME.text};">₦${amount.toLocaleString()}</div>
              <p style="font-size: 11px; margin-top: 15px; color: ${EMAIL_THEME.accent}; uppercase; letter-spacing: 0.1em;">Status: Authenticated & Cleared</p>
            </div>

            <p style="font-size: 13px; color: ${EMAIL_THEME.accent}; line-height: 1.6; text-align: left;">
              This payment keeps your creation moving forward. Our master tailors and logistics team are now proceeding to the next phase of fulfillment.
            </p>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });

    if (error) throw error;

    console.log(`Payment email sent successfully to ${email}`);
    res.status(200).json({ status: "success", data });
  } catch (err: any) {
    console.error("Payment email error:", err);
    res.status(500).json({ error: "Email delivery failed", details: err.message });
  }
});

// 6. Paystack Verification
app.post("/api/verify-payment", async (req, res) => {
  const { reference } = req.body;
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET) {
    return res.status(500).json({ error: "Paystack secret key not configured" });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      res.status(200).json({ status: "success", data: data.data });
    } else {
      res.status(400).json({ status: "error", message: data.message || "Verification failed" });
    }
  } catch (err) {
    console.error("Paystack verification error:", err);
    res.status(500).json({ error: "Verification process failed" });
  }
});
