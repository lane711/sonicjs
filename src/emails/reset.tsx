
import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { paragraph } from './styles';


export const PasswordResetEmail = (baseUrl, user = { firstName: 'John' }, code = '123456', expirationTime = '10 minutes') => (
  <EmailLayout preview="Reset your password">
    {user.firstName && (
      <Text style={paragraph}>
        Hi {user.firstName},
      </Text>
    )}
    <Text style={paragraph}>
      We received a request to reset your password. Click the button below to create a new password:
    </Text>
    <Button style={button} href={`${baseUrl}/api/v1/auth/password/reset/${code}`}>
      Reset Password
    </Button>
    <Text style={paragraph}>
      This password reset link will expire in {expirationTime}. If you did not request a password reset, please ignore this email.
    </Text>
    <Text style={paragraph}>
      For security, this link can only be used once. If you need to reset your password again, please request a new link.
    </Text>
    <Text style={paragraph}>— The SonicJs team</Text>
  </EmailLayout>
);

export default PasswordResetEmail;
