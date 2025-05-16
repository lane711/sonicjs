import { Button, Link, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

export const ConfirmationEmail= ( data ) => (
  <EmailLayout preview="Let's get your email confirmed!">
    <Text style={paragraph}>Hi {data.firstName},</Text>
    <Text style={paragraph}>Please confirm your email by clicking the link below:</Text>
    <Text style={otp}>{data.otp ?? "ABC123"} </Text>

    <Text style={paragraph}>
      Your email will be confirmed now by clicking the link above.
    </Text>
    <hr style={hr} />
    <Text style={paragraph}>
      Didn't request this? Please ignore this email.
    </Text>
    <hr style={hr} />
    <Text style={paragraph}>— The SonicJs team</Text>
  </EmailLayout>
);

export default ConfirmationEmail;

// Styles for the unique content
const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const otp = {
  color: "#fbfbfb",
  fontSize: "46px",
  lineHeight: "48px",
  textAlign: "center" as const,
  backgroundColor: "#555",
  padding: "40px",
  margin: "60px",
  borderRadius: "5px",
};
const anchor = {
  color: "#556cd6",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "10px",
};
