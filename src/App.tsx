import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { initFirebase } from './core/firebase/config';

const App: React.FC = () => {
  useEffect(() => {
    initFirebase();
  }, []);
  return <AppNavigator />;
};

export default App;