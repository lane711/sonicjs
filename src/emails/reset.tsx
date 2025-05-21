
import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';

export const PasswordResetEmail = ( user, code, baseUrl) => (
  <EmailLayout preview="Confirm your email address">
    <Text style={paragraph}>
      {user.firstName ? `Hi ${user.firstName},<br /><br />` : ''}
      Please confirm your email by clicking the link below:
    </Text>
    <Button style={button} href={`${baseUrl}/api/v1/auth/password/reset/${code}`}>
      Reset Password
    </Button>
    <Text style={paragraph}>
      Your email will be confirmed now by clicking the link above.
    </Text>
    <Text style={paragraph}>— The SonicJs team</Text>
  </EmailLayout>
);

export default PasswordResetEmail;
