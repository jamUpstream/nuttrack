import React from 'react';

import AuthScreenShell from '../components/AuthScreenShell';

export default function SignUpScreen({ navigation }: any) {
  return <AuthScreenShell mode="signup" navigation={navigation} />;
}
