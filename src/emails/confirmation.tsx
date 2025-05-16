
import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';

export const ConfirmationEmail = ({ data }) => (
  <EmailLayout preview="Confirm your email address">
    <Text style={paragraph}>
      Hi {data.firstName},<br /><br />
      Please confirm your email by clicking the link below:
    </Text>
    <Button style={button} href={`${process.env.EMAIL_BASE_URL}/api/v1/auth/email-confirmation/receive/${data.code}`}>
      Confirm Email Address
    </Button>
    <Text style={paragraph}>
      Your email will be confirmed now by clicking the link above.
    </Text>
    <Text style={paragraph}>— The SonicJs team</Text>
  </EmailLayout>
);

export default ConfirmationEmail;
