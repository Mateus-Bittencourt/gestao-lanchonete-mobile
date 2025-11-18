import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/login/LoginScreen';
import SalesScreen from '../screens/sales/SalesScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

export type RootStackParamList = {
  Login: undefined;
  Sales: undefined;
  Inventory: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Sales" component={SalesScreen} options={{ title: 'Vendas' }} />
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Estoque' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Relatórios' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;