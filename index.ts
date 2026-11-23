import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
import { PanelUIProvider, useThemeMode } from 'panelui-native';
import './global.css';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
function StrideRoot() {
  const { setMode } = useThemeMode();

  useEffect(() => {
    setMode('dark');
  }, [setMode]);

  return React.createElement(App);
}

function Root() {
  return React.createElement(PanelUIProvider, null, React.createElement(StrideRoot));
}

registerRootComponent(Root);
