import React from 'react';

import AuthScreenShell from '../components/AuthScreenShell';

export default function LoginScreen({ navigation }: any) {
  return <AuthScreenShell mode="login" navigation={navigation} />;
}
