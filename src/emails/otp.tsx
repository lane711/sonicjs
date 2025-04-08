import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { EmailProps } from './types';

const baseUrl = process.env.EMAIL_BASE_URL
  ? `https://${process.env.EMAIL_BASE_URL}`
  : '';

export const OTPEmail: React.FC<EmailProps> = ({ data }) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>You're now ready to make live transactions with Stripe!</Preview>
      <Container style={container}>
      <Container style={containerPadding}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/public/images/sonicjs-logo-dark.svg`}
            width="300"
            alt="SonicJs"
          />
          <Hr style={hr} />
          <Text style={paragraph}>
            Hi {data.firstName},<br />
            Thanks for submitting your account information. You're now ready to
            make live transactions with Stripe!
          </Text>
          <Text style={paragraph}>
            You can view your payments and a variety of other information about
            your account right from your dashboard.
          </Text>
          <Button style={button} href="https://dashboard.stripe.com/login">
            View your Stripe Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>
            If you haven't finished your integration, you might find our{' '}
            <Link style={anchor} href="https://docs.stripe.com/dashboard/basics">
              docs
            </Link>{' '}
            handy.
          </Text>
          <Text style={paragraph}>— The SonicJs team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Stripe, 354 Oyster Point Blvd, South San Francisco, CA 94080
          </Text>
        </Section>
        </Container>
      </Container>
    </Body>
  </Html>
);

export default OTPEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const containerPadding = {
  margine: '48px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const anchor = {
  color: '#556cd6',
};

const button = {
  backgroundColor: '#656ee8',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '10px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};