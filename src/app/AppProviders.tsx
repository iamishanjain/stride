import React from 'react';
import { PanelUIProvider } from 'panelui-native';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <PanelUIProvider>{children}</PanelUIProvider>;
}
