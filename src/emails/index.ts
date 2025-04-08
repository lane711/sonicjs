// Import all email components
import { OTPEmail } from './otp';
import { WelcomeEmail } from './welcome';

// Map of email components
const emailComponents = {
    'otp': OTPEmail,
    'welcome': WelcomeEmail,
};

// Function to get email component by name
export function getEmailComponent(name: string) {
    return emailComponents[name as keyof typeof emailComponents];
}

// Export the array of available email names
export const availableEmails = Object.keys(emailComponents); 