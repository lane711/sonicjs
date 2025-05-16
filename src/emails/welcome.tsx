import {
  Button,
  Link,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { button } from './styles';
import { anchor } from './styles';
import { paragraph } from './styles';

export const WelcomeEmail = ({ data }) => (
  <EmailLayout preview="You're now ready to login to SonicJs!">
    <Text style={paragraph}>
      Hi {data.firstName},<br /><br />
      Thanks for submitting your account information. You're now ready to
      login to SonicJs!
    </Text>
    <Button style={button} href="https://sonicjs.com/login">
      Login to SonicJs
    </Button>
    <Text style={paragraph}>
      If you haven't already {' '}
      <Link style={anchor} href="https://sonicjs.com/docs">
      reviewed the docs
      </Link>{' '}
      , you might find them handy.
    </Text>
    <Text style={paragraph}>— The SonicJs team</Text>
  </EmailLayout>
);

export default WelcomeEmail;
